const fs = require('fs');
const filePath = 'app/dashboard/students/[id]/page.jsx';
let c = fs.readFileSync(filePath, 'utf8');

c = c.replace(
  'new Date(student.admissionDate).toLocaleDateString("en-BD")',
  'formatDate(student.admissionDate)'
);

fs.writeFileSync(filePath, c, 'utf8');
