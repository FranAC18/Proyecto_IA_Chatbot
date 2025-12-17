import numpy as np
import faiss
from typing import List, Dict, Optional

class SearchService:
    def __init__(self, embedding_service, index: faiss.IndexFlatL2, chunks: List[Dict]):
        self.embedding_service = embedding_service
        self.index = index
        self.chunks = chunks
    
    def search(self, query: str, top_k: int = 3, threshold: float = 0.3) -> Dict:
        """Busca chunks similares a la consulta"""
        print(f"🔍 Buscando: '{query}'")
        
        # Generar embedding para la consulta
        query_embedding = self.embedding_service.generate_embeddings([query])
        
        # Normalizar para búsqueda coseno
        faiss.normalize_L2(query_embedding)
        
        # Buscar en FAISS
        distances, indices = self.index.search(query_embedding, top_k)
        
        # Convertir distancias L2 a similitudes coseno
        # Para vectores normalizados: similarity = 1 - distance²/2
        similarities = 1.0 - (distances[0] ** 2) / 2.0
        
        print(f"📊 Similitudes encontradas: {similarities}")
        
        # Filtrar por umbral y preparar resultados
        results = []
        for i, (similarity, idx) in enumerate(zip(similarities, indices[0])):
            if similarity >= threshold and 0 <= idx < len(self.chunks):
                chunk = self.chunks[idx]
                results.append({
                    "chunk_id": int(idx),
                    "text": chunk["text"],
                    "similarity": float(similarity),
                    "similarity_percent": round(float(similarity * 100), 2),
                    "rank": i + 1,
                    "word_count": chunk.get("word_count", len(chunk["text"].split()))
                })
        
        found = len(results) > 0
        print(f"✅ Resultados encontrados: {len(results)}")
        
        return {
            "query": query,
            "results": results,
            "found_results": found,
            "top_k_requested": top_k,
            "threshold_used": threshold
        }