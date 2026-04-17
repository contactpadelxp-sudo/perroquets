import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { AppShell } from '@/components/layout/AppShell';
import { CookieBanner } from '@/components/layout/CookieBanner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Eclectuscare — Suivi quotidien Éclectus',
  description:
    'Application de suivi quotidien pour perroquet Éclectus roratus : alimentation, poids, calendrier biologique.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} antialiased dark`} style={{ colorScheme: 'dark' }}>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <AppShell>{children}</AppShell>
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
