const fs = require('fs');
let c = fs.readFileSync('app/api/fees/student/[id]/route.js', 'utf8');

c = c.replace(
  'const method = payment.method || "other";',
  'if (payment.status !== "paid") return acc;\n      const method = payment.method || "other";'
);

fs.writeFileSync('app/api/fees/student/[id]/route.js', c);
