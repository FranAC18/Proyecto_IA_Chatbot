'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/lib/contexts/ChatContext';
import { sendMessage, sendFeedback } from '@/lib/api';
import { ChatMessage } from '@/lib/types';
import { 
  Send, Bot, User, BookOpen, AlertCircle, Loader2, 
  Copy, Check, Lightbulb, ThumbsUp, ThumbsDown, Sparkles 
} from 'lucide-react';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { messages, addMessage, isLoading, setIsLoading, updateMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: input, isUser: true, timestamp: new Date(),
    };
    addMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(input);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.found_results ? "Aquí tienes el análisis del libro:" : "No encontré ese dato específico.",
        isUser: false,
        timestamp: new Date(),
        results: response.results,
        answer: response.answer,
      };
      addMessage(botMsg);
    } catch (error: any) {
      addMessage({
        id: Date.now().toString(),
        content: "❌ Error de conexión con el servidor.",
        isUser: false, timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (messageId: string, query: string, useful: boolean) => {
    try {
      await sendFeedback(messageId, query, useful);
      // Actualizamos el estado local para mostrar que ya se votó
      const status = useful ? 'useful' : 'not_useful';
      // Asumiendo que tienes una función updateMessage en tu context
      if (updateMessage) {
        updateMessage(messageId, { feedbackGiven: status });
      }
    } catch (err) {
      console.error("Error enviando feedback:", err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto p-4 font-sans">
      {/* Header Premium */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm rounded-2xl p-5 mb-6 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-indigo-200 shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">IA Academic Buddy</h1>
            <p className="text-xs text-indigo-600 font-medium">Libro: Introducción a la Inteligencia Artificial</p>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors">
          Reiniciar Sesión
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
            <div className="p-6 bg-gray-50 rounded-full"><BookOpen className="w-12 h-12 text-gray-300" /></div>
            <p className="text-gray-500 max-w-xs">¡Hola! Pregúntame sobre algoritmos, agentes o la historia de la IA.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex gap-4 ${m.isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${m.isUser ? 'bg-blue-600' : 'bg-indigo-600 text-white'}`}>
                {m.isUser ? <User size={18} /> : <Bot size={18} />}
              </div>

              <div className={`max-w-[85%] space-y-3 ${m.isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl p-4 shadow-sm border ${m.isUser ? 'bg-blue-600 text-white border-blue-500' : 'bg-white border-gray-100 text-gray-800'}`}>
                  {/* Respuesta Inteligente (La cajita verde) */}
                  {m.answer && !m.isUser && (
                    <div className="mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-emerald-900 font-medium leading-relaxed">{m.answer}</p>
                          
                          {/* BOTONES DE FEEDBACK 👍/👎 */}
                          <div className="mt-4 flex items-center gap-4 border-t border-emerald-100 pt-3">
                            <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">¿Fue útil esta respuesta?</span>
                            <div className="flex gap-2">
                              <button 
                                disabled={!!m.feedbackGiven}
                                onClick={() => handleVote(m.id, m.content, true)}
                                className={`p-1.5 rounded-lg transition-all ${m.feedbackGiven === 'useful' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-100 text-emerald-700'}`}
                              >
                                <ThumbsUp size={14} />
                              </button>
                              <button 
                                disabled={!!m.feedbackGiven}
                                onClick={() => handleVote(m.id, m.content, false)}
                                className={`p-1.5 rounded-lg transition-all ${m.feedbackGiven === 'not_useful' ? 'bg-red-500 text-white' : 'hover:bg-red-100 text-red-700'}`}
                              >
                                <ThumbsDown size={14} />
                              </button>
                            </div>
                            {m.feedbackGiven && <span className="text-[10px] text-emerald-600 animate-pulse font-medium italic">¡Gracias por tu ayuda!</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>

                {/* Resultados del libro */}
                {m.results && m.results.map((res) => (
                  <div key={res.chunk_id} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600 italic">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-indigo-600">Referencia #{res.rank}</span>
                      <span>{res.source}</span>
                    </div>
                    "{res.text}"
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de búsqueda */}
      <form onSubmit={handleSubmit} className="mt-6 relative">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu consulta académica..."
          className="w-full bg-white border border-gray-200 rounded-2xl pl-6 pr-24 py-4 shadow-xl shadow-gray-200/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
        <button disabled={isLoading || !input.trim()} className="absolute right-2 top-2 bottom-2 px-5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center gap-2">
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}