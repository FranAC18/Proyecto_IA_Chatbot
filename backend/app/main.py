from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.core.config import settings

app = FastAPI(
    title="AI Book Assistant API",
    description="API para el chatbot académico de IA - Windows/Conda",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS para Windows
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "AI Book Assistant API - Windows",
        "docs": "http://localhost:8000/docs",
        "endpoints": {
            "health": "/api/v1/health",
            "process_pdf": "/api/v1/process-pdf",
            "search": "/api/v1/search",
            "system": "/api/v1/system"
        }
    }

@app.on_event("startup")
async def startup():
    print("=" * 50)
    print("🚀 AI BOOK ASSISTANT - BACKEND")
    print("=" * 50)
    print(f"📁 Data directory: {settings.data_dir}")
    print(f"🔍 Similarity threshold: {settings.similarity_threshold}")
    print(f"🤖 Model: {settings.embedding_model}")
    print("=" * 50)