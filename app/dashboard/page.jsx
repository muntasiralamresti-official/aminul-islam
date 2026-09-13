'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, CreditCard, AlertCircle, CheckCircle2, XCircle, CalendarCheck, WalletCards, Activity, GraduationCap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const DASHBOARD_CACHE_KEY = 'aminul-islam-dashboard-cache';
const DASHBOARD_CACHE_TTL = 15000;

function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-label="Loading dashboard" role="status">
      <div className="h-8 w-64 rounded-lg bg-gray-200" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-gray-100" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-5">
            <div className="h-10 w-10 rounded-xl bg-gray-200" />
            <div className="mt-4 h-4 w-24 rounded bg-gray-200" />
            <div className="mt-2 h-7 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6 lg:col-span-2">
          <div className="h-5 w-48 rounded bg-gray-200" /><div className="mt-5 h-72 rounded-xl bg-gray-100" />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
          <div className="h-5 w-36 rounded bg-gray-200" />
          <div className="mt-5 space-y-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="flex gap-3"><div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200" /><div className="flex-1 space-y-2"><div className="h-4 w-4/5 rounded bg-gray-200" /><div className="h-3 w-2/5 rounded bg-gray-100" /></div></div>)}</div>
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { title: 'Good Morning', tone: 'morning', subtitle: 'A great teacher inspires before they instruct.' };
  if (hour >= 12 && hour < 17) return { title: 'Good Noon', tone: 'noon', subtitle: 'Every student you guide today is a future you help shape.' };
  if (hour >= 17 && hour < 21) return { title: 'Good Evening', tone: 'evening', subtitle: 'Your patience, guidance, and effort make a difference.' };
  return { title: 'Good Night', tone: 'night', subtitle: 'Rest well, Sir. Tomorrow is another chance to inspire.' };
}

