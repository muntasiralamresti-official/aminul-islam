const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/page.jsx', 'utf8');

c = c.replace(/<\/div>[\s\r\n]*<\/div>;[\s\r\n]*\}/, '      </div>\n  </div>\n  </>;\n}');

fs.writeFileSync('app/dashboard/fees/page.jsx', c, 'utf8');
