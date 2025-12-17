import os
import sys
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    app_name: str = "AI Book Assistant"
    debug: bool = True
    
    # ML Model
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    similarity_threshold: float = 0.3
    
    # File paths - compatible con Windows
    base_dir: Path = Path(__file__).parent.parent.parent
    
    @property
    def data_dir(self) -> Path:
        return self.base_dir / "data"
    
    @property
    def pdf_path(self) -> Path:
        return self.data_dir / "book.pdf"
    
    @property
    def embeddings_path(self) -> Path:
        return self.data_dir / "embeddings.faiss"
    
    @property
    def chunks_path(self) -> Path:
        return self.data_dir / "chunks.json"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

# Crear directorios necesarios
def setup_directories():
    """Crear directorios necesarios para Windows"""
    directories = [
        settings.data_dir,
        settings.base_dir / "logs",
        settings.base_dir / "uploads"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✓ Directorio: {directory}")

# Configurar al inicio
setup_directories()
print(f"✓ Entorno: Conda - book-ai")
print(f"✓ Python: {sys.version.split()[0]}")
print(f"✓ Directorio base: {settings.base_dir}")