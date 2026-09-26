const fs = require('fs');
let c = fs.readFileSync('app/dashboard/students/[id]/StudentIdCardImage.jsx', 'utf8');

const formatFn = '((d) => { if (!d) return "N/A"; const dt = new Date(d); if(isNaN(dt.getTime())) return "N/A"; const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${dt.getDate()} ${m[dt.getMonth()]} ${dt.getFullYear()}`; })';

c = c.replace(
  'new Date(student.admissionDate).toLocaleDateString("en-BD")',
  `${formatFn}(student.admissionDate)`
);

c = c.replace(
  'new Date(student.admissionDate).toLocaleDateString("en-BD")',
  `${formatFn}(student.admissionDate)`
);

fs.writeFileSync('app/dashboard/students/[id]/StudentIdCardImage.jsx', c, 'utf8');
