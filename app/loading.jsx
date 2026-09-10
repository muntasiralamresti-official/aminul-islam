export default function Loading() {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center px-4"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
          <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-700">Loading...</p>
        <div className="mt-2 h-2 w-24 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-1/2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
