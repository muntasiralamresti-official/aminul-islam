'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Eye, RefreshCw, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', batch: '', date: new Date().toISOString().split('T')[0], totalMarks: 100 });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [examsRes, batchesRes] = await Promise.all([fetch('/api/exams'), fetch('/api/batches')]);
      const examsData = await examsRes.json();
      const batchesData = await batchesRes.json();
      if (!examsRes.ok) throw new Error(examsData.error || 'Failed to load exams');
      if (!batchesRes.ok) throw new Error(batchesData.error || 'Failed to load batches');
      setExams(examsData);
      setBatches(batchesData);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load data');
      toast.error(fetchError.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading('Creating exam...');
    try {
      const res = await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) {
        toast.success('Exam created successfully', { id: tId });
        setShowModal(false);
        setFormData({ ...formData, title: '', totalMarks: 100 });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create exam', { id: tId });
      }
    } catch (submitError) {
      toast.error(submitError.message || 'An error occurred', { id: tId });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete exam');
      toast.success('Exam deleted');
      fetchData();
    } catch (deleteError) {
      toast.error(deleteError.message || 'Failed to delete exam');
    }
  };

  if (loading) return <TableSkeleton columns={5} rows={7} />;

  if (error && exams.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><WifiOff className="h-7 w-7" /></div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Couldn&apos;t load exams</h2>
          <p className="mt-2 text-sm text-gray-500">Check your connection and try again.</p>
          <button onClick={fetchData} className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><RefreshCw className="mr-2 h-4 w-4" /> Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Exams & Results</h1>
          <p className="mt-2 text-sm text-gray-700">Manage exams and record student marks.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button onClick={() => setShowModal(true)} className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Create Exam
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-x-auto rounded-xl shadow-sm ring-1 ring-black/5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Exam Title</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Batch</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Marks</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {exams.map((exam) => (
                    <tr key={exam._id} className="transition-colors hover:bg-gray-50/80">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{exam.title}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{exam.batch?.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(exam.date).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{exam.totalMarks}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/dashboard/exams/${exam._id}`} className="text-blue-600 hover:text-blue-900 mr-4">Enter Marks <Eye className="inline h-4 w-4 ml-1" /></Link>
                        <button onClick={() => setDeleteId(exam._id)} className="text-red-600 hover:text-red-900" aria-label={`Delete ${exam.title}`}><Trash2 className="inline h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {exams.length === 0 && <tr><td colSpan="5" className="py-14 text-center text-sm text-gray-500"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Plus className="h-6 w-6" /></div><p className="mt-3 font-medium text-gray-900">No exams found</p><p className="mt-1">Create an exam to get started.</p></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="ui-modal fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-8 text-center">
            <button className="fixed inset-0 bg-gray-950/45 backdrop-blur-[2px]" aria-label="Close modal" onClick={() => setShowModal(false)} />
            <div className="ui-modal-panel relative z-10 inline-block w-full max-w-lg overflow-hidden rounded-2xl bg-white text-left shadow-2xl ring-1 ring-black/5">
              <form onSubmit={handleSubmit}>
                <div className="px-5 pb-5 pt-6 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Create New Exam</h3>
                  <div className="mt-5 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Exam Title</label><input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full rounded-xl border border-gray-300 p-2.5 text-black shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="e.g. Term 1 Physics Test" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Select Batch</label><select required value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} className="mt-1 block w-full rounded-xl border border-gray-300 bg-white p-2.5 text-black shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="">Select a batch...</option>{batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}</select></div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="block text-sm font-medium text-gray-700">Date</label><input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full rounded-xl border border-gray-300 p-2.5 text-black shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div><label className="block text-sm font-medium text-gray-700">Total Marks</label><input type="number" required min="1" value={formData.totalMarks} onChange={(e) => setFormData({...formData, totalMarks: e.target.value})} className="mt-1 block w-full rounded-xl border border-gray-300 p-2.5 text-black shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div>
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button><button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Create Exam</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={Boolean(deleteId)} title="Delete exam?" message="This will permanently remove the exam and its record from the system." confirmLabel="Delete exam" onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
