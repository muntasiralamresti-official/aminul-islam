'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchReport = async (selectedYear) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/financial?year=${selectedYear}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch reports');
      const result = await res.json();
      setData(result);
    } catch (error) {
      toast.error('Failed to load financial report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(year);
  }, [year]);

  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Financial Reports</h1>
          <p className="mt-2 text-sm text-gray-700">Detailed overview of monthly and yearly collections vs dues.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
          <Calendar className="h-5 w-5 text-gray-500 mr-2 ml-1" />
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border-0 focus:ring-0 text-sm font-medium text-gray-700 bg-transparent cursor-pointer"
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">Loading reports...</div>
      ) : data && (
        <div className="space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-green-100 p-4 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Yearly Collection ({data.year})</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">৳ {data.yearlyCollected.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Yearly Due ({data.year})</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">৳ {data.yearlyDue.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Out of expected ৳{data.yearlyExpected.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Monthly Breakdown</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `৳${value}`} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="collected" name="Collection" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="due" name="Due" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expected</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Collected</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {data.monthlyData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.fullMonth}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">৳ {row.expected.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">৳ {row.collected.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">৳ {row.due.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
