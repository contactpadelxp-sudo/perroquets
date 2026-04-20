'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { PageHeader } from './PageHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/auth');
  const isLegalPage = pathname.startsWith('/legal');
  const isOnboarding = pathname.startsWith('/onboarding');

  if (isAuthPage || isLegalPage || isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="pb-20 lg:pb-0 lg:pl-20">
      <Navbar />
      <main className="mx-auto max-w-6xl px-3 sm:px-4 pt-2 pb-2 sm:pt-4 sm:pb-4">
        <PageHeader />
        {children}
      </main>
    </div>
  );
}
