from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.services.pdf_processor import PDFProcessor
from app.services.embeddings import EmbeddingService
from app.services.search import SearchService
from app.core.config import settings
import faiss
from pathlib import Path
import traceback
import json
from datetime import datetime

router = APIRouter()

# --- DEFINICIÓN DE MODELOS ---
class SearchResponse(BaseModel):
    query: str
    answer: str
    results: List[Dict[str, Any]]
    found_results: bool
    top_k_requested: int
    threshold_used: float

# Variables globales para servicios cargados
search_service = None
embedding_service = None

@router.on_event("startup")
async def startup_event():
    """Carga los embeddings al iniciar la app"""
    global search_service, embedding_service
    
    try:
        if settings.embeddings_path.exists() and settings.chunks_path.exists():
            print("🚀 Inicializando servicios...")
            embedding_service = EmbeddingService(settings.embedding_model)
            index, chunks = embedding_service.load_embeddings(
                settings.embeddings_path, 
                settings.chunks_path
            )
            search_service = SearchService(embedding_service, index, chunks)
            print("✅ Servicios inicializados")
        else:
            print("⚠ No se encontraron embeddings pre-entrenados")
    except Exception as e:
        print(f"❌ Error cargando embeddings: {str(e)}")

@router.post("/process-pdf")
async def process_pdf():
    """Procesa el PDF y genera embeddings"""
    try:
        processor = PDFProcessor(settings.pdf_path)
        chunks = processor.process_book()
        
        embedding_service = EmbeddingService(settings.embedding_model)
        texts = [chunk["text"] for chunk in chunks]
        embeddings = embedding_service.generate_embeddings(texts)
        
        embedding_service.save_embeddings(
            embeddings, chunks,
            settings.embeddings_path,
            settings.chunks_path
        )
        
        global search_service
        index, loaded_chunks = embedding_service.load_embeddings(
            settings.embeddings_path,
            settings.chunks_path
        )
        search_service = SearchService(embedding_service, index, loaded_chunks)
        
        return {
            "message": "PDF procesado exitosamente",
            "chunks_created": len(chunks),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search", response_model=SearchResponse)
async def search_query(query: str, top_k: Optional[int] = 3, threshold: Optional[float] = 0.1):
    """Busca en el libro"""
    global search_service
    
    if search_service is None:
        raise HTTPException(
            status_code=503, 
            detail="Servicio de búsqueda no disponible. Procese el PDF primero."
        )
    
    try:
        results = search_service.search(query, top_k=top_k, threshold=threshold)
        return results
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Endpoint de salud"""
    return {
        "status": "healthy", 
        "service_loaded": search_service is not None,
        "pdf_exists": settings.pdf_path.exists()
    }

@router.get("/system")
async def system_info():
    """Información del sistema"""
    import platform
    import sys
    return {
        "system": platform.system(),
        "release": platform.release(),
        "python": sys.version
    }

# --- ENDPOINT DE FEEDBACK (CORREGIDO) ---
@router.post("/feedback")
async def receive_feedback(feedback: Dict[str, Any]):
    """
    Recibe feedback del usuario (útil/no útil) y lo guarda en data/feedback.json
    """
    try:
        feedback_entry = {
            "timestamp": datetime.now().isoformat(),
            "message_id": feedback.get("message_id"),
            "query": feedback.get("query"),
            "useful": feedback.get("useful"),
            "comment": feedback.get("comment", "")
        }
        
        # Asegurar que la carpeta 'data' existe
        data_dir = Path("data")
        data_dir.mkdir(exist_ok=True)
        
        feedback_file = data_dir / "feedback.json"
        
        # Leer datos existentes
        all_feedback = []
        if feedback_file.exists():
            with open(feedback_file, "r", encoding="utf-8") as f:
                try:
                    all_feedback = json.load(f)
                except json.JSONDecodeError:
                    all_feedback = []
        
        # Añadir nuevo feedback
        all_feedback.append(feedback_entry)
        
        # Guardar en el archivo
        with open(feedback_file, "w", encoding="utf-8") as f:
            json.dump(all_feedback, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Feedback guardado: {'Útil' if feedback['useful'] else 'No útil'}")
        return {"status": "success", "message": "Gracias por tu feedback."}
        
    except Exception as e:
        print(f"❌ Error en feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))