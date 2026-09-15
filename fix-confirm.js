const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/page.jsx', 'utf8');
c = c.replace(/confirmText="Delete Payment"/, 'confirmLabel="Delete Payment"');
fs.writeFileSync('app/dashboard/fees/page.jsx', c);
