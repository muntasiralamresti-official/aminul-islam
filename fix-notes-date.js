const fs = require('fs');
let c = fs.readFileSync('app/dashboard/notes/page.jsx', 'utf8');

c = c.replace(
  'const date=v=>new Date(v).toLocaleDateString("en-BD",{day:"numeric",month:"short",year:"numeric"});',
  'const date=v=>{const d=new Date(v);if(isNaN(d.getTime()))return"";const m=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;};'
);

fs.writeFileSync('app/dashboard/notes/page.jsx', c, 'utf8');
