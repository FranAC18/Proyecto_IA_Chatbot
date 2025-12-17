import PyPDF2
from typing import List, Dict
import json
from pathlib import Path
import re

class PDFProcessor:
    def __init__(self, pdf_path: Path):
        self.pdf_path = pdf_path
    
    def extract_text(self, start_page: int = 1, end_page: int = 21) -> str:
        """Extrae texto del PDF entre las páginas especificadas"""
        text = ""
        try:
            with open(self.pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                # Ajustar índices (PyPDF2 usa 0-based)
                start = max(0, start_page - 1)
                end = min(len(pdf_reader.pages), end_page)
                
                print(f"Extrayendo páginas {start_page} a {end_page}...")
                
                for page_num in range(start, end):
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    
                    # Limpiar texto
                    page_text = re.sub(r'\s+', ' ', page_text)
                    page_text = page_text.strip()
                    
                    if page_text:
                        text += f"--- Página {page_num + 1} ---\n{page_text}\n\n"
        
        except Exception as e:
            raise Exception(f"Error extrayendo texto del PDF: {str(e)}")
        
        return text
    
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 100) -> List[Dict]:
        """Divide el texto en chunks solapados"""
        chunks = []
        
        # Dividir por párrafos primero
        paragraphs = text.split('\n\n')
        
        chunk_id = 0
        for para in paragraphs:
            if not para.strip():
                continue
                
            words = para.split()
            if len(words) <= chunk_size:
                chunks.append({
                    "id": chunk_id,
                    "text": para,
                    "word_count": len(words)
                })
                chunk_id += 1
            else:
                # Si el párrafo es muy largo, dividirlo
                for i in range(0, len(words), chunk_size - overlap):
                    chunk_words = words[i:i + chunk_size]
                    chunk_text = " ".join(chunk_words)
                    
                    chunks.append({
                        "id": chunk_id,
                        "text": chunk_text,
                        "word_count": len(chunk_words)
                    })
                    chunk_id += 1
        
        print(f"Creando {len(chunks)} chunks...")
        return chunks
    
    def process_book(self) -> List[Dict]:
        """Proceso completo: extraer y chunkear"""
        print("=== PROCESANDO PDF ===")
        print(f"Ruta del PDF: {self.pdf_path}")
        
        if not self.pdf_path.exists():
            raise FileNotFoundError(f"No se encontró el PDF en: {self.pdf_path}")
        
        text = self.extract_text(1, 21)
        chunks = self.chunk_text(text)
        
        print(f"✓ Procesados {len(chunks)} chunks")
        return chunks