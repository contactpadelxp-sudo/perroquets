'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      const supabase = createSupabaseBrowser();

      // Check URL for code (PKCE flow)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('Exchange error:', error.message);
          router.replace('/login?error=auth');
          return;
        }
      }

      // Check if we have a session now
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Ensure user_settings exists
        try {
          const { data: existing } = await supabase
            .from('user_settings')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!existing) {
            await supabase.from('user_settings').insert({
              user_id: user.id,
              bird_name: 'Mon Éclectus',
            });
          }
        } catch {
          // Non-critical
        }

        router.replace('/');
      } else {
        router.replace('/login?error=auth');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-accent-violet" />
        <p className="text-sm text-muted">Connexion en cours...</p>
      </div>
    </div>
  );
}
