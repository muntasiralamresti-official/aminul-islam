'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('daily');
  
  // Summary state
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear());
  const [summaryData, setSummaryData] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetch('/api/batches')
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load batches');
        return data;
      })
      .then(data => setBatches(data))
      .catch(error => toast.error(error.message || 'Failed to load batches'));
  }, []);

  const fetchAttendance = async () => {
    if (!selectedBatch || !date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?batch=${selectedBatch}&date=${date}`);
      const data = await res.json();
      setAttendanceData(data);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'daily') {
      Promise.resolve().then(fetchAttendance);
    }
  }, [selectedBatch, date, activeTab]);

  const fetchSummary = async () => {
    if (!selectedBatch || !summaryMonth || !summaryYear) return;
    setSummaryLoading(true);
    try {
      const res = await fetch(`/api/attendance/summary?batch=${selectedBatch}&month=${summaryMonth}&year=${summaryYear}`);
      const data = await res.json();
      if (res.ok) {
        setSummaryData(data.summary || []);
      } else {
        toast.error('Failed to load summary');
      }
    } catch (error) {
      toast.error('Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'monthly') {
      Promise.resolve().then(fetchSummary);
    }
  }, [selectedBatch, summaryMonth, summaryYear, activeTab]);

  const handleStatusChange = (studentId, status) => {
    const updatedRecords = attendanceData.records.map(record => {
      if (record.student._id === studentId) {
        return { ...record, status };
      }
      return record;
    });
    setAttendanceData({ ...attendanceData, records: updatedRecords });
  };

  const markAllPresent = () => {
    if (!attendanceData) return;
    const updatedRecords = attendanceData.records.map(record => ({
      ...record,
      status: 'present'
    }));
    setAttendanceData({ ...attendanceData, records: updatedRecords });
  };

  const handleSave = async () => {
    if (!attendanceData) return;
    const toastId = toast.loading('Saving attendance...');
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: selectedBatch,
          date: date,
          records: attendanceData.records.map(r => ({ student: r.student._id, status: r.status }))
        })
      });

      if (res.ok) {
        toast.success('Attendance saved successfully', { id: toastId });
        fetchAttendance();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save attendance', { id: toastId });
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
          <p className="mt-2 text-sm text-gray-700">Record daily attendance and view monthly summaries.</p>
        </div>
      </div>

      <div className="mt-4">
        <nav className="flex space-x-4 border-b border-gray-200" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('daily')}
            className={`${activeTab === 'daily' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Daily Attendance
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`${activeTab === 'monthly' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Monthly Summary
          </button>
        </nav>
      </div>

      <div className="mt-6 bg-white shadow sm:rounded-md p-6 border border-gray-100">
        
        {/* Common Batch Selector */}
        <div className="mb-6 pb-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 bg-white text-black focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Choose a batch --</option>
              {batches.map(b => (
                <option key={b._id} value={b._id}>{b.name} ({b.subject})</option>
              ))}
            </select>
          </div>
          
          {activeTab === 'daily' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 text-black focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {activeTab === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
                <select
                  value={summaryMonth}
                  onChange={(e) => setSummaryMonth(parseInt(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 text-black bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                  {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Year</label>
                <input
                  type="number"
                  value={summaryYear}
                  onChange={(e) => setSummaryYear(parseInt(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 text-black focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Tab Content: Daily */}
        {activeTab === 'daily' && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-gray-500 animate-pulse">Loading student list...</div>
            ) : !selectedBatch ? (
              <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-lg mb-2">No Batch Selected</p>
                <p className="text-sm">Please select a batch from the dropdown above to mark attendance.</p>
              </div>
            ) : attendanceData?.records?.length > 0 ? (
              <div>
                <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap justify-between items-stretch sm:items-center gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                  <span className="font-medium">{attendanceData.isNew ? '✨ No record exists for this date. Creating a new one.' : '📝 Showing existing record for this date.'}</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={markAllPresent} className="px-4 py-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded font-semibold transition-colors">
                      Mark All Present
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 text-white px-5 py-2 rounded font-semibold shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      Save Attendance
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Roll No</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Student Name</th>
                        <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {attendanceData.records.map((record) => (
                        <tr key={record.student._id} className="hover:bg-gray-50 transition-colors">
                          <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">{record.student.rollNumber}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="h-10 w-10 shrink-0">
                                {record.student.photo ? (
                                  <img className="h-10 w-10 rounded-full object-cover border-2 border-gray-200" src={record.student.photo} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {record.student.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 font-medium text-gray-900">{record.student.name}</div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                            <div className="inline-flex rounded-md shadow-sm" role="group">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(record.student._id, 'present')}
                                className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${record.status === 'present' ? 'bg-green-600 text-white border-green-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(record.student._id, 'absent')}
                                className={`px-4 py-2 text-sm font-medium border-t border-b ${record.status === 'absent' ? 'bg-red-600 text-white border-red-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(record.student._id, 'late')}
                                className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${record.status === 'late' ? 'bg-yellow-500 text-white border-yellow-500 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-lg">No active students found in this batch.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Monthly */}
        {activeTab === 'monthly' && (
          <div>
            {summaryLoading ? (
              <div className="text-center py-12 text-gray-500 animate-pulse">Calculating summary...</div>
            ) : !selectedBatch ? (
              <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-lg mb-2">No Batch Selected</p>
                <p className="text-sm">Please select a batch to view the monthly summary.</p>
              </div>
            ) : summaryData.length > 0 ? (
              <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Student Name</th>
                      <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900">Total Present</th>
                      <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900">Total Absent</th>
                      <th className="px-4 py-3.5 text-center text-sm font-semibold text-gray-900">Total Late</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {summaryData.map((row) => (
                      <tr key={row.student._id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="h-8 w-8 shrink-0">
                              {row.student.photo ? (
                                <img className="h-8 w-8 rounded-full object-cover border" src={row.student.photo} alt="" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                  {row.student.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-3 font-medium text-gray-900">{row.student.name} <span className="text-gray-400 text-xs ml-1">({row.student.rollNumber})</span></div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-center font-semibold text-green-600">
                          {row.present}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-center font-semibold text-red-600">
                          {row.absent}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-center font-semibold text-yellow-600">
                          {row.late}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-lg">No attendance records found for this month.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
