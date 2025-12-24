import axios from 'axios';

// Base URL da API (do .env ou default local)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Garantir que termina com /api para o cliente Axios
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para lidar com erros globais (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (Unauthorized), pode deslogar o usuário, por exemplo
    if (error.response?.status === 401) {
      // localStorage.removeItem('token');
      // window.location.href = '/auth'; // Cuidado com redirect loop
    }
    return Promise.reject(error);
  }
);
