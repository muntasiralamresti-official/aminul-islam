const fs = require('fs');
const filePath = 'app/dashboard/students/[id]/page.jsx';
let c = fs.readFileSync(filePath, 'utf8');

const oldFunc = `const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" });
};`;

const newFunc = `const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return \`\${d.getDate()} \${months[d.getMonth()]} \${d.getFullYear()}\`;
};`;

if (c.includes(oldFunc)) {
  c = c.replace(oldFunc, newFunc);
  fs.writeFileSync(filePath, c, 'utf8');
  console.log("Successfully replaced formatDate to be hydration-safe.");
} else {
  console.log("oldFunc not found. File content:");
  console.log(c.substring(0, 500));
}
