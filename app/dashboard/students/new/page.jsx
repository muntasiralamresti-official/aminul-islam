'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    phone: '',
    guardianPhone: '',
    address: '',
    classLevel: '',
    batch: '',
    monthlyFee: '',
    photo: '',
    status: 'active'
  });

  useEffect(() => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(data => setBatches(data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Student registered successfully');
        router.push('/dashboard/students');
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Register New Student</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roll/ID Number</label>
              <input
                type="text"
                name="rollNumber"
                required
                value={formData.rollNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Guardian Phone</label>
              <input
                type="text"
                name="guardianPhone"
                required
                value={formData.guardianPhone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class/Level</label>
              <input
                type="text"
                name="classLevel"
                required
                value={formData.classLevel}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assign to Batch</label>
              <select
                name="batch"
                required
                value={formData.batch}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-white text-black"
              >
                <option value="" disabled>Select a batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name} ({b.subject})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Monthly Fee (৳)</label>
              <input
                type="number"
                name="monthlyFee"
                value={formData.monthlyFee}
                onChange={handleChange}
                placeholder="e.g. 1500"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {formData.photo && (
                <div className="mt-2">
                  <img src={formData.photo} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
