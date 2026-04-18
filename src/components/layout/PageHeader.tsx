'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function PageHeader() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between pt-[env(safe-area-inset-top)] mb-2">
      {/* User avatar (mobile) */}
      <div className="lg:hidden">
        {user && (
          <div className="w-8 h-8 rounded-full bg-accent-violet/20 flex items-center justify-center text-xs font-bold text-accent-violet overflow-hidden">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              user.email?.charAt(0).toUpperCase() ?? 'U'
            )}
          </div>
        )}
      </div>

      {/* Spacer on desktop (sidebar already present) */}
      <div className="hidden lg:block" />

      {/* Settings icon */}
      <Link
        href="/parametres"
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors"
        title="Paramètres"
      >
        <Settings size={20} className="text-muted" />
      </Link>
    </div>
  );
}
