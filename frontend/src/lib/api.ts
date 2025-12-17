import axios from 'axios';
import { SearchResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos timeout
});

// Para manejar errores mejor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      console.log('API Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

export async function sendMessage(query: string): Promise<SearchResponse> {
  const response = await api.get<SearchResponse>('/api/v1/search', {
    params: {
      query: query,
      top_k: 3,
    }
  });
  return response.data;
}
export async function processPDF(): Promise<{ 
  message: string; 
  chunks_created: number;
  status: string;
}> {
  try {
    const response = await api.post('/api/v1/process-pdf');
    return response.data;
  } catch (error: any) {
    console.error('Error in processPDF:', error);
    throw error;
  }
}

export async function checkHealth(): Promise<{ 
  status: string; 
  service: string;
  pdf_exists: boolean;
  embeddings_exist: boolean;
  service_loaded: boolean;
}> {
  try {
    const response = await api.get('/api/v1/health');
    return response.data;
  } catch (error: any) {
    console.error('Error in checkHealth:', error);
    throw error;
  }
}

export default api;