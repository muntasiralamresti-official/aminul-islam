'use client';

import { useEffect, useRef, useState } from 'react';

export default function GlobalDataLoader() {
  const [pending, setPending] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const originalFetch = window.fetch;
    let activeRequests = 0;

    window.fetch = async (...args) => {
      const input = args[0];
      const request = input instanceof Request ? input : null;
      const method = (args[1]?.method || request?.method || 'GET').toUpperCase();
      const requestUrl = request?.url || (typeof input === 'string' ? input : '');
      let pathname = '';
      try { pathname = requestUrl ? new URL(requestUrl, window.location.origin).pathname : ''; } catch {}
      const isApiGet = method === 'GET' && pathname.startsWith('/api/');

      if (!isApiGet) return originalFetch(...args);

      activeRequests += 1;
      setPending(activeRequests);
      if (activeRequests === 1 && !timerRef.current) {
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          if (activeRequests > 0) setShowLoader(true);
        }, 250);
      }

      try {
        return await originalFetch(...args);
      } finally {
        activeRequests = Math.max(0, activeRequests - 1);
        setPending(activeRequests);
        if (activeRequests === 0) {
          if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          setShowLoader(false);
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (pending === 0 || !showLoader) return null;

  return <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-white/35" aria-live="polite" role="status" aria-label="Loading data"><div className="rounded-2xl border border-gray-200 bg-white/95 px-8 py-7 text-center shadow-xl"><div className="relative mx-auto h-12 w-12"><div className="absolute inset-0 rounded-full border-4 border-gray-200" /><div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600" /><div className="absolute inset-[14px] animate-pulse rounded-full bg-blue-600" /></div><p className="mt-3 text-sm font-semibold text-gray-700">Loading data...</p><div className="mx-auto mt-3 h-1.5 w-28 overflow-hidden rounded-full bg-gray-100"><div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" /></div></div></div>;
}
