const fs = require('fs');
let pwa = fs.readFileSync('components/PwaFontSizeInitializer.jsx', 'utf8');
pwa = pwa.replace(/document\.documentElement\.style\.fontSize =.*/, 'document.documentElement.style.fontSize = `${value}px`;');
fs.writeFileSync('components/PwaFontSizeInitializer.jsx', pwa);
