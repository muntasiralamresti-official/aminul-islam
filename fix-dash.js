const fs = require('fs');
let c = fs.readFileSync('app/api/dashboard/stats/route.js', 'utf8');

c = c.replace(
  "select('student amount').lean()",
  "select('student amount discount method').lean()"
);

c = c.replace(
  `for (const p of paymentsForDue) {
      collectionThisMonthAll += p.amount;
      if (p.student) {
        paidByStudent[p.student] = (paidByStudent[p.student] || 0) + p.amount;
      }
    }`,
  `const methodTotals = { cash: 0, bkash: 0, nagad: 0, bank: 0 };
    for (const p of paymentsForDue) {
      collectionThisMonthAll += p.amount;
      const method = (p.method || 'cash').toLowerCase();
      if (methodTotals[method] !== undefined) methodTotals[method] += p.amount;
      else methodTotals[method] = p.amount;
      
      if (p.student) {
        paidByStudent[p.student] = (paidByStudent[p.student] || 0) + p.amount + (p.discount || 0);
      }
    }`
);

c = c.replace(
  'recentActivity });',
  'recentActivity, methodTotals });'
);

fs.writeFileSync('app/api/dashboard/stats/route.js', c);
