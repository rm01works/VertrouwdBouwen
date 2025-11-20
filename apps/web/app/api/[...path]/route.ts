// Next.js API route proxy to Express backend
import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// API Proxy Configuration
// ============================================================================
// Deze Next.js API route proxyt requests naar de backend Express API
// Gebruikt NEXT_PUBLIC_API_URL voor de backend URL
// 
// Local development: NEXT_PUBLIC_API_URL=http://localhost:5001
// Production (Netlify): NEXT_PUBLIC_API_URL=https://your-api-url.com
// ============================================================================

/**
 * Haalt de backend API base URL op uit environment variables
 * In productie MOET NEXT_PUBLIC_API_URL gezet zijn
 * In development gebruikt het localhost als fallback
 */
function getApiBaseUrl(): string {
  // Prioriteit: API_BASE_URL (server-side only) > NEXT_PUBLIC_API_URL (client-accessible)
  const rawUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  
  // In productie: NEXT_PUBLIC_API_URL is verplicht
  if (process.env.NODE_ENV === 'production') {
    if (!rawUrl || rawUrl.trim() === '') {
      throw new Error(
        'NEXT_PUBLIC_API_URL is required in production. ' +
        'Set it in Netlify environment variables to your backend API URL, ' +
        'e.g., https://your-api.example.com'
      );
    }
  }
  
  // In development: fallback naar localhost
  if (!rawUrl || rawUrl.trim() === '') {
    const fallback = 'http://localhost:5001';
    console.warn(
      `⚠️ NEXT_PUBLIC_API_URL is not set, using fallback: ${fallback}. ` +
      'Set NEXT_PUBLIC_API_URL in .env.local for development.'
    );
    return fallback;
  }
  
  // Remove trailing slashes
  let normalized = rawUrl.trim().replace(/\/+$/, '');
  
  // Remove /api suffix if present (to avoid double /api in the proxy)
  if (normalized.endsWith('/api')) {
    normalized = normalized.slice(0, -4);
  }
  
  return normalized;
}

const API_URL = getApiBaseUrl();

