const fs = require('fs');
let c = fs.readFileSync('app/api/fees/student/[id]/route.js', 'utf8');

c = c.replace(
  'select("month year amount method date status createdAt")',
  'select("month year amount discount method date status createdAt")'
);

c = c.replace(
  'const amount = Number(payment.amount) || 0;',
  'const amount = (Number(payment.amount) || 0) + (Number(payment.discount) || 0);'
);

fs.writeFileSync('app/api/fees/student/[id]/route.js', c);
