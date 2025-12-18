export interface SearchResult {
  chunk_id: number;
  text: string;
  similarity: number;
  similarity_percent: number;
  rank: number;
  word_count: number;
  source?: string; // Nuevo campo: "Página aprox X"
}

export interface SearchResponse {
  query: string;
  answer?: string; // Nuevo campo: La respuesta directa de la IA
  results: SearchResult[];
  found_results: boolean;
  top_k_requested: number;
  threshold_used: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  results?: SearchResult[];
  answer?: string; // Para guardar la respuesta en el historial del chat
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  results?: SearchResult[];
  answer?: string;
  feedbackGiven?: 'useful' | 'not_useful'; // <--- Nuevo: para bloquear los botones tras votar
}