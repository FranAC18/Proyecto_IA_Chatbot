'use client';

import { useEffect, useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { ChatProvider } from '@/lib/contexts/ChatContext';
import { checkHealth, processPDF } from '../lib/api';
import { AlertCircle, CheckCircle, BookOpen, RefreshCw, Server, FileText, Globe, Cpu } from 'lucide-react';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'healthy' | 'error'>('loading');
  const [pdfProcessed, setPdfProcessed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const health = await checkHealth();
      setBackendStatus('healthy');
      setPdfProcessed(health.service_loaded);
      
      // También obtener info del sistema
      try {
        const response = await fetch('http://localhost:8000/api/v1/system');
        if (response.ok) {
          const data = await response.json();
          setSystemInfo(data);
        }
      } catch (e) {
        // Ignorar error de system info
      }
    } catch (error) {
      console.error('Error checking backend:', error);
      setBackendStatus('error');
    }
  };

  const handleProcessPDF = async () => {
    setProcessing(true);
    try {
      const result = await processPDF();
      setPdfProcessed(true);
      alert(`✅ ${result.message}\n\n📊 Chunks creados: ${result.chunks_created}`);
      // Recargar estado
      checkBackendStatus();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.detail || error.message || 'Error desconocido'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Top Status Bar */}
        <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Book AI Assistant</h1>
                  <p className="text-sm text-gray-600">Chatbot académico para libro de IA</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Backend Status */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  backendStatus === 'healthy' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : backendStatus === 'error' 
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  <Server className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Backend: {backendStatus === 'healthy' ? 'Conectado' : backendStatus === 'error' ? 'Error' : 'Conectando...'}
                  </span>
                </div>
                
                {/* PDF Status */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  pdfProcessed 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    PDF: {pdfProcessed ? 'Procesado' : 'No procesado'}
                  </span>
                </div>
                
                {/* System Info */}
                {systemInfo && (
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                    <Cpu className="w-4 h-4" />
                    <span className="text-sm">
                      {systemInfo.system} • Python {systemInfo.python.split(' ')[0]}
                    </span>
                  </div>
                )}
                
                {/* Process PDF Button */}
                {!pdfProcessed && backendStatus === 'healthy' && (
                  <button
                    onClick={handleProcessPDF}
                    disabled={processing}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        Procesar PDF
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* Instructions */}
            {!pdfProcessed && backendStatus === 'healthy' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Primero, procesa el PDF</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Antes de hacer preguntas, necesitas procesar el PDF del libro. 
                      Haz clic en "Procesar PDF" arriba. Esto creará los embeddings para la búsqueda semántica.
                      El proceso puede tomar 1-2 minutos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <ChatInterface />
        </div>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-8">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Book AI Assistant</h3>
                <p className="text-sm text-gray-600">
                  Chatbot conversacional para buscar información en el libro 
                  "Introducción a la Inteligencia Artificial: Una visión introductoria".
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tecnologías</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Frontend: Next.js 15 + TypeScript + Tailwind</li>
                  <li>• Backend: FastAPI + Python 3.11</li>
                  <li>• IA: Sentence Transformers + FAISS</li>
                  <li>• Entorno: Conda para Windows</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Funcionalidades</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Búsqueda semántica en PDF</li>
                  <li>• Resultados con porcentaje de relevancia</li>
                  <li>• Interfaz conversacional moderna</li>
                  <li>• Procesamiento local de embeddings</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Proyecto académico • Desarrollado para Windows • {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ChatProvider>
  );
}