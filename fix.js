const fs = require('fs');

function fixFile(file) {
  let c = fs.readFileSync(file, 'utf8');

  // Fix money
  c = c.replace(/const money =.*/, 'const money = (value) => `? ${Number(value || 0).toLocaleString("en-BD")}`;');
  
  // Fix todayInput
  c = c.replace(/return \$\{date\.getFullYear\(\)\}.*/, 'return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;');
  
  // Fix className template literals if broken
  c = c.replace(/className=\{\\?`([^`]*)\$\{[^}]+\}([^`]*)\\?`\}/g, function(match) { return match.replace(/\\\$/g, '$').replace(/\\`/g, '`'); });
  
  fs.writeFileSync(file, c);
}

fixFile('app/dashboard/fees/new/page.jsx');
try { fixFile('app/dashboard/fees/edit/[id]/page.jsx'); } catch (e) {}

let pwa = fs.readFileSync('components/PwaFontSizeInitializer.jsx', 'utf8');
pwa = pwa.replace(/document\.documentElement\.style\.fontSize =.*/, 'document.documentElement.style.fontSize = `${value}px`;');
fs.writeFileSync('components/PwaFontSizeInitializer.jsx', pwa);
