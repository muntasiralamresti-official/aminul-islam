const fs = require('fs');
let c = fs.readFileSync('app/dashboard/page.jsx', 'utf8');

if (!c.includes('import { PieChart')) {
  c = c.replace(
    "import toast from 'react-hot-toast';",
    "import toast from 'react-hot-toast';\nimport { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';"
  );
}

const pieComponent = `
function PaymentMethodChart({ methodTotals }) {
  const data = [
    { name: 'Cash', value: methodTotals?.cash || 0, color: '#10b981' },
    { name: 'bKash', value: methodTotals?.bkash || 0, color: '#e11d48' },
    { name: 'Nagad', value: methodTotals?.nagad || 0, color: '#f59e0b' },
    { name: 'Bank', value: methodTotals?.bank || 0, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  if (data.length === 0) return <div className="py-12 text-center text-sm text-gray-500">No payment data available this month.</div>;

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={\`cell-\${index}\`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => \`? \${value.toLocaleString('en-BD')}\`}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
`;

if (!c.includes('PaymentMethodChart')) {
  c = c.replace(
    'function DashboardLoading() {',
    pieComponent + '\nfunction DashboardLoading() {'
  );
}

// Add the PieChart section after Recent Activity or beside it.
// Let's replace the grid to be grid-cols-1 lg:grid-cols-3 instead of lg:grid-cols-2?
// Wait, currently it's:
// <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
// Financial Chart takes one, Recent Activity takes another.
// We can make it lg:grid-cols-3 and add the Pie chart.

c = c.replace(
  '<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">',
  '<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">'
);

const pieChartSection = `
          <div className="dashboard-panel rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-gray-900">Payment Methods</h2>
                <p className="mt-1 text-sm text-gray-500">Collection breakdown</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                <WalletCards className="h-5 w-5" />
              </div>
            </div>
            <PaymentMethodChart methodTotals={stats.methodTotals} />
          </div>
`;

// Insert pieChartSection right after the Recent Activity div closes.
// We look for:
// <p className="mt-3 text-sm text-gray-500">No recent activity yet.</p></div>}
//             </div>
//           </div>

c = c.replace(
  '<p className="mt-3 text-sm text-gray-500">No recent activity yet.</p></div>}\n            </div>\n          </div>',
  '<p className="mt-3 text-sm text-gray-500">No recent activity yet.</p></div>}\n            </div>\n          </div>\n' + pieChartSection
);

fs.writeFileSync('app/dashboard/page.jsx', c);
