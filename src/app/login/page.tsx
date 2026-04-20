'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function translateAuthError(msg: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Email ou mot de passe incorrect.',
    'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter.',
    'User already registered': 'Un compte existe déjà avec cet email.',
    'Signup requires a valid password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'Email address is invalid': 'Adresse email invalide.',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
    'Email rate limit exceeded': 'Trop de tentatives. Réessayez dans quelques minutes.',
    'Request rate limit reached': 'Trop de tentatives. Réessayez dans quelques minutes.',
  };
  for (const [key, value] of Object.entries(map)) {
    if (msg.includes(key)) return value;
  }
  return msg;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === 'auth' ? 'Erreur d\'authentification. Veuillez réessayer.' : null
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const handleGoogleLogin = async () => {
    if (mode === 'signup' && !consent) {
      setError('Vous devez accepter la politique de confidentialité pour créer un compte.');
      return;
    }
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(translateAuthError(error.message));
      setGoogleLoading(false);
    }
    // Note: if successful, the browser redirects to Google — no further code runs here
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === 'signup') {
      if (!consent) {
        setError('Vous devez accepter la politique de confidentialité pour créer un compte.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(translateAuthError(error.message));
      } else {
        // Try auto-login after signup (works if email confirmation is disabled in Supabase)
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!loginError) {
          // New user: create settings and go to onboarding
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) {
            await supabase.from('user_settings').insert({
              user_id: newUser.id,
              bird_name: 'Mon oiseau',
            }).select().single();
          }
          router.push('/onboarding');
          router.refresh();
        } else {
          setSuccess('Compte créé ! Un email de confirmation a été envoyé. Vérifiez votre boîte de réception.');
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(translateAuthError(error.message));
      } else {
        router.push('/');
        router.refresh();
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent-violet/10 mb-2">
            <span className="text-5xl">🦜</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ParrotCare</h1>
          <p className="text-muted text-sm">
            Suivi quotidien pour votre perroquet de compagnie
          </p>
        </div>

        {/* Card */}
        <div className="card-static p-6 space-y-6">
          {/* Mode toggle */}
          <div className="flex bg-background rounded-xl p-1">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
                mode === 'login'
                  ? 'bg-accent-violet text-white shadow-lg shadow-accent-violet/20'
                  : 'text-muted hover:text-foreground'
              )}
            >
              Connexion
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all',
                mode === 'signup'
                  ? 'bg-accent-violet text-white shadow-lg shadow-accent-violet/20'
                  : 'text-muted hover:text-foreground'
              )}
            >
              Inscription
            </button>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-white/[0.03] hover:bg-white/[0.06] transition-all text-sm font-medium disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continuer avec Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted font-medium">Email</label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet transition-colors placeholder:text-muted/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted font-medium">Mot de passe</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Minimum 6 caractères' : 'Votre mot de passe'}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent-violet transition-colors placeholder:text-muted/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* RGPD consent checkbox — signup only */}
            {mode === 'signup' && (
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-accent-violet"
                />
                <span className="text-xs text-muted leading-relaxed">
                  J&apos;ai lu et j&apos;accepte la{' '}
                  <Link
                    href="/legal"
                    target="_blank"
                    className="text-accent-violet hover:underline"
                  >
                    politique de confidentialité
                  </Link>
                  . Je consens au traitement de mes données personnelles (email)
                  pour la création et la gestion de mon compte.
                </span>
              </label>
            )}

            {/* Error / Success */}
            {error && (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-violet hover:bg-accent-violet/90 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-accent-violet/20"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-xs text-muted">
            Conçu avec soin pour vos perroquets de compagnie
          </p>
          <Link
            href="/legal"
            className="text-xs text-accent-violet hover:underline"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </div>
  );
}
