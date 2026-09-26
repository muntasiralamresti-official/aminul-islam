const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/page.jsx', 'utf8');

c = c.replace(
  'const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" }) : "-";',
  `const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return \`\${String(d.getDate()).padStart(2, '0')} \${m[d.getMonth()]} \${d.getFullYear()}\`;
};`
);

fs.writeFileSync('app/dashboard/fees/page.jsx', c, 'utf8');
