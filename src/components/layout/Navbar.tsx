'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  UtensilsCrossed,
  Scale,
  Calendar,
  Settings,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home, color: 'text-accent-violet' },
  { href: '/alimentation', label: 'Alimentation', icon: UtensilsCrossed, color: 'text-accent-green' },
  { href: '/historique', label: 'Historique', icon: BookOpen, color: 'text-accent-violet' },
  { href: '/poids', label: 'Poids', icon: Scale, color: 'text-accent-green' },
  { href: '/calendrier', label: 'Calendrier', icon: Calendar, color: 'text-accent-violet' },
  { href: '/parametres', label: 'Paramètres', icon: Settings, color: 'text-accent-green' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile: bottom bar — safe area aware for notched phones */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="mx-1.5 mb-1.5 flex items-center justify-around rounded-2xl bg-card/95 backdrop-blur-xl border border-border px-1 py-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-1.5 min-w-[44px] min-h-[44px] justify-center transition-all duration-200',
                  isActive
                    ? 'bg-accent-violet/10'
                    : 'active:bg-white/10'
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    'transition-colors duration-200',
                    isActive ? item.color : 'text-muted'
                  )}
                />
                <span
                  className={cn(
                    'text-[9px] font-medium leading-tight transition-colors duration-200',
                    isActive ? 'text-foreground' : 'text-muted'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: left sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 z-50 hidden lg:flex w-20 flex-col items-center gap-2 bg-card/90 backdrop-blur-xl border-r border-border py-6">
        <div className="mb-6 text-2xl">🦜</div>
        {/* User avatar */}
        {user && (
          <div className="mb-2 w-8 h-8 rounded-full bg-accent-violet/20 flex items-center justify-center text-xs font-bold text-accent-violet overflow-hidden">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              user.email?.charAt(0).toUpperCase()
            )}
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-3 transition-all duration-200',
                isActive
                  ? 'bg-accent-violet/10'
                  : 'hover:bg-white/5'
              )}
              title={item.label}
            >
              <Icon
                size={22}
                className={cn(
                  'transition-colors duration-200',
                  isActive ? item.color : 'text-muted group-hover:text-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[9px] font-medium transition-colors duration-200',
                  isActive ? 'text-foreground' : 'text-muted'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-accent-violet" />
              )}
            </Link>
          );
        })}

        {/* Logout button */}
        <div className="mt-auto">
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-3 hover:bg-danger/10 transition-all duration-200 group"
            title="Déconnexion"
          >
            <LogOut size={20} className="text-muted group-hover:text-danger transition-colors" />
            <span className="text-[9px] font-medium text-muted group-hover:text-danger transition-colors">
              Quitter
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
