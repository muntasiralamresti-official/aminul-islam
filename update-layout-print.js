const fs = require('fs');
const filePath = 'app/dashboard/layout.jsx';
let c = fs.readFileSync(filePath, 'utf8');

c = c.replace(
  '<div className={clsx("fixed inset-0 z-50 lg:hidden",',
  '<div className={clsx("fixed inset-0 z-50 lg:hidden print:hidden",'
);

c = c.replace(
  '<div className="hidden flex-shrink-0 lg:flex">',
  '<div className="hidden flex-shrink-0 lg:flex print:hidden">'
);

c = c.replace(
  '<div className="safe-top flex min-h-14 flex-shrink-0 items-center border-b border-slate-200/80 bg-white/88 px-3 shadow-[0_1px_0_rgba(15,23,42,.03)] backdrop-blur-xl lg:hidden">',
  '<div className="safe-top flex min-h-14 flex-shrink-0 items-center border-b border-slate-200/80 bg-white/88 px-3 shadow-[0_1px_0_rgba(15,23,42,.03)] backdrop-blur-xl lg:hidden print:hidden">'
);

c = c.replace(
  '<header className={clsx("flex-shrink-0 border-b border-gray-200 bg-white px-3 py-2.5 sm:px-6 lg:px-8 lg:py-3", !isStudents && "hidden lg:block")}>',
  '<header className={clsx("flex-shrink-0 border-b border-gray-200 bg-white px-3 py-2.5 sm:px-6 lg:px-8 lg:py-3 print:hidden", !isStudents && "hidden lg:block")}>'
);

c = c.replace(
  '<nav className="safe-bottom fixed bottom-0 left-2 right-2 z-40 flex items-center rounded-3xl border border-slate-200/80 bg-white/94 px-1.5 pt-1.5 shadow-[0_-8px_30px_rgba(15,23,42,0.10),0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-2xl lg:hidden"',
  '<nav className="safe-bottom fixed bottom-0 left-2 right-2 z-40 flex items-center rounded-3xl border border-slate-200/80 bg-white/94 px-1.5 pt-1.5 shadow-[0_-8px_30px_rgba(15,23,42,0.10),0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-2xl lg:hidden print:hidden"'
);

fs.writeFileSync(filePath, c, 'utf8');
