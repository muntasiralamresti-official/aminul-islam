'use client';

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600" />
          <div className="absolute inset-[14px] animate-pulse rounded-full bg-blue-600" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-600">{label}</p>
        <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" role="status" aria-label="Loading data">
      <div className="h-12 bg-gray-50 border-b border-gray-200" />
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="grid gap-4 px-4 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((__, col) => (
              <div key={col} className="h-4 rounded bg-gray-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading cards">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="mt-4 h-8 w-20 rounded bg-gray-200" />
          <div className="mt-3 h-3 w-32 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
