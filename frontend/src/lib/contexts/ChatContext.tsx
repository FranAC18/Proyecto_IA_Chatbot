'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '../types';

interface ChatContextType {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente académico. Puedo ayudarte a encontrar información en el libro "Introducción a la Inteligencia Artificial".',
      isUser: false,
      timestamp: new Date(),
    },
    {
      id: '2',
      content: 'Para comenzar, necesitas procesar el PDF del libro. Haz clic en el botón "Procesar PDF" en la parte superior.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: '¡Hola! Soy tu asistente académico. Puedo ayudarte a encontrar información en el libro "Introducción a la Inteligencia Artificial".',
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
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}