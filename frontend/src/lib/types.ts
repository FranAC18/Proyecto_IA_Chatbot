export interface SearchResult {
  chunk_id: number;
  text: string;
  similarity: number;
  similarity_percent: number;
  rank: number;
  word_count: number;
}

export interface SearchResponse {
  query: string;
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
}