import config from './config';

const authTokenKey = "fishnet_access_token";

export const getStoredAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(authTokenKey);
};

export const apiClient = {
  baseUrl: config.apiBaseUrl,
  
  async request(endpoint: string, options: RequestInit = {}) {
    if (!this.baseUrl) {
      throw new Error(
        "The API is not configured. Set NEXT_PUBLIC_API_BASE_URL in the web Vercel project and redeploy."
      );
    }

    const url = `${this.baseUrl}${endpoint}`;
    const { headers: _headers, ...requestOptions } = options;
    const token = getStoredAccessToken();
    const headers = new Headers(_headers);

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const defaultOptions: RequestInit = {
      headers,
    };
    
    return fetch(url, {
      ...requestOptions,
      ...defaultOptions,
      signal: options.signal ?? AbortSignal.timeout(30000),
    });
  },
  
  // Convenience methods
  get: (endpoint: string, options?: RequestInit) => 
    apiClient.request(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }),
    
  put: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    }),
    
  delete: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
