'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyboardShortcuts() {
  const router = useRouter();

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

      if (!typing && event.key === '/') {
        event.preventDefault();
        const search = document.querySelector('input[aria-label="Search students"]');
        if (search) search.focus();
        return;
      }

      if (!typing && event.key.toLowerCase() === 'g') {
        const next = { d: '/dashboard', s: '/dashboard/students', b: '/dashboard/batches', f: '/dashboard/fees' }[event.key.toLowerCase()];
        if (next) router.push(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
