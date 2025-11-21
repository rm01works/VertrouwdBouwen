// Gebruik Next.js API proxy route in plaats van direct naar backend
// Dit zorgt ervoor dat cookies automatisch worden meegestuurd
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
    // Gebruik relatieve URL voor Next.js API proxy
    // Dit zorgt ervoor dat cookies automatisch worden meegestuurd
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Use cookies for authentication (httpOnly cookies are sent automatically)
    // Via Next.js proxy worden cookies automatisch doorgestuurd

    // Add timeout using AbortController to prevent infinite hanging
    const timeoutMs = 20000; // 20 seconds timeout (longer than proxy timeout of 10s)
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
        credentials: 'include', // Include cookies in requests (same-origin)
        signal: controller.signal, // Add abort signal for timeout
      });
      
      clearTimeout(timeoutId); // Clear timeout if request completes
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
      clearTimeout(timeoutId); // Clear timeout in case of error
      
      // Check if it's an abort error (timeout)
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

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Gebruik Next.js API proxy (relatieve URL) zodat cookies automatisch worden meegestuurd
export const apiClient = new ApiClient(API_BASE);