// Log the configured API URL on module load (for debugging)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Next.js API Proxy configured with backend URL:', API_URL);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function OPTIONS(
  request: NextRequest,
  { params: _params }: { params: Promise<{ path: string[] }> }
) {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const url = new URL(request.url);
  const pathString = path.join('/');
  // Always add /api prefix since backend routes are mounted at /api
  const backendUrl = `${API_URL}/api/${pathString}${url.search}`;

  // Declare timeout outside try block so it can be cleared in catch
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    console.log(`🔄 Proxying ${request.method} request to:`, backendUrl);
    console.log(`📋 Request path:`, pathString);
    console.log(`🌐 API base URL:`, API_URL);
    
    // Build headers - forward relevant headers from the request
    const headers: Record<string, string> = {};
    
    // Forward cookies if present - properly build Cookie header string
    const cookieArray: string[] = [];
    request.cookies.getAll().forEach((cookie) => {
      cookieArray.push(`${cookie.name}=${cookie.value}`);
    });
    if (cookieArray.length > 0) {
      headers['Cookie'] = cookieArray.join('; ');
      console.log('🍪 Forwarding cookies:', cookieArray.length);
    }
    
    // Forward other relevant headers (but skip some that shouldn't be forwarded)
    const skipHeaders = ['host', 'connection', 'content-length', 'authorization'];
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!skipHeaders.includes(lowerKey)) {
        // Normalize header key to lowercase for consistency
        headers[lowerKey] = value;
      }
    });
    
    // Set Content-Type if not already set (for POST/PUT/PATCH/DELETE with body)
    if (request.method !== 'GET' && request.method !== 'HEAD' && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }
    
    // Get request body for POST/PUT/PATCH/DELETE
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const bodyText = await request.text();
      // Only send body if it's not empty
      body = bodyText.trim() ? bodyText : undefined;
      if (body) {
        console.log('📤 Request body:', body.substring(0, 200));
      }
    }
    
    // Add timeout to prevent long waits when backend is down
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      credentials: 'include',
      body,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    timeoutId = undefined;

    console.log(`📥 Backend response status: ${response.status}`);
    console.log(`📥 Backend response headers:`, Object.fromEntries(response.headers.entries()));

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text();
    let data;
    
    // Try to parse as JSON, but handle non-JSON responses gracefully
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = responseText ? JSON.parse(responseText) : {};
        console.log(`✅ Parsed JSON response:`, { success: data.success, hasError: !!data.error });
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        console.error('Response text:', responseText.substring(0, 500));
        // If backend returned an error, try to extract useful info
        return NextResponse.json(
          { 
            success: false,
            error: { 
              message: responseText || 'Ongeldige response van server',
              status: response.status
            } 
          },
          { status: response.status || 500 }
        );
      }
    } else {
      // Non-JSON response - likely an error page or empty response
      console.error('❌ Non-JSON response from backend:', {
        status: response.status,
        contentType,
        preview: responseText.substring(0, 200),
        fullText: responseText
      });
      
      // Try to extract error message from HTML or plain text
      let errorMessage = 'Ongeldige response van server';
      if (responseText) {
        // Try to find error message in HTML
        const errorMatch = responseText.match(/<title>(.*?)<\/title>/i) || 
                          responseText.match(/<h1>(.*?)<\/h1>/i) ||
                          responseText.match(/Error:\s*(.+)/i);
        if (errorMatch) {
          errorMessage = errorMatch[1];
        } else if (responseText.length < 200) {
          errorMessage = responseText;
        }
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: { 
            message: response.status >= 500 
              ? 'Server fout. Probeer het later opnieuw.'
              : response.status === 403
              ? 'Toegang geweigerd. Controleer of de API server draait en of uw gegevens correct zijn.'
              : errorMessage,
            status: response.status
          } 
        },
        { status: response.status || 500 }
      );
    }
    
    console.log(`✅ Proxy response: ${response.status}`, { success: data.success });
    
    // Create response with cookies from backend
    const nextResponse = NextResponse.json(data, { status: response.status });
    
    // Forward all Set-Cookie headers from backend (can be multiple)
    // Try getSetCookie() first (Node.js 18+), fallback to getAll() or get()
    let setCookieHeaders: string[] = [];
    if (typeof response.headers.getSetCookie === 'function') {
      setCookieHeaders = response.headers.getSetCookie();
    } else if (typeof (response.headers as unknown as { getAll?: (name: string) => string[] }).getAll === 'function') {
      setCookieHeaders = (response.headers as unknown as { getAll: (name: string) => string[] }).getAll('Set-Cookie');
    } else {
      const cookie = response.headers.get('Set-Cookie');
      if (cookie) {
        setCookieHeaders = [cookie];
      }
    }
    
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
      console.log('🍪 Cookies forwarded:', setCookieHeaders.length);
    }
    
    return nextResponse;
  } catch (error) {
    // Clear timeout if it's still active
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    console.error('❌ Proxy error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      backendUrl: `${API_URL}/api/${path.join('/')}`,
    });
    
    // Check if it's a connection error or timeout
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCause = error instanceof Error && 'cause' in error ? (error as Error & { cause?: unknown }).cause : null;
    const isAbortError = error instanceof Error && error.name === 'AbortError';
    const isConnectionError = error instanceof Error && (
      isAbortError ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('fetch failed') ||
      errorMessage.includes('network') ||
      (errorCause && typeof errorCause === 'object' && 'code' in errorCause && errorCause.code === 'ECONNREFUSED')
    );
    
    if (isConnectionError) {
      console.error(`❌ Backend API server is niet bereikbaar op ${API_URL}`);
      console.error('   Start de API server met: cd apps/api && npm run dev');
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: { 
          message: isConnectionError
            ? isAbortError
              ? `Backend API server reageert niet op ${API_URL} (timeout). Controleer of de server draait: cd apps/api && npm run dev`
              : `Backend API server is niet bereikbaar op ${API_URL}. Start de server met: cd apps/api && npm run dev`
            : error instanceof Error 
            ? `Verbindingsfout: ${errorMessage}` 
            : 'Kan niet verbinden met de server. Controleer of de API server draait.' 
        } 
      },
      { status: 503 } // 503 Service Unavailable is more appropriate for connection errors
    );
  }
}

