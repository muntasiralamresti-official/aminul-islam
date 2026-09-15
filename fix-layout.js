const fs = require('fs');
let c = fs.readFileSync('app/dashboard/layout.jsx', 'utf8');

c = c.replace(
  /const mobileNavigation = \[([\s\S]*?)\];/, 
  'const mobileNavigation = [$1  { name: "Settings", href: "/dashboard/settings", icon: Settings },\n];'
);

c = c.replace(/<button type="button" onClick=\{\(\) => \{ haptic\(\); setSidebarOpen\(true\); \}\} className="native-tab flex min-h-14 flex-1 flex-col items-center justify-center rounded-xl px-1 py-1 text-\[10px\] font-semibold text-gray-500 active:scale-95 active:opacity-70"><span className="native-tab-icon mb-0\.5 flex h-7 w-10 items-center justify-center rounded-full"><Menu className="h-\[19px\] w-\[19px\]" \/><\/span>More<\/button>/, '');

fs.writeFileSync('app/dashboard/layout.jsx', c);
