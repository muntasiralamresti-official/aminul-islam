'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, CreditCard, AlertCircle, CheckCircle2, XCircle, CalendarCheck, WalletCards, Activity, GraduationCap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-label="Loading dashboard" role="status">
      <div className="h-8 w-64 rounded-lg bg-gray-200" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-gray-100" />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="h-9 w-9 rounded-lg bg-gray-200" />
            <div className="mt-4 h-4 w-24 rounded bg-gray-200" />
            <div className="mt-2 h-7 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="h-5 w-48 rounded bg-gray-200" />
          <div className="mt-5 h-72 rounded-lg bg-gray-100" />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="h-5 w-36 rounded bg-gray-200" />
          <div className="mt-5 space-y-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-4/5 rounded bg-gray-200" />
                  <div className="h-3 w-2/5 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const activityConfig = {
  payment: { icon: CreditCard, iconClass: 'bg-green-50 text-green-600' },
  student: { icon: Users, iconClass: 'bg-blue-50 text-blue-600' },
  exam: { icon: GraduationCap, iconClass: 'bg-purple-50 text-purple-600' },
  attendance: { icon: CalendarCheck, iconClass: 'bg-orange-50 text-orange-600' },
};

function formatRelativeTime(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load dashboard data');
      setStats(data);
    } catch (err) {
      setError(true);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <DashboardLoading />;

  if (error || !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Couldn&apos;t load dashboard</h2>
          <p className="mt-2 text-sm text-gray-500">Please check your connection and try again.</p>
          <button
            onClick={fetchDashboard}
            className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const overviewCards = [
    { name: 'Total Students', value: stats.totalStudents || 0, icon: Users, className: 'bg-blue-50 text-blue-600' },
    { name: 'Active Students', value: stats.activeStudents || 0, icon: Users, className: 'bg-indigo-50 text-indigo-600' },
    { name: "Today's Attendance", value: stats.todayAttendance || 0, icon: CalendarCheck, className: 'bg-purple-50 text-purple-600' },
    { name: 'Present', value: stats.presentToday || 0, icon: CheckCircle2, className: 'bg-green-50 text-green-600' },
    { name: 'Absent', value: stats.absentToday || 0, icon: XCircle, className: 'bg-red-50 text-red-600' },
    { name: "Today's Collection", value: `৳${(stats.todayCollection || 0).toLocaleString()}`, icon: WalletCards, className: 'bg-emerald-50 text-emerald-600' },
    { name: 'Total Due', value: `৳${(stats.totalDue || 0).toLocaleString()}`, icon: AlertCircle, className: 'bg-amber-50 text-amber-600' },
  ];

  const financialData = [
    { name: 'Expected', amount: stats.monthlyFinancial?.expected || 0 },
    { name: 'Collected', amount: stats.monthlyFinancial?.collected || 0 },
    { name: 'Due', amount: stats.monthlyFinancial?.due || 0 },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Today&apos;s Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {session?.user?.name || 'User'}! Here&apos;s what is happening at your center.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Live data
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-7">
        {overviewCards.map((item) => (
          <div key={item.name} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md sm:p-5">
            <div className={`inline-flex rounded-lg p-2.5 ${item.className}`}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 truncate text-xs font-medium text-gray-500" title={item.name}>{item.name}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Monthly Financial</h2>
              <p className="mt-1 text-sm text-gray-500">{stats.currentMonth} — Expected vs collected vs due</p>
            </div>
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `৳${value}`} />
                <Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="mt-1 text-sm text-gray-500">Latest center activity</p>
            </div>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>

          <div className="mt-5">
            {stats.recentActivity?.length ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => {
                  const config = activityConfig[activity.type] || activityConfig.student;
                  const Icon = config.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.iconClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-gray-500">{activity.detail}</p>
                          <span className="shrink-0 text-[11px] text-gray-400">{formatRelativeTime(activity.date)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Activity className="mx-auto h-9 w-9 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">No recent activity yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-gray-500">Common tasks you may need today.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/dashboard/students/new" className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:border-blue-300 hover:bg-blue-50">
            <Users className="h-6 w-6 text-blue-500" />
            <span className="text-sm font-semibold text-gray-900">Add New Student</span>
          </Link>
          <Link href="/dashboard/fees" className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:border-green-300 hover:bg-green-50">
            <CreditCard className="h-6 w-6 text-green-500" />
            <span className="text-sm font-semibold text-gray-900">Record Payment</span>
          </Link>
          <Link href="/dashboard/batches/new" className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50">
            <GraduationCap className="h-6 w-6 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-900">Create Batch</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
