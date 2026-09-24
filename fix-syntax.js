const fs = require('fs');
let c = fs.readFileSync('app/api/dashboard/stats/route.js', 'utf8');

c = c.replace(/const collectionThisMonth = payments\.currentMonth\[0\]\?\.total \|\| 0;/, '');
c = c.replace(/const collectionThisMonth = collectionThisMonthAll;/, 'const collectionThisMonth = collectionThisMonthAll;');

fs.writeFileSync('app/api/dashboard/stats/route.js', c);
