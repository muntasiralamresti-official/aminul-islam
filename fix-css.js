const fs = require('fs');
let c = fs.readFileSync('app/globals.css', 'utf8');

c = c.replace(/@media print \{[\s\S]*\}\s*$/, '');
c += `
@media print {
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
}
`;
fs.writeFileSync('app/globals.css', c, 'utf8');
