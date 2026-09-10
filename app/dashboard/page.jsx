'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, GraduationCap, CreditCard, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-label="Loading dashboard" role="status">
      <div className="flex items-center gap-3">
        <div className="h-8 w-52 rounded-lg bg-gray-200" />
        <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
      </div>
      <div className="mt-2 h-4 w-80 max-w-full rounded bg-gray-100" />

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-md bg-gray-200" />
              <div className="ml-5 flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-6 w-20 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="h-5 w-48 rounded bg-gray-200 mb-5" />
          <div className="h-72 w-full rounded-lg bg-gray-100 flex items-center justify-center">
            <div className="h-9 w-9 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="h-5 w-32 rounded bg-gray-200 mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load dashboard data');
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLoading />;

  const statCards = [
    { name: 'Total Students', stat: stats?.totalStudents || 0, icon: Users, bgColor: 'bg-blue-500' },
    { name: 'Active Batches', stat: stats?.totalBatches || 0, icon: GraduationCap, bgColor: 'bg-indigo-500' },
    { name: `Collection (${stats?.currentMonth})`, stat: `৳ ${stats?.collectionThisMonth || 0}`, icon: CreditCard, bgColor: 'bg-green-500' },
    { name: 'Estimated Due', stat: `৳ ${stats?.totalDue || 0}`, icon: AlertCircle, bgColor: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      <p className="mt-1 text-sm text-gray-500">
        Welcome back, {session?.user?.name || 'User'}! Here is what is happening today.
      </p>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className={`rounded-md p-3 ${item.bgColor}`}>
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{item.stat}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Collection Trend (Current Year)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.trend || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `৳${val}`} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} formatter={(val) => [`৳${val}`, 'Collection']} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/students/new" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Add New Student</span>
            </Link>
            <Link href="/dashboard/fees" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors">
              <CreditCard className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Record Payment</span>
            </Link>
            <Link href="/dashboard/batches/new" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <GraduationCap className="h-8 w-8 text-indigo-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Batch</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
