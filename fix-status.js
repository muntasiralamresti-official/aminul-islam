const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/page.jsx', 'utf8');

// Replace the filter logic
c = c.replace(
  'if (paymentStatusFilter && student.paymentStatus !== paymentStatusFilter) return false;',
  `if (paymentStatusFilter) {
          if (paymentStatusFilter === 'not-set') {
            if (student.hasCustomFee !== false) return false;
          } else {
            if (student.paymentStatus !== paymentStatusFilter) return false;
          }
        }`
);

// Replace the two selects
c = c.split('<option value="unpaid">Unpaid</option></select>').join('<option value="unpaid">Unpaid</option><option value="not-set">Fee Not Set</option></select>');

fs.writeFileSync('app/dashboard/fees/page.jsx', c);
