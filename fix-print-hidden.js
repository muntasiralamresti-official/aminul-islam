const fs = require('fs');
const filePath = 'app/dashboard/fees/page.jsx';
let c = fs.readFileSync(filePath, 'utf8');

c = c.replace(
  'return <div className="space-y-5 pb-28 sm:space-y-6 sm:pb-8">',
  'return <>\n<div className="space-y-5 pb-28 sm:space-y-6 sm:pb-8 print:hidden">'
);

fs.writeFileSync(filePath, c, 'utf8');
console.log("Applied print:hidden");
