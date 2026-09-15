const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/new/page.jsx', 'utf8');
c = c.replace(/const money =.*/, 'const money = (value) => `\u09F3 ${Number(value || 0).toLocaleString("en-BD")}`;');
fs.writeFileSync('app/dashboard/fees/new/page.jsx', c);
try {
  let c2 = fs.readFileSync('app/dashboard/fees/edit/[id]/page.jsx', 'utf8');
  c2 = c2.replace(/const money =.*/, 'const money = (value) => `\u09F3 ${Number(value || 0).toLocaleString("en-BD")}`;');
  fs.writeFileSync('app/dashboard/fees/edit/[id]/page.jsx', c2);
} catch (e) {}
