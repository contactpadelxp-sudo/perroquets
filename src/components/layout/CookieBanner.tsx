'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('parrotcare-cookies-accepted');
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('parrotcare-cookies-accepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-4 left-4 right-4 lg:left-24 z-[70] flex justify-center">
      <div className="max-w-lg w-full bg-card border border-border rounded-2xl p-4 shadow-lg shadow-black/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Shield size={20} className="text-accent-violet shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 text-sm">
          <p>
            Ce site utilise uniquement des <strong>cookies de session</strong> nécessaires
            à l&apos;authentification. Aucun cookie de pistage n&apos;est utilisé.{' '}
            <Link href="/legal" className="text-accent-violet hover:underline">
              Politique de confidentialité
            </Link>
          </p>
        </div>
        <button
          onClick={handleAccept}
          className="shrink-0 px-4 py-2 rounded-xl bg-accent-violet hover:bg-accent-violet/90 text-white text-sm font-semibold transition-colors"
        >
          Compris
        </button>
      </div>
    </div>
  );
}
