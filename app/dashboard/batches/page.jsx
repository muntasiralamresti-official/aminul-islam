'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, RefreshCw, WifiOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import ConfirmDialog from '@/components/ConfirmDialog';

const CACHE_KEY = 'aminul-islam-batches-cache';
const CACHE_TTL = 30000;

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchBatches = useCallback(async ({ force = false } = {}) => {
    let hasCachedData = false;
    if (!force) {
      try {
        const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
        if (Array.isArray(cached?.data) && Date.now() - cached.savedAt < CACHE_TTL) {
          setBatches(cached.data);
          setLoading(false);
          setRefreshing(true);
          hasCachedData = true;
        }
      } catch {}
    }

    if (!hasCachedData && batches.length === 0) setLoading(true);
    else if (!hasCachedData) setRefreshing(true);
    setError('');
    try {
      const res = await fetch('/api/batches', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load batches');
      const result = Array.isArray(data) ? data : [];
      setBatches(result);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data: result })); } catch {}
    } catch (fetchError) {
      const message = fetchError.message || 'Failed to load batches';
      if (batches.length === 0) {
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [batches.length]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/batches/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete batch');
      toast.success('Batch deleted');
      try { sessionStorage.removeItem(CACHE_KEY); } catch {}
      fetchBatches({ force: true });
    } catch (deleteError) {
      toast.error(deleteError.message || 'Error deleting batch');
    }
  };

  if (loading) {
    return <div><div className="mb-8 flex items-center justify-between"><div className="space-y-2"><div className="h-6 w-24 animate-pulse rounded bg-gray-200" /><div className="h-4 w-96 max-w-full animate-pulse rounded bg-gray-100" /></div><div className="hidden h-10 w-28 animate-pulse rounded-md bg-gray-200 sm:block" /></div><TableSkeleton columns={6} rows={6} /></div>;
  }

  if (error && batches.length === 0) {
    return <div className="flex min-h-[420px] items-center justify-center"><div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><WifiOff className="h-7 w-7" /></div><h2 className="mt-4 text-lg font-semibold text-gray-900">Couldn&apos;t load batches</h2><p className="mt-2 text-sm text-gray-500">Check your connection or try again.</p><button onClick={() => fetchBatches({ force: true })} className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw className="mr-2 h-4 w-4" /> Retry</button></div></div>;
  }

  return (
    <div className="w-full pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0"><h1 className="text-xl font-semibold text-gray-900">Batches</h1><p className="mt-2 text-sm text-gray-700">A list of all the batches in your coaching center including their name, subject, class, and schedule.</p></div>
        <div className="flex w-full items-center gap-3 sm:w-auto"><Link href="/dashboard/batches/new" className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Batch</Link></div>
      </div>

      <div className="mt-6 w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 sm:mt-8"><div className="w-full overflow-x-auto overscroll-x-contain"><table className="w-full min-w-[760px] table-fixed divide-y divide-gray-200"><colgroup><col className="w-[24%]" /><col className="w-[22%]" /><col className="w-[16%]" /><col className="w-[18%]" /><col className="w-[10%]" /><col className="w-[10%]" /></colgroup><thead className="bg-gray-50"><tr><th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subject</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Class</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Schedule</th><th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Capacity</th><th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">{batches.map((batch) => <tr key={batch._id} className="transition-colors hover:bg-gray-50/80"><td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"><div className="truncate">{batch.name}</div></td><td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><div className="truncate">{batch.subject}</div></td><td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><div className="truncate">{batch.classLevel}</div></td><td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><div className="truncate">{batch.schedule}</div></td><td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{batch.capacity}</td><td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"><Link href={`/dashboard/batches/${batch._id}/edit`} className="mr-4 text-blue-600 hover:text-blue-900" aria-label={`Edit ${batch.name}`}><Edit className="inline h-4 w-4" /></Link><button onClick={() => setDeleteId(batch._id)} className="text-red-600 hover:text-red-900" aria-label={`Delete ${batch.name}`}><Trash2 className="inline h-4 w-4" /></button></td></tr>)}{batches.length === 0 && <tr><td colSpan="6" className="py-14 text-center"><div className="mx-auto max-w-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Plus className="h-6 w-6" /></div><p className="mt-3 text-sm font-medium text-gray-900">No batches found</p><p className="mt-1 text-sm text-gray-500">Create your first batch to get started.</p></div></td></tr>}</tbody></table></div></div>
      {refreshing && <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-gray-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</div>}
      <ConfirmDialog open={Boolean(deleteId)} title="Delete batch?" message="This will permanently remove the batch from the system." confirmLabel="Delete batch" onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
