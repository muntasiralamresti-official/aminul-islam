const fs = require('fs');
let c = fs.readFileSync('components/StudentFeeDetails.jsx', 'utf8');
c = c.replace(/unpaid: \["UNPAID", "bg-red-500 text-white", CircleDollarSign\],/, 'unpaid: ["UNPAID", "bg-red-500 text-white", CircleDollarSign],\n    due: ["DUE", "bg-red-500 text-white", CircleDollarSign],');
fs.writeFileSync('components/StudentFeeDetails.jsx', c);
