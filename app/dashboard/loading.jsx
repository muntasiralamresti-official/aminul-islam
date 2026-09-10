import { TableSkeleton } from '@/components/LoadingSkeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard page">
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
      </div>
      <TableSkeleton columns={5} rows={6} />
    </div>
  );
}
