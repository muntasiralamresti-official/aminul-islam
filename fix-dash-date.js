const fs = require('fs');
let c = fs.readFileSync('app/dashboard/page.jsx', 'utf8');

c = c.replace(
  'return new Date(value).toLocaleDateString();',
  `{
    const d = new Date(value);
    const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return \`\${d.getDate()} \${m[d.getMonth()]}\`;
  }`
);

fs.writeFileSync('app/dashboard/page.jsx', c, 'utf8');
