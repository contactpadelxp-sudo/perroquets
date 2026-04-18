import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { AppShell } from '@/components/layout/AppShell';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { ServiceWorkerRegistrar } from '@/components/layout/ServiceWorker';
import { InstallPrompt } from '@/components/layout/InstallPrompt';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Eclectuscare — Suivi quotidien Éclectus',
  description:
    'Application de suivi quotidien pour perroquet Éclectus roratus : alimentation, poids, calendrier biologique.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Eclectuscare',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F0F11',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} antialiased dark`} style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground overscroll-none">
        <Providers>
          <AppShell>{children}</AppShell>
          <CookieBanner />
          <InstallPrompt />
          <ServiceWorkerRegistrar />
        </Providers>
      </body>
    </html>
  );
}
