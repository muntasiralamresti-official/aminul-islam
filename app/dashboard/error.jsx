'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[420px] items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-500">The page could not load correctly. Please try again or reconnect to the internet.</p>
        <button onClick={() => reset()} className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </button>
      </div>
    </div>
  );
}
