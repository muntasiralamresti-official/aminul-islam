const fs = require('fs');
let c = fs.readFileSync('app/dashboard/page.jsx', 'utf8');

c = c.replace(
  '<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">',
  '<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4 lg:gap-6">'
);

c = c.replace(
  'dashboard-panel rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6 \nlg:col-span-2',
  'dashboard-panel rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6 xl:col-span-2'
);

fs.writeFileSync('app/dashboard/page.jsx', c);
