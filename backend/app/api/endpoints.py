from fastapi import APIRouter, HTTPException
from typing import Optional
from app.services.pdf_processor import PDFProcessor
from app.services.embeddings import EmbeddingService
from app.services.search import SearchService
from app.core.config import settings
import faiss
from pathlib import Path

router = APIRouter()

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
            print(f"   Buscará en: {settings.embeddings_path}")
    except Exception as e:
        print(f"❌ Error cargando embeddings: {str(e)}")

@router.post("/process-pdf")
async def process_pdf():
    """Procesa el PDF y genera embeddings"""
    try:
        # Procesar PDF
        processor = PDFProcessor(settings.pdf_path)
        chunks = processor.process_book()
        
        # Generar embeddings
        embedding_service = EmbeddingService(settings.embedding_model)
        texts = [chunk["text"] for chunk in chunks]
        embeddings = embedding_service.generate_embeddings(texts)
        
        # Guardar
        embedding_service.save_embeddings(
            embeddings, chunks,
            settings.embeddings_path,
            settings.chunks_path
        )
        
        # Recargar servicio
        global search_service
        index, loaded_chunks = embedding_service.load_embeddings(
            settings.embeddings_path,
            settings.chunks_path
        )
        search_service = SearchService(embedding_service, index, loaded_chunks)
        
        return {
            "message": "PDF procesado exitosamente",
            "chunks_created": len(chunks),
            "status": "success",
            "embeddings_path": str(settings.embeddings_path),
            "chunks_path": str(settings.chunks_path)
        }
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_query(query: str, top_k: Optional[int] = 3):
    """Busca en el libro"""
    global search_service
    
    if search_service is None:
        raise HTTPException(
            status_code=503, 
            detail="Servicio de búsqueda no disponible. Procese el PDF primero."
        )
    
    try:
        results = search_service.search(
            query, 
            top_k=top_k,
            threshold=settings.similarity_threshold
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Endpoint de salud"""
    return {
        "status": "healthy", 
        "service": "AI Book Assistant - Windows",
        "pdf_exists": settings.pdf_path.exists(),
        "embeddings_exist": settings.embeddings_path.exists(),
        "service_loaded": search_service is not None,
        "similarity_threshold": settings.similarity_threshold
    }

@router.get("/system")
async def system_info():
    """Información del sistema"""
    import platform
    import sys
    return {
        "system": platform.system(),
        "release": platform.release(),
        "python": sys.version,
        "python_path": sys.executable
    }