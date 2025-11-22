// Using Next.js API proxy route instead of direct backend - ensures cookies are automatically sent
const API_BASE = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Timeout is longer than proxy timeout to handle slow responses
    const timeoutMs = 20000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏱️ Request timeout voor ${endpoint} na ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);

    try {
      console.log('🌐 API Client Request:', { method: options.method || 'GET', url, endpoint, timestamp: new Date().toISOString() });
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('📥 API Client Response:', { status: response.status, url, timestamp: new Date().toISOString() });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('❌ API Client: Failed to parse JSON response:', jsonError);
        return {
          success: false,
          error: {
            message: 'Ongeldige response van server',
          },
        };
      }

      if (!response.ok) {
        console.error('❌ API Client: Request failed:', { status: response.status, error: data.error });
        return {
          success: false,
          error: {
            message: data.error?.message || 'Er is een fout opgetreden',
          },
        };
      }

      console.log('✅ API Client: Request successful');
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ API Client: Request timeout:', { endpoint, url });
        return {
          success: false,
          error: {
            message: `Request timeout: De server reageert niet binnen ${timeoutMs}ms. Controleer of de API server draait.`,
          },
        };
      }
      
      console.error('❌ API Client: Network error:', error, { endpoint, url });
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Netwerkfout',
        },
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE);

