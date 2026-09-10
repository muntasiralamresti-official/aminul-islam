'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DISMISS_KEY = 'aminul-islam-install-dismissed';

export default function InstallAppBanner() {
  const [installEvent, setInstallEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) return;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      if (localStorage.getItem(DISMISS_KEY) !== '1') setVisible(true);
    };

    const handleInstallRequest = () => {
      if (!installEvent) {
        toast('Install is not available in this browser yet. Try Chrome/Edge on Android or desktop.', { icon: 'ℹ️' });
        return;
      }
      installEvent.prompt();
      installEvent.userChoice.finally(() => {
        setInstallEvent(null);
        setVisible(false);
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('aminul-islam-install-request', handleInstallRequest);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('aminul-islam-install-request', handleInstallRequest);
    };
  }, [installEvent]);

  if (!visible || !installEvent) return null;

  const install = () => {
    installEvent.prompt();
    installEvent.userChoice.finally(() => {
      setInstallEvent(null);
      setVisible(false);
    });
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 left-3 right-3 z-[80] mx-auto max-w-md rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl ring-1 ring-black/5 lg:bottom-5 lg:right-5 lg:left-auto">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">Install Aminul Islam</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">Add it to your Home Screen for a faster app-like experience.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={install} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Install App</button>
            <button onClick={dismiss} className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200">Not now</button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss install prompt" className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
