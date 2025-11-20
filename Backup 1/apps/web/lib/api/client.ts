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

    try {
      console.log('🌐 API Client Request:', { method: options.method || 'GET', url, endpoint });
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies in requests (same-origin)
      });
      
      console.log('📥 API Client Response:', { status: response.status, url });

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
      console.error('❌ API Client: Network error:', error);
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

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
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

