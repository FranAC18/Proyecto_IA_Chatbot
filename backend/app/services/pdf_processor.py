import PyPDF2
from typing import List, Dict
import json
from pathlib import Path
import re

class PDFProcessor:
    def __init__(self, pdf_path: Path):
        self.pdf_path = pdf_path
    
    def extract_text(self, start_page: int = 1, end_page: int = None) -> str:
        """
        Extrae texto del PDF.
        Si end_page es None, lee hasta el final del archivo.
        """
        text = ""
        try:
            with open(self.pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                
                # Si no especifican fin, vamos hasta la última página
                final_page = end_page if end_page else total_pages
                
                # Ajustar índices (PyPDF2 usa 0-based)
                start = max(0, start_page - 1)
                end = min(total_pages, final_page)
                
                print(f"📖 Leyendo libro completo: Páginas {start+1} a {end}...")
                
                for page_num in range(start, end):
                    try:
                        page = pdf_reader.pages[page_num]
                        page_text = page.extract_text()
                        
                        if page_text:
                            # Limpieza básica: quitar exceso de espacios
                            page_text = re.sub(r'\s+', ' ', page_text).strip()
                            # Añadimos marcador de página para referencia
                            text += f"--- Página {page_num + 1} ---\n{page_text}\n\n"
                            
                            # Log visual cada 50 páginas para saber que no se trabó
                            if (page_num + 1) % 50 == 0:
                                print(f"   ... procesada página {page_num + 1}")
                                
                    except Exception as e:
                        print(f"⚠ Error leyendo página {page_num+1}: {e}")
                        continue
        
        except Exception as e:
            raise Exception(f"Error abriendo el PDF: {str(e)}")
        
        return text
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict]:
        """
        Divide el texto en chunks solapados.
        Aumentamos el chunk_size a 1000 caracteres para tener más contexto.
        """
        chunks = []
        
        # Estrategia simple por caracteres para asegurar consistencia
        # (La división por párrafos a veces falla si el PDF tiene mal formato)
        if not text:
            return []
            
        i = 0
        chunk_id = 0
        
        while i < len(text):
            # Tomar un trozo de texto
            end = min(i + chunk_size, len(text))
            chunk_text = text[i:end]
            
            # Guardar chunk
            chunks.append({
                "id": chunk_id,
                "text": chunk_text,
                "word_count": len(chunk_text.split())
            })
            
            chunk_id += 1
            # Avanzar, pero retrocediendo el overlap (solapamiento)
            i += (chunk_size - overlap)
        
        print(f"✂️ Texto dividido en {len(chunks)} fragmentos (chunks).")
        return chunks
    
    def process_book(self) -> List[Dict]:
        """Proceso completo: extraer y chunkear"""
        print("\n=== PROCESANDO LIBRO COMPLETO ===")
        print(f"📂 Ruta: {self.pdf_path}")
        
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"No se encontró el PDF en: {self.pdf_path}")
        
        # Llamamos sin definir end_page para que lea TODO
        text = self.extract_text(start_page=1, end_page=None)
        
        if len(text) < 100:
            raise Exception("⚠ El PDF parece estar vacío o no se pudo leer texto.")

        chunks = self.chunk_text(text)
        
        print(f"✅ Procesamiento finalizado: {len(chunks)} chunks listos para embeddings.")
        return chunks