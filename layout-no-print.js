const fs = require('fs');
let c = fs.readFileSync('app/dashboard/layout.jsx', 'utf8');

c = c.replace('lg:hidden print:hidden', 'lg:hidden no-print');
c = c.replace('lg:flex print:hidden', 'lg:flex no-print');
c = c.replace('print:hidden", !isStudents', 'no-print", !isStudents');

fs.writeFileSync('app/dashboard/layout.jsx', c, 'utf8');
