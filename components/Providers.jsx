'use client';

import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import OfflineBanner from './OfflineBanner';
import InstallAppBanner from './InstallAppBanner';
import KeyboardShortcuts from './KeyboardShortcuts';

export default function Providers({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    }
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
