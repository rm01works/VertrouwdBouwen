import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'VertrouwdBouwen - Escrow Platform',
  description: 'Nederlands escrow platform voor bouwprojecten',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  
  return (
    <html lang="nl">
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__ENV__ = { NEXT_PUBLIC_API_URL: ${JSON.stringify(apiUrl)} };`,
          }}
        />
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}

