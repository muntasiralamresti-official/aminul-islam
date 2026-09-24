const fs = require('fs');
let c = fs.readFileSync('app/api/fees/summary/route.js', 'utf8');

c = c.replace(
  "select('student month year amount date')",
  "select('student month year amount discount date')"
);

c = c.replace(
  'const amount = Number(payment.amount) || 0;',
  'const amount = (Number(payment.amount) || 0) + (Number(payment.discount) || 0);'
);

fs.writeFileSync('app/api/fees/summary/route.js', c);
