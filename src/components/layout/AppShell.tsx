'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/auth');
  const isLegalPage = pathname.startsWith('/legal');

  if (isAuthPage || isLegalPage) {
    return <>{children}</>;
  }

  return (
    <div className="pb-24 lg:pb-0 lg:pl-20">
      <Navbar />
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6">{children}</main>
    </div>
  );
}
