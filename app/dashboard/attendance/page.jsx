'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Save,
  Users,
  XCircle,
} from 'lucide-react';
import { TableSkeleton } from '@/components/LoadingSkeleton';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AttendancePage() {
  const now = new Date();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');

  const [summaryMonth, setSummaryMonth] = useState(now.getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState(now.getFullYear());
  const [summaryData, setSummaryData] = useState([]);
  const [classDates, setClassDates] = useState([]);
  const [summaryMeta, setSummaryMeta] = useState({
    totalClasses: 0,
    averageAttendance: 0,
    studentsNeedingAttention: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    fetch('/api/batches')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load batches');
        return data;
      })
      .then((data) => setBatches(Array.isArray(data) ? data : []))
      .catch((error) => toast.error(error.message || 'Failed to load batches'));
  }, []);

  const fetchAttendance = async () => {
    if (!selectedBatch || !date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?batch=${selectedBatch}&date=${date}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load attendance');
      setAttendanceData(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load attendance');
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'daily') Promise.resolve().then(fetchAttendance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch, date, activeTab]);

  const fetchSummary = async () => {
    if (!selectedBatch || !summaryMonth || !summaryYear) return;
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const res = await fetch(`/api/attendance/summary?batch=${selectedBatch}&month=${summaryMonth}&year=${summaryYear}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load summary');
      setSummaryData(data.summary || []);
      setClassDates(data.classDates || []);
      setSummaryMeta({
        totalClasses: data.totalClasses || 0,
        averageAttendance: data.averageAttendance || 0,
        studentsNeedingAttention: data.studentsNeedingAttention || 0,
      });
    } catch (error) {
      setSummaryError(error.message || 'Failed to load summary');
      toast.error(error.message || 'Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'monthly') Promise.resolve().then(fetchSummary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch, summaryMonth, summaryYear, activeTab]);

  const handleStatusChange = (studentId, status) => {
    if (!attendanceData) return;
    setAttendanceData({
      ...attendanceData,
      records: attendanceData.records.map((record) =>
        record.student._id === studentId ? { ...record, status } : record,
      ),
    });
  };

  const markAllPresent = () => {
    if (!attendanceData) return;
    setAttendanceData({
      ...attendanceData,
      records: attendanceData.records.map((record) => ({ ...record, status: 'present' })),
    });
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
          date,
          records: attendanceData.records.map((record) => ({
            student: record.student._id,
            status: record.status,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance');
      toast.success('Attendance saved successfully', { id: toastId });
      await fetchAttendance();
    } catch (error) {
      toast.error(error.message || 'Failed to save attendance', { id: toastId });
    }
  };

  const dailyStats = useMemo(() => {
    const records = attendanceData?.records || [];
    return records.reduce(
      (acc, record) => {
        if (record.status === 'present') acc.present += 1;
        if (record.status === 'absent') acc.absent += 1;
        if (record.status === 'late') acc.late += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0 },
    );
  }, [attendanceData]);

  const selectedBatchData = batches.find((batch) => batch._id === selectedBatch);
  const years = Array.from({ length: 7 }, (_, index) => now.getFullYear() - 5 + index);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-600">Batch-wise daily attendance, monthly calendar, percentages and absence alerts.</p>
        </div>
        {selectedBatchData && (
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
            <span className="font-semibold text-gray-900">{selectedBatchData.name}</span>
            {selectedBatchData.subject ? ` · ${selectedBatchData.subject}` : ''}
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
        <button onClick={() => setActiveTab('daily')} className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold ${activeTab === 'daily' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Daily Attendance</button>
        <button onClick={() => setActiveTab('monthly')} className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold ${activeTab === 'monthly' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Monthly Calendar</button>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Batch</label>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
              <option value="">Choose a batch</option>
              {batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.name}{batch.subject ? ` (${batch.subject})` : ''}</option>)}
            </select>
          </div>

          {activeTab === 'daily' ? (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Month</label>
                <select value={summaryMonth} onChange={(e) => setSummaryMonth(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                  {MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Year</label>
                <select value={summaryYear} onChange={(e) => setSummaryYear(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                  {years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </section>

      {activeTab === 'daily' && (
        <section className="space-y-4">
          {!selectedBatch ? (
            <EmptyState title="Select a batch" text="Choose a batch above to mark daily attendance." />
          ) : loading ? (
            <TableSkeleton rows={8} columns={3} />
          ) : attendanceData?.records?.length ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat title="Students" value={attendanceData.records.length} icon={Users} />
                <MiniStat title="Present" value={dailyStats.present} icon={CheckCircle2} />
                <MiniStat title="Absent" value={dailyStats.absent} icon={XCircle} />
                <MiniStat title="Late" value={dailyStats.late} icon={Clock3} />
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{attendanceData.isNew ? 'New attendance sheet' : 'Existing attendance record'}</p>
                    <p className="mt-1 text-xs text-gray-500">Set Present, Absent or Late for every student.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button onClick={markAllPresent} className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">Mark All Present</button>
                    <button onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Save className="h-4 w-4" /> Save Attendance</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[720px] w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Roll</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Student</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendanceData.records.map((record) => (
                        <tr key={record.student._id} className={`transition-colors ${record.status === 'absent' ? 'bg-red-50/60' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-3.5 text-sm font-semibold text-gray-700">{record.student.rollNumber}</td>
                          <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{record.student.name}</td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="inline-flex overflow-hidden rounded-lg border border-gray-300 bg-white">
                              <StatusButton active={record.status === 'present'} onClick={() => handleStatusChange(record.student._id, 'present')} activeClass="bg-emerald-600 text-white">Present</StatusButton>
                              <StatusButton active={record.status === 'absent'} onClick={() => handleStatusChange(record.student._id, 'absent')} activeClass="bg-red-600 text-white">Absent</StatusButton>
                              <StatusButton active={record.status === 'late'} onClick={() => handleStatusChange(record.student._id, 'late')} activeClass="bg-amber-500 text-white">Late</StatusButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="No active students" text="There are no active students in this batch." />
          )}
        </section>
      )}

      {activeTab === 'monthly' && (
        <section className="space-y-4">
          {!selectedBatch ? (
            <EmptyState title="Select a batch" text="Choose a batch to view its monthly attendance calendar." />
          ) : summaryLoading ? (
            <TableSkeleton rows={8} columns={8} />
          ) : summaryError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
              <p className="mt-2 text-sm font-semibold text-red-900">{summaryError}</p>
              <button onClick={fetchSummary} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"><RefreshCw className="h-4 w-4" /> Retry</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MiniStat title="Classes This Month" value={summaryMeta.totalClasses} icon={CalendarDays} />
                <MiniStat title="Average Attendance" value={`${summaryMeta.averageAttendance}%`} icon={CheckCircle2} />
                <MiniStat title="Needs Attention" value={summaryMeta.studentsNeedingAttention} icon={AlertTriangle} />
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-4 sm:p-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Monthly Attendance Calendar</h2>
                      <p className="mt-1 text-xs text-gray-500">{MONTHS[summaryMonth - 1]} {summaryYear} · P = Present, A = Absent, L = Late</p>
                    </div>
                    <p className="text-xs font-medium text-gray-500">3+ consecutive absences are highlighted</p>
                  </div>
                </div>

                {summaryData.length === 0 ? (
                  <div className="p-10 text-center text-sm text-gray-500">No students found for this batch.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max divide-y divide-gray-200">
                      <thead className="bg-gray-50"><tr>
                        <th className="sticky left-0 z-10 min-w-[210px] bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Student</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">%</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-emerald-700">P</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-red-700">A</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-amber-700">L</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Streak</th>
                        {classDates.map((classDate) => <th key={classDate.date} className="min-w-[46px] px-2 py-3 text-center text-xs font-semibold text-gray-600" title={classDate.date}>{classDate.day}</th>)}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {summaryData.map((row) => (
                          <tr key={row.student._id} className={row.needsAttention ? 'bg-red-50/60' : 'hover:bg-gray-50'}>
                            <td className={`sticky left-0 z-10 px-4 py-3 ${row.needsAttention ? 'bg-red-50' : 'bg-white'}`}>
                              <div className="flex items-center gap-2">
                                {row.needsAttention && <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />}
                                <div><div className="text-sm font-semibold text-gray-900">{row.student.name}</div><div className="text-xs text-gray-500">Roll: {row.student.rollNumber}</div></div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center"><AttendancePercent value={row.attendancePercentage} /></td>
                            <td className="px-3 py-3 text-center text-sm font-semibold text-emerald-700">{row.present}</td>
                            <td className="px-3 py-3 text-center text-sm font-semibold text-red-700">{row.absent}</td>
                            <td className="px-3 py-3 text-center text-sm font-semibold text-amber-700">{row.late}</td>
                            <td className="px-3 py-3 text-center">
                              {row.maxAbsentStreak >= 3 ? <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">{row.maxAbsentStreak} A</span> : <span className="text-xs text-gray-500">{row.maxAbsentStreak || 0}</span>}
                            </td>
                            {classDates.map((classDate) => <td key={classDate.date} className="px-2 py-3 text-center"><CalendarStatus status={row.calendar?.[classDate.date]} /></td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function StatusButton({ active, onClick, activeClass, children }) {
  return <button type="button" onClick={onClick} className={`px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${active ? activeClass : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{children}</button>;
}

function MiniStat({ title, value, icon: Icon }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p><Icon className="h-5 w-5 text-gray-400" /></div><p className="mt-3 text-2xl font-bold text-gray-900">{value}</p></div>;
}

function EmptyState({ title, text }) {
  return <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center"><Users className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-3 font-semibold text-gray-700">{title}</p><p className="mt-1 text-sm text-gray-500">{text}</p></div>;
}

function AttendancePercent({ value }) {
  const number = Number(value || 0);
  const className = number >= 80 ? 'bg-emerald-50 text-emerald-700' : number >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
  return <span className={`inline-flex min-w-[58px] justify-center rounded-full px-2 py-1 text-xs font-bold ${className}`}>{number}%</span>;
}

function CalendarStatus({ status }) {
  if (!status) return <span className="text-xs text-gray-300">—</span>;
  const config = {
    present: ['P', 'bg-emerald-100 text-emerald-700'],
    absent: ['A', 'bg-red-100 text-red-700'],
    late: ['L', 'bg-amber-100 text-amber-700'],
  }[status];
  if (!config) return <span className="text-xs text-gray-300">—</span>;
  return <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${config[1]}`}>{config[0]}</span>;
}
