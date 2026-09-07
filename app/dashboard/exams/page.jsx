'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    batch: '',
    date: new Date().toISOString().split('T')[0],
    totalMarks: 100,
  });

  const fetchData = async () => {
    try {
      const [examsRes, batchesRes] = await Promise.all([
        fetch('/api/exams'),
        fetch('/api/batches')
      ]);
      const examsData = await examsRes.json();
      const batchesData = await batchesRes.json();
      if (!examsRes.ok) throw new Error(examsData.error || 'Failed to load exams');
      if (!batchesRes.ok) throw new Error(batchesData.error || 'Failed to load batches');
      setExams(examsData);
      setBatches(batchesData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchData);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading('Creating exam...');
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Exam created successfully', { id: tId });
        setShowModal(false);
        setFormData({ ...formData, title: '', totalMarks: 100 });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create exam', { id: tId });
      }
    } catch (error) {
      toast.error('An error occurred', { id: tId });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await fetch(`/api/exams/${id}`, { method: 'DELETE' });
      toast.success('Exam deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  if (loading) return <div className="p-4">Loading exams...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Exams & Results</h1>
          <p className="mt-2 text-sm text-gray-700">Manage exams and record student marks.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Exam
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Exam Title</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Batch</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Marks</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {exams.map((exam) => (
                    <tr key={exam._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{exam.title}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{exam.batch?.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(exam.date).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{exam.totalMarks}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/dashboard/exams/${exam._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          Enter Marks <Eye className="inline h-4 w-4 ml-1" />
                        </Link>
                        <button onClick={() => handleDelete(exam._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="inline h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {exams.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-4 text-center text-sm text-gray-500">
                        No exams found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="relative z-20 inline-block w-full max-w-lg align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Exam</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Exam Title</label>
                      <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm p-2 text-black" placeholder="e.g. Term 1 Physics Test" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Select Batch</label>
                      <select required value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm p-2 bg-white text-black">
                        <option value="">Select a batch...</option>
                        {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Marks</label>
                        <input type="number" required min="1" value={formData.totalMarks} onChange={(e) => setFormData({...formData, totalMarks: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 border shadow-sm p-2 text-black" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">
                    Create Exam
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
