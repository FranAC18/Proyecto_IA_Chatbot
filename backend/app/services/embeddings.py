from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import json
from typing import List, Dict, Tuple
from pathlib import Path

class EmbeddingService:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        print(f"📦 Cargando modelo: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.dimension = 384  # Para all-MiniLM-L6-v2
        print("✓ Modelo cargado")
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Genera embeddings para una lista de textos"""
        print(f"🔧 Generando embeddings para {len(texts)} textos...")
        embeddings = self.model.encode(
            texts, 
            show_progress_bar=True,
            convert_to_numpy=True
        )
        print("✓ Embeddings generados")
        return embeddings
    
    def create_vector_store(self, embeddings: np.ndarray) -> faiss.IndexFlatL2:
        """Crea un índice FAISS para búsqueda vectorial"""
        index = faiss.IndexFlatL2(self.dimension)
        
        # Normalizar embeddings para mejor rendimiento
        faiss.normalize_L2(embeddings)
        index.add(embeddings)
        
        print(f"✓ Índice FAISS creado con {index.ntotal} vectores")
        return index
    
    def save_embeddings(self, embeddings: np.ndarray, chunks: List[Dict], 
                        embeddings_path: Path, chunks_path: Path):
        """Guarda embeddings y chunks"""
        print("💾 Guardando embeddings y chunks...")
        
        # Crear directorios si no existen
        embeddings_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Guardar embeddings FAISS
        index = self.create_vector_store(embeddings)
        faiss.write_index(index, str(embeddings_path))
        
        # Guardar chunks
        with open(chunks_path, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Embeddings guardados en: {embeddings_path}")
        print(f"✓ Chunks guardados en: {chunks_path}")
    
    def load_embeddings(self, embeddings_path: Path, chunks_path: Path) -> Tuple[faiss.IndexFlatL2, List[Dict]]:
        """Carga embeddings y chunks"""
        print(f"📂 Cargando embeddings desde: {embeddings_path}")
        
        if not embeddings_path.exists():
            raise FileNotFoundError(f"No se encontró: {embeddings_path}")
        if not chunks_path.exists():
            raise FileNotFoundError(f"No se encontró: {chunks_path}")
        
        # Cargar índice FAISS
        index = faiss.read_index(str(embeddings_path))
        
        # Cargar chunks
        with open(chunks_path, 'r', encoding='utf-8') as f:
            chunks = json.load(f)
        
        print(f"✓ Embeddings cargados: {index.ntotal} vectores")
        print(f"✓ Chunks cargados: {len(chunks)} chunks")
        return index, chunks