const fs = require('fs');
const c = fs.readFileSync('app/dashboard/fees/page.jsx', 'utf8');
const lines = c.split('\n');
lines.forEach((line, i) => {
  if (line.includes('Clear') && line.includes('clearStudentFilters')) {
    console.log(`Line ${i}:`, line.trim());
  }
});
