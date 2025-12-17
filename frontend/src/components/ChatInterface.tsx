'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/lib/contexts/ChatContext';
import { sendMessage } from '@/lib/api';
import { SearchResult, ChatMessage } from '@/lib/types';  // ← AGREGAR ChatMessage aquí
import { Send, Bot, User, BookOpen, AlertCircle, Loader2, Copy, Check } from 'lucide-react';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { messages, addMessage, isLoading, setIsLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Enviar al backend
      const response = await sendMessage(input);
      
      // Agregar respuesta del bot
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.found_results 
          ? `Encontré ${response.results.length} resultado(s) relevantes:`
          : 'Lo siento, no encontré información relevante sobre ese tema en el libro.',
        isUser: false,
        timestamp: new Date(),
        results: response.results,
      };
      addMessage(botMessage);
    // ... en la función handleSubmit, dentro del catch:
} catch (error: any) {
  console.error('❌ Error in handleSubmit:', error);
    
    // Mensaje de error detallado
    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: `❌ Error: ${error.message || 'Unknown error'}\n\nDetalles en consola (F12)`,
      isUser: false,
      timestamp: new Date(),
    };
    addMessage(errorMessage);
} finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white shadow rounded-xl p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Book AI Assistant
            </h1>
            <p className="text-gray-600">
              Chatbot académico para el libro de Inteligencia Artificial
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Windows</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Next.js 15</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">FastAPI</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">FAISS</span>
            </div>
          </div>
        </div>
      </div>
      // Después del header, antes del chat messages container:
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            if (window.confirm('¿Estás seguro de que quieres limpiar el chat?')) {
              // Necesitarás agregar clearChat al contexto
              // clearChat();
              window.location.reload(); // Solución temporal
            }
          }}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpiar chat
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto mb-6 space-y-6 bg-white rounded-xl p-4 shadow-inner border border-gray-100">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay mensajes aún. ¡Empieza a chatear!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow ${
                  message.isUser
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-green-500 to-green-600'
                }`}
              >
                {message.isUser ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              
              {/* Message Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl p-5 shadow ${
                  message.isUser
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                    : 'bg-gray-50 text-gray-900 rounded-bl-none border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold opacity-90">
                    {message.isUser ? 'Tú' : 'Asistente IA'}
                  </span>
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                
                <p className="whitespace-pre-wrap mb-4">{message.content}</p>
                
                {/* Mostrar resultados si existen */}
                {message.results && message.results.length > 0 && (
                  <div className="space-y-4 mt-4">
                    {message.results.map((result) => (
                      <div
                        key={`${message.id}-${result.chunk_id}`}
                        className={`rounded-lg p-4 ${
                          message.isUser
                            ? 'bg-white/20 backdrop-blur-sm'
                            : 'bg-white border border-gray-200 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-black/10">
                              Resultado #{result.rank}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              result.similarity_percent > 80
                                ? 'bg-green-100 text-green-800'
                                : result.similarity_percent > 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {result.similarity_percent}% relevante
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopy(result.text, `${message.id}-${result.chunk_id}`)}
                            className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1"
                          >
                            {copiedId === `${message.id}-${result.chunk_id}` ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm leading-relaxed">{result.text}</p>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/20">
                          <span className="text-xs text-gray-500">
                            {result.word_count} palabras
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {result.chunk_id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Mostrar alerta si no hay resultados */}
                {message.results && message.results.length === 0 && (
                  <div className="mt-4 flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Información no encontrada</p>
                      <p className="text-xs mt-1">
                        No se encontró información específica sobre este tema en el libro.
                        Intenta reformular tu pregunta o preguntar sobre otro tema.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-50 text-gray-900 rounded-2xl p-5 rounded-bl-none border border-gray-200 shadow">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span className="text-sm font-medium">Buscando en el libro...</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Analizando el contenido y buscando la información más relevante
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-white rounded-xl p-4 shadow-lg border border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: ¿Qué es la inteligencia artificial? ¿Qué son los algoritmos genéticos?"
            className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="font-medium">Enviar</span>
          </button>
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-gray-500">
            Presiona Enter para enviar • Shift+Enter para nueva línea
          </p>
          <p className="text-xs text-gray-500">
            Buscando en páginas 1-21 del libro
          </p>
        </div>
      </form>
    </div>
  );
}