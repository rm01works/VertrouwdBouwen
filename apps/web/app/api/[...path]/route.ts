// Next.js API route proxy to Express backend
// 
// Runtime: Node.js (standaard) - nodig voor fetch naar Express backend
// Prisma wordt hier NIET gebruikt, dit is alleen een proxy route
import { NextRequest, NextResponse } from 'next/server';

// Explicitly set Node.js runtime (default, but making it clear for Vercel)
export const runtime = 'nodejs';

// Use API_BASE_URL for server-side (more secure, not exposed to client)
// Fallback to NEXT_PUBLIC_API_URL for client-side compatibility
// In production, this should point to the external backend URL
// Normalize the URL: remove trailing slashes and ensure it doesn't include /api
function getApiBaseUrl(): string {
  // Priority: API_BASE_URL (server-side only) > NEXT_PUBLIC_API_URL (client-accessible)
  const rawUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  
  // During build, allow fallback to prevent build failures
  if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
    if (!rawUrl || rawUrl.trim() === '') {
      throw new Error(
        'NEXT_PUBLIC_API_URL is required in production. ' +
        'Set it in Netlify environment variables to your backend API URL, ' +
        'e.g., https://your-api.example.com'
      );
    }
  }
  
  if (!rawUrl || rawUrl.trim() === '') {
    const fallback = 'http://localhost:5001';
    if (isBuildPhase) {
      return fallback;
    }
    console.warn(
      `⚠️ NEXT_PUBLIC_API_URL is not set, using fallback: ${fallback}. ` +
      'Set NEXT_PUBLIC_API_URL in .env.local for development.'
    );
    return fallback;
  }
  
  let normalized = rawUrl.trim().replace(/\/+$/, '');
  
  // Remove /api suffix to avoid double /api in the proxy
  if (normalized.endsWith('/api')) {
    normalized = normalized.slice(0, -4);
  }
  
  if (!normalized || normalized === '') {
    console.warn('⚠️ API_BASE_URL is empty, using fallback: http://localhost:5001');
    return 'http://localhost:5001';
  }
  
  return normalized;
}

// Lazy initialization - only compute when needed (at runtime, not build time)
let API_URL: string | null = null;

function getApiUrl(): string {
  if (API_URL === null) {
    API_URL = getApiBaseUrl();
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Next.js API Proxy configured with backend URL:', API_URL);
    }
  }
  return API_URL;
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

export async function PATCH(
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
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const url = new URL(request.url);
  const pathString = path.join('/');
  const apiUrl = getApiUrl();
  const backendUrl = `${apiUrl}/api/${pathString}${url.search}`;

  let timeoutId: NodeJS.Timeout | undefined;

  try {
    console.log(`🔄 Proxying ${request.method} request to:`, backendUrl);
    console.log(`📋 Request path:`, pathString);
    console.log(`🌐 API base URL:`, apiUrl);
    
    const headers: Record<string, string> = {};
    
    const cookieArray: string[] = [];
    request.cookies.getAll().forEach((cookie) => {
      cookieArray.push(`${cookie.name}=${cookie.value}`);
    });
    if (cookieArray.length > 0) {
      headers['Cookie'] = cookieArray.join('; ');
      console.log('🍪 Forwarding cookies:', cookieArray.length);
    }
    
    const skipHeaders = ['host', 'connection', 'content-length', 'authorization'];
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!skipHeaders.includes(lowerKey)) {
        headers[lowerKey] = value;
      }
    });
    
    if (request.method !== 'GET' && request.method !== 'HEAD' && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }
    
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const bodyText = await request.text();
      body = bodyText.trim() ? bodyText : undefined;
      if (body) {
        console.log('📤 Request body:', body.substring(0, 200));
      }
    }
    
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

    const responseText = await response.text();
    let data;
    
    if (!responseText || responseText.trim() === '') {
      console.error('❌ Empty response from backend:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
      });
      
      if (response.status >= 400) {
        return NextResponse.json(
          { 
            success: false,
            error: { 
              message: response.status >= 500 
                ? 'Server fout. De backend server heeft een lege response teruggestuurd. Controleer de server logs.'
                : `HTTP ${response.status} fout: Lege response ontvangen.`,
              status: response.status
            } 
          },
          { status: response.status }
        );
      }
      
      data = {};
    } else {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
          console.log(`✅ Parsed JSON response:`, { success: data.success, hasError: !!data.error });
        } catch (jsonError) {
          console.error('❌ Failed to parse JSON response:', jsonError);
          console.error('Response text:', responseText.substring(0, 500));
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
        console.error('❌ Non-JSON response from backend:', {
          status: response.status,
          contentType: response.headers.get('content-type'),
          preview: responseText.substring(0, 200),
          fullText: responseText
        });
        
        let errorMessage = 'Ongeldige response van server';
        if (responseText) {
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
    }
    
    if (!data || typeof data !== 'object') {
      data = { success: false, error: { message: 'Ongeldige response van server' } };
    }
    
    console.log(`✅ Proxy response: ${response.status}`, { success: data.success });
    
    const nextResponse = NextResponse.json(data, { status: response.status });
    
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
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    console.error('❌ Proxy error:', error);
    const apiUrl = getApiUrl();
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      backendUrl: `${apiUrl}/api/${path.join('/')}`,
    });
    
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
      console.error(`❌ Backend API server is niet bereikbaar op ${apiUrl}`);
      console.error('   Start de API server met: cd apps/api && npm run dev');
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: { 
          message: isConnectionError
            ? isAbortError
              ? `Backend API server reageert niet op ${apiUrl} (timeout). Controleer of de server draait: cd apps/api && npm run dev`
              : `Backend API server is niet bereikbaar op ${apiUrl}. Start de server met: cd apps/api && npm run dev`
            : error instanceof Error 
            ? `Verbindingsfout: ${errorMessage}` 
            : 'Kan niet verbinden met de server. Controleer of de API server draait.' 
        } 
      },
      { status: 503 } // 503 Service Unavailable is more appropriate for connection errors
    );
  }
}