function GreetingSticker() {
  const greeting = getGreeting();
  return (
    <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-white to-indigo-50 ring-1 ring-blue-100 shadow-sm">
      <div className="flex min-h-[104px] items-center gap-4 px-4 py-3 sm:min-h-[120px] sm:px-6 sm:py-4">
        <div className="relative flex h-20 w-24 shrink-0 items-center justify-center sm:h-24 sm:w-28" aria-hidden="true">
          <div className="relative h-[76px] w-[76px] motion-safe:animate-bounce sm:h-[88px] sm:w-[88px]" style={{ animationDuration: '2.8s' }}>
            <div className="absolute left-[22px] top-[-1px] h-[10px] w-[38px] rounded-t-full bg-slate-800 shadow-sm sm:left-[26px] sm:h-[11px] sm:w-[44px]" />
            <div className="absolute left-[7px] top-[9px] h-[56px] w-[62px] rounded-[48%] bg-white shadow-[0_8px_20px_rgba(59,130,246,.16)] ring-1 ring-blue-100 sm:left-[8px] sm:top-[10px] sm:h-[64px] sm:w-[72px]">
              <span className="absolute left-[19px] top-[25px] h-2 w-2 rounded-full bg-slate-700 sm:left-[23px] sm:top-[28px]" />
              <span className="absolute right-[19px] top-[25px] h-2 w-2 rounded-full bg-slate-700 sm:right-[23px] sm:top-[28px]" />
              <span className="absolute left-1/2 top-[36px] h-2 w-4 -translate-x-1/2 rounded-b-full border-b-2 border-blue-400 sm:top-[41px]" />
            </div>
            <div className="absolute bottom-0 left-[20px] h-[30px] w-[50px] rounded-t-[18px] rounded-b-[12px] bg-blue-500 shadow-sm sm:left-[22px] sm:h-[34px] sm:w-[56px]" />
            <div className="motion-safe:animate-pulse absolute right-[-4px] top-[19px] h-[24px] w-[34px] origin-right rounded-full bg-blue-400 shadow-sm sm:right-[-7px] sm:top-[21px] sm:h-[28px] sm:w-[40px]" style={{ animationDuration: '1.05s' }} />
            <div className="absolute right-[-13px] top-[10px] h-[19px] w-[19px] rounded-[45%_55%_50%_45%] bg-blue-300 shadow-sm sm:right-[-17px] sm:top-[11px] sm:h-[22px] sm:w-[22px]" />
            <span className="motion-safe:animate-pulse absolute right-[-9px] top-[-4px] text-xl font-black text-amber-400">✦</span>
            <span className="motion-safe:animate-pulse absolute left-[-6px] top-[2px] text-sm font-black text-blue-400" style={{ animationDelay: '0.4s' }}>✦</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Hi Aminul Sir</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">{greeting.title}!</h2>
          <p className="mt-1 text-xs font-medium leading-5 text-gray-500 sm:text-sm">{greeting.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load dashboard data');
      setStats(data);
      try { sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data })); } catch {}
    } catch (err) {
      if (!silent) { setError(true); toast.error('Failed to load dashboard data'); }
    } finally { if (!silent) setLoading(false); }
  };

  useEffect(() => {
    let usedCache = false;
    try {
      const cached = JSON.parse(sessionStorage.getItem(DASHBOARD_CACHE_KEY) || 'null');
      if (cached?.data && Date.now() - cached.savedAt < DASHBOARD_CACHE_TTL) { setStats(cached.data); setLoading(false); usedCache = true; }
    } catch {}
    fetchDashboard({ silent: usedCache });
  }, []);

  if (loading) return <DashboardLoading />;
  if (error || !stats) return <div className="flex min-h-[50vh] items-center justify-center"><div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm"><AlertCircle className="mx-auto h-12 w-12 text-red-500" /><h2 className="mt-4 text-lg font-semibold text-gray-900">Couldn&apos;t load dashboard</h2><p className="mt-2 text-sm text-gray-500">Please check your connection and try again.</p><button onClick={fetchDashboard} className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Retry</button></div></div>;

  const overviewCards = [
    { name: 'Total Students', value: stats.totalStudents || 0, icon: Users, className: 'bg-blue-50 text-blue-600' },
    { name: 'Active Students', value: stats.activeStudents || 0, icon: Users, className: 'bg-indigo-50 text-indigo-600' },
    { name: "Today's Attendance", value: stats.todayAttendance || 0, icon: CalendarCheck, className: 'bg-purple-50 text-purple-600' },
    { name: 'Present', value: stats.presentToday || 0, icon: CheckCircle2, className: 'bg-green-50 text-green-600' },
    { name: 'Absent', value: stats.absentToday || 0, icon: XCircle, className: 'bg-red-50 text-red-600' },
    { name: "Today's Collection", value: `৳${(stats.todayCollection || 0).toLocaleString()}`, icon: WalletCards, className: 'bg-emerald-50 text-emerald-600' },
    { name: 'This Month Collection', value: `৳${(stats.collectionThisMonth || 0).toLocaleString()}`, icon: CreditCard, className: 'bg-teal-50 text-teal-600' },
    { name: 'Total Due', value: `৳${(stats.totalDue || 0).toLocaleString()}`, icon: AlertCircle, className: 'bg-amber-50 text-amber-600' },
  ];
  const financialData = [
    { name: 'Expected', amount: stats.monthlyFinancial?.expected || 0 },
    { name: 'Collected', amount: stats.monthlyFinancial?.collected || 0 },
    { name: 'Due', amount: stats.monthlyFinancial?.due || 0 },
  ];

  return (
    <div className="dashboard-screen pb-2">
      <GreetingSticker />
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div><h1 className="text-2xl font-semibold tracking-tight text-gray-900">Today&apos;s Overview</h1><p className="mt-1 text-sm text-gray-500">Welcome back, Aminul Sir! Here&apos;s what is happening at your center.</p></div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500"><span className="h-2 w-2 animate-pulse rounded-full bg-green-500" /> Live data</div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4 sm:gap-4 xl:grid-cols-8">
        {overviewCards.map((item) => (
          <div key={item.name} className="dashboard-stat-card group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.className} shadow-sm`}><item.icon className="h-5 w-5" aria-hidden="true" /></div>
            <p className="mt-3 truncate text-[11px] font-semibold uppercase tracking-wide text-gray-400" title={item.name}>{item.name}</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{item.value}</p>
            <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-gray-50 opacity-70 transition-transform duration-300 group-hover:scale-125" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="dashboard-panel rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold tracking-tight text-gray-900">Monthly Financial</h2><p className="mt-1 text-sm text-gray-500">{stats.currentMonth} — Expected vs collected vs due</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400"><CreditCard className="h-5 w-5" /></div></div>
          <div className="mt-5 h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={financialData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `৳${value}`} /><Tooltip formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Amount']} /><Bar dataKey="amount" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>

        <div className="dashboard-panel rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold tracking-tight text-gray-900">Recent Activity</h2><p className="mt-1 text-sm text-gray-500">Latest center activity</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400"><Activity className="h-5 w-5" /></div></div>
          <div className="mt-5">
            {stats.recentActivity?.length ? <div className="space-y-2">{stats.recentActivity.map((activity) => { const config = activityConfig[activity.type] || activityConfig.student; const Icon = config.icon; return <div key={activity.id} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-gray-800">{activity.title}</p><div className="mt-0.5 flex items-center justify-between gap-2"><p className="truncate text-xs text-gray-500">{activity.detail}</p><span className="shrink-0 text-[11px] text-gray-400">{formatRelativeTime(activity.date)}</span></div></div></div>; })}</div> : <div className="py-10 text-center"><Activity className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-3 text-sm text-gray-500">No recent activity yet.</p></div>}
          </div>
        </div>
      </div>

      <div className="dashboard-panel mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold tracking-tight text-gray-900">Quick Actions</h2><p className="mt-1 text-sm text-gray-500">Common tasks you may need today.</p></div></div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/dashboard/students/new" className="quick-action-card group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Users className="h-5 w-5" /></div><span className="text-sm font-semibold text-gray-900">Add New Student</span></Link>
          <Link href="/dashboard/fees" className="quick-action-card group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600"><CreditCard className="h-5 w-5" /></div><span className="text-sm font-semibold text-gray-900">Record Payment</span></Link>
          <Link href="/dashboard/batches/new" className="quick-action-card group flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><GraduationCap className="h-5 w-5" /></div><span className="text-sm font-semibold text-gray-900">Create Batch</span></Link>
        </div>
      </div>
    </div>
  );
}
