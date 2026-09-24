const fs = require('fs');
let c = fs.readFileSync('app/api/fees/student/[id]/route.js', 'utf8');

c = c.replace(
  'const payments = await Payment.find({ student: student._id, status: "paid" })',
  'const payments = await Payment.find({ student: student._id })'
);

c = c.replace(
  'const amount = Number(payment.amount) || 0;',
  `const amount = Number(payment.amount) || 0;
      if (payment.status !== "paid") continue;`
);

fs.writeFileSync('app/api/fees/student/[id]/route.js', c);
