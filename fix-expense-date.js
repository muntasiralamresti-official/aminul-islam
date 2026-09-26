const fs = require('fs');
let c = fs.readFileSync('app/dashboard/daily-expense/page.jsx', 'utf8');

c = c.replace(
  'new Date(e.date).toLocaleDateString("en-BD",{weekday:"long",day:"numeric",month:"short"})',
  `((d) => { const w = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return \`\${w[d.getDay()]}, \${d.getDate()} \${m[d.getMonth()]}\`; })(new Date(e.date))`
);

fs.writeFileSync('app/dashboard/daily-expense/page.jsx', c, 'utf8');
