print("=== PRUEBA FINAL DE TODOS LOS IMPORTS ===")
print()

tests = [
    ("import fastapi", "FastAPI"),
    ("import uvicorn", "Uvicorn"),
    ("import pydantic", "Pydantic"),
    ("import pydantic_settings", "Pydantic Settings"),
    ("import faiss", "FAISS"),
    ("import numpy", "NumPy"),
    ("import PyPDF2", "PyPDF2"),
    ("import aiofiles", "AIOFiles"),
    ("from dotenv import load_dotenv", "Python Dotenv"),
    ("from fastapi import Form, File, UploadFile", "FastAPI Multipart"),
]

# Probar sentence-transformers separadamente
print("Probando sentence-transformers...")
try:
    import sentence_transformers
    print("✅ Sentence Transformers: OK")
    print(f"   Versión: {sentence_transformers.__version__}")
except Exception as e:
    print(f"❌ Sentence Transformers: {e}")

print()
print("Probando otros imports...")
for import_stmt, name in tests:
    try:
        exec(import_stmt)
        print(f"✅ {name}: OK")
    except Exception as e:
        print(f"❌ {name}: ERROR - {e}")