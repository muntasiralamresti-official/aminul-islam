'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    let timer;

    const update = () => {
      const isOnline = navigator.onLine;
      setOnline(isOnline);
      clearTimeout(timer);
      if (isOnline) {
        setShowBackOnline(true);
        timer = setTimeout(() => setShowBackOnline(false), 2500);
      } else {
        setShowBackOnline(false);
      }
    };

    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online && !showBackOnline) return null;

  if (!online) {
    return (
      <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-md">
        <WifiOff className="h-4 w-4" />
        <span>Offline mode — showing your last saved data. Changes need internet.</span>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg">
      <Wifi className="h-4 w-4" />
      Back online — fresh data is available.
    </div>
  );
}
