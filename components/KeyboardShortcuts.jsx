'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyboardShortcuts() {
  const router = useRouter();
  const sequenceTimer = useRef(null);
  const awaitingGo = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const search = document.querySelector('input[aria-label="Search students"]');
        if (search) {
          search.focus();
          search.select?.();
        }
        return;
      }

      if (typing) return;

      if (event.key === '/') {
        event.preventDefault();
        document.querySelector('input[aria-label="Search students"]')?.focus();
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'g') {
        awaitingGo.current = true;
        clearTimeout(sequenceTimer.current);
        sequenceTimer.current = setTimeout(() => { awaitingGo.current = false; }, 1200);
        return;
      }

      if (awaitingGo.current) {
        const routes = { d: '/dashboard', s: '/dashboard/students', b: '/dashboard/batches', f: '/dashboard/fees' };
        if (routes[key]) router.push(routes[key]);
        awaitingGo.current = false;
        clearTimeout(sequenceTimer.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(sequenceTimer.current);
    };
  }, [router]);

  return null;
}
