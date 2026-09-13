'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import OfflineBanner from './OfflineBanner';
import InstallAppBanner from './InstallAppBanner';
import KeyboardShortcuts from './KeyboardShortcuts';

export default function Providers({ children }) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  return (
    <SessionProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
      <OfflineBanner />
      <InstallAppBanner />
      <KeyboardShortcuts />
      {children}
    </SessionProvider>
  );
}
