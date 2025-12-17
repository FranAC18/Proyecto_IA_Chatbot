from app.core.config import settings

print("=== PRUEBA DEL BACKEND ===")
print()

print(f"App: {settings.app_name}")
print(f"Data dir: {settings.data_dir}")
print(f"PDF path: {settings.pdf_path}")
print(f"Exists: {settings.pdf_path.exists()}")

# Crear un PDF de prueba si no existe
if not settings.pdf_path.exists():
    print("\n⚠ No se encontró book.pdf")
    print("Por favor, coloca el PDF en:")
    print(f"  {settings.pdf_path}")
    print("\nPara probar, puedes crear un archivo de prueba:")
    print("  echo 'Este es un libro de prueba sobre IA.' > test.txt")
    print("  (Luego renómbralo a book.pdf)")