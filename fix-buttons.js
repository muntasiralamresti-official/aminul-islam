const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/page.jsx', 'utf8');

c = c.replace(/const openNewPaymentModal = [\s\S]*?setShowModal\(true\);\s*\n\s*\};/, `const openNewPaymentModal = (studentId = "") => {
    router.push(studentId ? \`/dashboard/fees/new?student=\${studentId}\` : "/dashboard/fees/new");
  };`);

c = c.replace(/const openEditModal = [\s\S]*?setShowModal\(true\);\s*\n\s*\};/, `const openEditModal = (payment) => {
    router.push(\`/dashboard/fees/edit/\${payment._id}\`);
  };`);

fs.writeFileSync('app/dashboard/fees/page.jsx', c);
