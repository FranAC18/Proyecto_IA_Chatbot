# Asistente Académico con Inteligencia Artificial  
**Buscador semántico del libro "Introducción a la Inteligencia Artificial: Una visión introductoria"**

Este proyecto es un sistema de búsqueda y extracción de información especializado en el libro mencionado. A diferencia de modelos generativos generales, **todas las respuestas están 100% ancladas al texto original del PDF**, garantizando precisión y fidelidad al contenido del documento.

## Características principales

- **Búsqueda semántica** con FAISS (similitud de coseno) para encontrar pasajes relevantes incluso sin coincidencia exacta de palabras.
- **Extracción precisa** mediante modelo BERT español fine-tuned en SQuAD (mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es).
- **Limpieza robusta** de ruido (ISBN, encabezados, figuras, números de página, etc.) mediante expresiones regulares.
- **Síntesis narrativa** que integra múltiples fragmentos del libro en respuestas coherentes.
- **Interfaz conversacional** moderna con Next.js y Tailwind CSS.
- **Interactividad** (saludos, agradecimientos, despedidas).
- **Feedback del usuario** (👍 / 👎) guardado en JSON para mejorar el sistema sin modificar el libro ni los embeddings.
- **Metadatos** en cada resultado: porcentaje de relevancia, página aproximada y texto literal de la fuente.

## Tecnologías utilizadas

### Backend
- FastAPI
- FAISS (Facebook AI Similarity Search)
- Transformers (Hugging Face)
- Sentence-Transformers (embeddings)

### Frontend
- Next.js 15
- Tailwind CSS
- Lucide React (iconos)
- Axios

## Instalación y configuración

### Requisitos
- Python 3.10+
- Node.js 18+

### Backend
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API para el chatbot académico de IA - Windows/Conda
http://localhost:8000/docs
### Frontend
```
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```
Book AI Assistant
Chatbot académico para libro de IA
http://localhost:3000/
