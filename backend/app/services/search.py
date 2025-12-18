import numpy as np
import faiss
from typing import List, Dict, Any
import re
from transformers import pipeline

class SearchService:
    def __init__(self, embedding_service, index: faiss.IndexFlatL2, chunks: List[Dict]):
        self.embedding_service = embedding_service
        self.index = index
        self.chunks = chunks
        
        # Mapeo de respuestas predefinidas para interactividad
        self.conversational_responses = {
            "saludo": "¡Hola! Soy tu asistente académico. Estoy listo para ayudarte a encontrar información en el libro de Inteligencia Artificial. ¿Qué te gustaría consultar hoy?",
            "despedida": "¡De nada! Espero que la información te haya sido útil. Estaré aquí si tienes más preguntas sobre el libro. ¡Hasta luego!",
            "agradecimiento": "¡Es un placer ayudarte! ¿Hay algún otro concepto del libro que desees que analice para ti?",
            "feedback_positivo": "Me alegra que la información sea correcta y útil. ¿Necesitas profundizar en algún otro detalle del texto?",
        }

        print("🧠 Cargando motor de análisis...")
        try:
            self.qa_pipeline = pipeline(
                "question-answering", 
                model="mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es",
                tokenizer="mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es"
            )
            print("✅ Motor listo")
        except Exception as e:
            print(f"❌ Error QA: {e}")
            self.qa_pipeline = None

    def _detect_intent(self, query: str) -> str:
        """Detecta si la consulta es una interacción social o una búsqueda"""
        query = query.lower().strip()
        
        # Patrones para saludos
        if re.search(r'\b(hola|buenos días|buenas tardes|saludos)\b', query):
            return "saludo"
        # Patrones para despedidas
        if re.search(r'\b(adiós|chao|hasta luego|nos vemos|finalizar)\b', query):
            return "despedida"
        # Patrones para agradecimientos
        if re.search(r'\b(gracias|muchas gracias|agradezco)\b', query):
            return "agradecimiento"
        # Patrones para confirmar que la info está bien
        if re.search(r'\b(está bien|perfecto|correcto|entendido|buena información)\b', query):
            return "feedback_positivo"
            
        return "busqueda"

    def _clean_text(self, text: str) -> str:
        """Limpieza robusta para textos académicos"""
        text = re.sub(r'(\w+)[-—]\s*(\w+)', r'\1\2', text)
        text = re.sub(r'[-\d\s]{8,}', ' ', text)
        text = re.sub(r'ISBN[\s\w-]*[:\s]*[\d\s-]{10,}', '', text, flags=re.IGNORECASE)
        text = re.sub(r'(FUNDAMENTOS DE LA|UNA VISIÓN INTRODUCTORIA).*?\d+', '', text, flags=re.IGNORECASE | re.DOTALL)
        text = re.sub(r'Figura\s*\d+.*?(Fuente|Elaborado).*?(\.|$)', '', text, flags=re.IGNORECASE)
        text = re.sub(r'[-—]*\s*Página\s*\d+\s*[-—]*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def search(self, query: str, top_k: int = 3, threshold: float = 0.3) -> Dict[str, Any]:
        """Lógica principal con manejo de intenciones conversacionales"""
        
        # 1. PASO NUEVO: Detección de interactividad
        intent = self._detect_intent(query)
        
        if intent != "busqueda":
            print(f"💬 Interacción social detectada: {intent}")
            return {
                "query": query,
                "answer": self.conversational_responses[intent],
                "results": [],
                "found_results": True,
                "top_k_requested": top_k,
                "threshold_used": threshold
            }

        # 2. BÚSQUEDA SEMÁNTICA (Si no es saludo/despedida)
        print(f"\n🔍 Buscando respuesta para: '{query}'")
        query_embedding = self.embedding_service.generate_embeddings([query])
        faiss.normalize_L2(query_embedding)
        
        distances, indices = self.index.search(query_embedding, 15)
        similarities = 1.0 - (distances[0] ** 2) / 2.0
        
        results = []
        concepts = []

        for sim, idx in zip(similarities, indices[0]):
            if idx < 0 or sim < threshold: continue

            chunk = self.chunks[idx]
            clean = self._clean_text(chunk["text"])
            
            if self.qa_pipeline:
                try:
                    qa_res = self.qa_pipeline(question=query, context=clean)
                    if qa_res['score'] > 0.12:
                        val = qa_res['answer'].strip()
                        if len(val) > 6 and val.lower() not in [c.lower() for c in concepts]:
                            concepts.append(val)
                except: pass

            results.append({
                "chunk_id": int(idx),
                "text": clean,
                "similarity_percent": round(float(sim * 100), 2),
                "source": f"Pág. {chunk.get('id', 0) // 3 + 1}",
                "rank": 0
            })

        # 3. SÍNTESIS CON PREGUNTA DE CIERRE (Para interactividad)
        if concepts:
            top_c = concepts[:4]
            if len(top_c) == 1:
                final_answer = f"De acuerdo con el texto, se define esencialmente como {top_c[0].lower()}."
            elif len(top_c) == 2:
                final_answer = f"El libro explica que este concepto abarca {top_c[0].lower()}, integrándose además con {top_c[1].lower()}."
            else:
                final_answer = f"Al analizar el contenido, se observa que el tema se fundamenta en {top_c[0].lower()}, se complementa con {top_c[1].lower()} y se vincula a {top_c[2].lower()}."
            
            final_answer = final_answer[0].upper() + final_answer[1:]
            # Añadir pregunta de interactividad
            final_answer += " ¿Esta información aclara tu duda o necesitas que busque más detalles?"
        
        elif results:
            best = results[0]['text']
            final_answer = f"El libro no ofrece una definición corta, pero analiza el tema en estos términos: \"{best[:250]}...\" ¿Deseas que intente buscar en otra sección?"
        else:
            final_answer = "Lo siento, no encontré información relevante en el libro para esa consulta. ¿Podrías intentar reformular tu pregunta?"

        display_results = results[:top_k]
        for i, r in enumerate(display_results): r['rank'] = i + 1

        return {
            "query": query,
            "answer": final_answer,
            "results": display_results,
            "found_results": len(results) > 0,
            "top_k_requested": top_k,
            "threshold_used": threshold
        }