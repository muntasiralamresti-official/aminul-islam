'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function FeesPage() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    month: 'January',
    year: new Date().getFullYear(),
    amount: '',
    method: 'cash',
    status: 'paid'
  });

  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const fetchData = async () => {
    try {
      const [paymentsRes, studentsRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/students')
      ]);
      const pData = await paymentsRes.json();
      const sData = await studentsRes.json();
      setPayments(pData);
      setStudents(sData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewPaymentModal = () => {
    setEditMode(false);
    setEditingId(null);
    setFormData({
      student: '',
      month: 'January',
      year: new Date().getFullYear(),
      amount: '',
      method: 'cash',
      status: 'paid'
    });
    setShowModal(true);
  };

  const openEditModal = (payment) => {
    setEditMode(true);
    setEditingId(payment._id);
    setFormData({
      student: payment.student?._id || '',
      month: payment.month,
      year: payment.year,
      amount: payment.amount,
      method: payment.method,
      status: payment.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    try {
      const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to delete payment');
      }
    } catch (error) {
      alert('Error deleting payment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode ? `/api/payments/${editingId}` : '/api/payments';
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
        setFormData({ ...formData, student: '', amount: '' }); // reset some fields
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to record payment');
      }
    } catch (error) {
      alert('Failed to record payment');
    }
  };

  const filteredPayments = payments.filter(p => {
    let match = true;
    if (filterDate) {
      const pDate = new Date(p.date).toISOString().split('T')[0];
      if (pDate !== filterDate) match = false;
    }
    if (filterMonth && p.month !== filterMonth) {
      match = false;
    }
    if (filterYear && p.year.toString() !== filterYear.toString()) {
      match = false;
    }
    return match;
  });

  if (loading) return <div className="p-4">Loading fees and payments...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Fees & Payments</h1>
          <p className="mt-2 text-sm text-gray-700">Manage student monthly fees, view payment history, and record new payments.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={openNewPaymentModal}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Record Payment
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Specific Date</label>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="block rounded-md border-gray-300 shadow-sm border p-2 text-sm text-black" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Month</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="block rounded-md border-gray-300 shadow-sm border p-2 text-sm text-black bg-white">
            <option value="">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Year</label>
          <input type="number" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} placeholder="e.g. 2026" className="block rounded-md border-gray-300 shadow-sm border p-2 text-sm w-24 text-black" />
        </div>
        <div>
          <button onClick={() => { setFilterDate(''); setFilterMonth(''); setFilterYear(''); }} className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-200">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Student</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Month / Year</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Method</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date Paid</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {payment.student?.name} ({payment.student?.rollNumber})
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{payment.month}, {payment.year}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-medium">৳ {payment.amount}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{payment.method}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button onClick={() => openEditModal(payment)} className="text-blue-600 hover:text-blue-900 mr-4">
                          <Edit className="inline h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(payment._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="inline h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-sm text-gray-500">
                        No payments found matching the filters.
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
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative z-20 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editMode ? 'Edit Payment' : 'Record New Payment'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student</label>
                      <select required name="student" value={formData.student} onChange={(e) => setFormData({...formData, student: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white">
                        <option value="">Select Student</option>
                        {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Month</label>
                        <select required name="month" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white">
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Year</label>
                        <input type="number" required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount (৳)</label>
                        <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Method</label>
                        <select required value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-black bg-white">
                          <option value="cash">Cash</option>
                          <option value="bkash">bKash</option>
                          <option value="nagad">Nagad</option>
                          <option value="bank">Bank</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                    {editMode ? 'Update Payment' : 'Save Payment'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
