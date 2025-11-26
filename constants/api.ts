/**
 * API Configuration
 * Change the base URL here to switch between different API endpoints
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '192.168.1.52:3000';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  CATEGORIES: '/api/v1/categories',
  DOCUMENTS_SEARCH: '/api/v1/documents/search',
  DOCUMENTS: '/api/v1/documents',
  DOCUMENTS_UPLOAD: '/api/v1/documents/upload',
} as const;

/**
 * Helper function to build full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_BASE_URL.startsWith('http') ? API_BASE_URL : `http://${API_BASE_URL}`;
  return `${baseUrl}${endpoint}`;
};

