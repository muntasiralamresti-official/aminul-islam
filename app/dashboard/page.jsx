'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, CreditCard, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 flex justify-center items-center h-64">Loading dashboard...</div>;

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
                <div className="flex-shrink-0">
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
            <a href="/dashboard/students/new" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Add New Student</span>
            </a>
            <a href="/dashboard/fees" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors">
              <CreditCard className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Record Payment</span>
            </a>
            <a href="/dashboard/batches/new" className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
              <GraduationCap className="h-8 w-8 text-indigo-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Batch</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
