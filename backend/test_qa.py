import sys
print("1. Probando importaciones...")
try:
    from transformers import pipeline
    import torch
    print("✅ Librerías importadas correctamente.")
except ImportError as e:
    print(f"❌ ERROR CRÍTICO: Falta instalar librerías. {e}")
    sys.exit(1)

print("\n2. Intentando descargar/cargar el modelo QA (esto puede tardar)...")
try:
    qa_pipeline = pipeline(
        "question-answering", 
        model="mrm8488/bert-base-spanish-wwm-cased-finetuned-spa-squad2-es"
    )
    print("✅ Modelo cargado exitosamente en memoria.")
    
    print("\n3. Probando una pregunta simple...")
    resultado = qa_pipeline(question="¿Qué es esto?", context="Esto es una prueba de diagnóstico.")
    print(f"✅ Respuesta del modelo: {resultado['answer']}")
    
except Exception as e:
    print(f"❌ ERROR AL CARGAR MODELO: {e}")