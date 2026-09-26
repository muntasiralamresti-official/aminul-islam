const fs = require('fs');
const filePath = 'app/dashboard/students/[id]/page.jsx';
let c = fs.readFileSync(filePath, 'utf8');

if (!c.includes('const formatDate =')) {
  const insertIndex = c.indexOf('export default function StudentProfilePage');
  if (insertIndex !== -1) {
    const formatFunc = `
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" });
};

`;
    c = c.substring(0, insertIndex) + formatFunc + c.substring(insertIndex);
    fs.writeFileSync(filePath, c, 'utf8');
  }
}
