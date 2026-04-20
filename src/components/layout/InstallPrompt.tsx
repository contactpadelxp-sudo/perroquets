'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('parrotcare-install-dismissed')) {
      setDismissed(true);
      return;
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDismissed(true);
      return;
    }

    // Android/Chrome: beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: detect Safari on iPhone/iPad
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isInStandaloneMode) {
      // Show after a delay
      setTimeout(() => setShowIOSPrompt(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIOSPrompt(false);
    localStorage.setItem('parrotcare-install-dismissed', 'true');
  };

  if (dismissed) return null;

  // Android/Chrome prompt
  if (deferredPrompt) {
    return (
      <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-80 z-[60] bg-card border border-accent-violet/30 rounded-2xl p-4 shadow-lg shadow-accent-violet/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-violet/10 flex items-center justify-center shrink-0">
            <Download size={18} className="text-accent-violet" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Installer ParrotCare</p>
            <p className="text-xs text-muted mt-0.5">
              Accédez rapidement depuis votre écran d&apos;accueil
            </p>
          </div>
          <button onClick={handleDismiss} className="p-1 text-muted hover:text-foreground shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 py-2.5 rounded-xl bg-accent-violet text-white text-sm font-semibold transition-colors active:bg-accent-violet/80"
          >
            Installer
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 rounded-xl bg-white/5 text-sm text-muted active:bg-white/10 transition-colors"
          >
            Plus tard
          </button>
        </div>
      </div>
    );
  }

  // iOS prompt (Safari)
  if (showIOSPrompt) {
    return (
      <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-80 z-[60] bg-card border border-border rounded-2xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-violet/10 flex items-center justify-center shrink-0">
            <Share size={18} className="text-accent-violet" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Installer ParrotCare</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Appuyez sur <Share size={12} className="inline text-accent-violet" /> puis
              <strong> Sur l&apos;écran d&apos;accueil</strong> pour installer l&apos;app.
            </p>
          </div>
          <button onClick={handleDismiss} className="p-1 text-muted hover:text-foreground shrink-0">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
