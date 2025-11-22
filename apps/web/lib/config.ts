interface WindowEnv {
  __ENV__?: {
    NEXT_PUBLIC_API_URL?: string;
  };
}

declare global {
  interface Window extends WindowEnv {}
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined' && window.__ENV__?.NEXT_PUBLIC_API_URL) {
    return window.__ENV__.NEXT_PUBLIC_API_URL;
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
}

