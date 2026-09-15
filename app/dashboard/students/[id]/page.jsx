'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';

export default function StudentProfilePage({ params }) {
  const { id } = use(params);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Student not found');
        return res.json();
      })
      .then(data => setStudent(data))
      .catch(err => setError(err.message || 'Failed to load student'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" /></div>;
  if (error || !student) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"><p className="text-sm font-medium text-red-700">{error || 'Student not found'}</p><Link href="/dashboard/students" className="mt-3 inline-block text-sm text-blue-600 hover:underline">← Back to Students</Link></div>;

  const displayPhoto = student.photoUrl || student.photo;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/students" className="mr-4 text-gray-500 hover:text-gray-900"><ArrowLeft className="h-6 w-6" /></Link>
          <h1 className="text-2xl font-semibold text-gray-900">Student Profile</h1>
        </div>
        <Link href={`/dashboard/students/${student._id}/edit`} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6"><h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3><p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p></div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            {displayPhoto && <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Photo</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"><img src={displayPhoto} alt={student.name} className="h-24 w-24 object-cover rounded-md border" /></dd></div>}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Full name</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.name}</dd></div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Roll/ID Number</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.rollNumber}</dd></div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Phone</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.phone}</dd></div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Guardian Phone</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.guardianPhone}</dd></div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Class/Level</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.classLevel}</dd></div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Batch</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.batch ? `${student.batch.name} (${student.batch.subject})` : 'No Batch Assigned'}</dd></div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Monthly Fee</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.monthlyFee ? `৳ ${student.monthlyFee}` : 'Default'}</dd></div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Address</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.address || 'N/A'}</dd></div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"><dt className="text-sm font-medium text-gray-500">Admission Date</dt><dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
