'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '../types';

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  // --- MEJORA: Función para actualizar un mensaje existente (Feedback/Correcciones) ---
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  // Estado inicial con mensaje de bienvenida académico
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      content: '¡Hola! Soy tu asistente académico. Estoy configurado para analizar el libro "Introducción a la Inteligencia Artificial".',
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: 'welcome-2',
      content: 'Si ya procesaste el PDF, puedes hacerme preguntas conceptuales. Si no, haz clic en "Procesar PDF" para comenzar el análisis vectorial.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  /**
   * ACTUALIZACIÓN CLAVE: permite modificar un mensaje ya enviado.
   * Útil para: marcar feedback (👍/👎) o corregir incoherencias visuales.
   */
  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  };

  const clearChat = () => {
    // Al limpiar, mantenemos solo el primer saludo
    setMessages([
      {
        id: 'welcome-reset',
        content: 'Historial limpio. ¿En qué otro concepto del libro puedo ayudarte?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        updateMessage, // <--- Exportamos la nueva función
        isLoading,
        setIsLoading,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat debe ser usado dentro de un ChatProvider');
  }
  return context;
}