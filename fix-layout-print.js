const fs = require('fs');
let c = fs.readFileSync('app/dashboard/layout.jsx', 'utf8');

c = c.replace(
  'className="min-h-dvh bg-gray-100 flex"',
  'className="min-h-dvh bg-gray-100 flex print:block print:min-h-0"'
);

c = c.replace(
  'className="min-w-0 min-h-0 flex flex-1 flex-col overflow-hidden"',
  'className="min-w-0 min-h-0 flex flex-1 flex-col overflow-hidden print:overflow-visible print:block"'
);

c = c.replace(
  'className="relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-y-auto pb-24 focus:outline-none lg:pb-0"',
  'className="relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-y-auto pb-24 focus:outline-none lg:pb-0 print:overflow-visible print:block"'
);

fs.writeFileSync('app/dashboard/layout.jsx', c, 'utf8');
