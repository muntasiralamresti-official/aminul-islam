'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      await fetch(`/api/batches/${id}`, { method: 'DELETE' });
      fetchBatches();
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  if (loading) return <div className="p-4">Loading batches...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Batches</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the batches in your coaching center including their name, subject, class, and schedule.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/batches/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Batch
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subject</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Class</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Schedule</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Capacity</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {batches.map((batch) => (
                    <tr key={batch._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {batch.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{batch.subject}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{batch.classLevel}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{batch.schedule}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{batch.capacity}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/dashboard/batches/${batch._id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                          <Edit className="inline h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(batch._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="inline h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {batches.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-sm text-gray-500">
                        No batches found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
