const fs = require('fs');
let c = fs.readFileSync('app/globals.css', 'utf8');

c = c.replace(/@media print \{[\s\S]*\}\s*$/, '');
c += `
@media print {
  html, body {
    height: auto !important;
    overflow: visible !important;
  }
  .no-print {
    display: none !important;
  }
  .print-only {
    display: block !important;
  }
  @page {
    margin: 1cm;
  }
}
`;
fs.writeFileSync('app/globals.css', c, 'utf8');
