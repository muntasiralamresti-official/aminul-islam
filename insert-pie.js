const fs = require('fs');
let c = fs.readFileSync('app/dashboard/page.jsx', 'utf8');

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

// Find the closing divs for the grid and the Quick Actions div
const searchStr = `          </div>\r\n        </div>\r\n  \r\n        <div className="dashboard-panel mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">`;

// If CRLF doesn't match perfectly, we can use regex
c = c.replace(
  /<\/div>\s*<\/div>\s*<div className="dashboard-panel mt-6 rounded-2xl bg-white/g,
  `</div>\n${pieChartSection}\n        </div>\n\n        <div className="dashboard-panel mt-6 rounded-2xl bg-white`
);

fs.writeFileSync('app/dashboard/page.jsx', c);
