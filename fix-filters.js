const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/page.jsx', 'utf8');

c = c.replace(
  '  const studentTotalPages =',
  `  const filteredStats = useMemo(() => {
    return filteredStudents.reduce((acc, student) => {
      acc.expected += student.expected || 0;
      acc.paid += student.paid || 0;
      acc.due += student.totalDue || 0;
      return acc;
    }, { expected: 0, paid: 0, due: 0 });
  }, [filteredStudents]);

  const studentTotalPages =`
);

c = c.replace(
  '{selectedYear}</p></div><div className="hidden',
  `{selectedYear}</p>
      {hasStudentFilters && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-200/50">Filtered Expected: {money(filteredStats.expected)}</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/50">Filtered Paid: {money(filteredStats.paid)}</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-700 ring-1 ring-inset ring-amber-200/50">Filtered Due: {money(filteredStats.due)}</span>
        </div>
      )}
    </div><div className="hidden`
);

fs.writeFileSync('app/dashboard/fees/page.jsx', c);
