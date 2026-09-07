'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExamResultsPage({ params }) {
  const { id } = use(params);
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [examRes, resultsRes] = await Promise.all([
        fetch(`/api/exams/${id}`),
        fetch(`/api/results?exam=${id}`)
      ]);
      setExam(await examRes.json());
      setResults(await resultsRes.json());
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(fetchData);
  }, [id]);

  const handleMarkChange = (studentId, field, value) => {
    const updated = results.map(r => {
      if (r.student._id === studentId) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setResults(updated);
  };

  const handleSaveResults = async () => {
    const tId = toast.loading('Saving results...');
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: id,
          results: results.map(r => ({
            student: r.student._id,
            marksObtained: r.marksObtained === '' ? 0 : Number(r.marksObtained),
            remarks: r.remarks
          }))
        })
      });

      if (res.ok) {
        toast.success('Results saved successfully!', { id: tId });
        fetchData(); // reload to get updated status
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save results', { id: tId });
      }
    } catch (error) {
      toast.error('Failed to save results', { id: tId });
    }
  };

  if (loading) return <div className="p-4">Loading exam details...</div>;
  if (!exam || exam.error) return <div className="p-4 text-red-500">Exam not found</div>;

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/dashboard/exams" className="mr-4 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{exam.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Batch: {exam.batch?.name} | Date: {new Date(exam.date).toLocaleDateString()} | Total Marks: {exam.totalMarks}
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Student Results Entry</h2>
          <button
            onClick={handleSaveResults}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" /> Save All Marks
          </button>
        </div>

        {results.length > 0 ? (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Roll No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Marks Obtained (out of {exam.totalMarks})</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Remarks (Optional)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {results.map((result) => (
                  <tr key={result.student._id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{result.student.rollNumber}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{result.student.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <input
                        type="number"
                        min="0"
                        max={exam.totalMarks}
                        value={result.marksObtained}
                        onChange={(e) => handleMarkChange(result.student._id, 'marksObtained', e.target.value)}
                        className="block w-24 rounded-md border-gray-300 shadow-sm border p-1"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <input
                        type="text"
                        value={result.remarks}
                        onChange={(e) => handleMarkChange(result.student._id, 'remarks', e.target.value)}
                        placeholder="e.g. Needs improvement"
                        className="block w-full rounded-md border-gray-300 shadow-sm border p-1"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {result.isNew ? (
                        <span className="text-yellow-600 font-medium">Pending Entry</span>
                      ) : (
                        <span className="text-green-600 font-medium">Saved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            No active students found in this batch.
          </div>
        )}
      </div>
    </div>
  );
}
