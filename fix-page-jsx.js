const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/page.jsx', 'utf8');

// Replace the previous print:hidden we tried to inject
c = c.replace('<div className="space-y-5 pb-28 sm:space-y-6 sm:pb-8 print:hidden">', '<div className="space-y-5 pb-28 sm:space-y-6 sm:pb-8 no-print">');

const printTable = `
      {/* PRINT ONLY SECTION */}
      <div className="hidden print-only print:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Student Fee List</h1>
          <p className="text-gray-600">Month: {selectedMonth} {selectedYear} | Total Students: {filteredStudents.length}</p>
        </div>
        <table className="w-full border-collapse border border-gray-300 text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 font-semibold">SL</th>
              <th className="border border-gray-300 p-2 font-semibold">Name</th>
              <th className="border border-gray-300 p-2 font-semibold">Roll</th>
              <th className="border border-gray-300 p-2 font-semibold">Batch</th>
              <th className="border border-gray-300 p-2 font-semibold">Status</th>
              <th className="border border-gray-300 p-2 font-semibold">Monthly Fee</th>
              <th className="border border-gray-300 p-2 font-semibold">Paid</th>
              <th className="border border-gray-300 p-2 font-semibold">Due</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, idx) => (
              <tr key={s._id}>
                <td className="border border-gray-300 p-2">{idx + 1}</td>
                <td className="border border-gray-300 p-2 font-medium">{s.name}</td>
                <td className="border border-gray-300 p-2">{s.rollNumber}</td>
                <td className="border border-gray-300 p-2">{s.batch?.name || "-"}</td>
                <td className="border border-gray-300 p-2 capitalize">{s.paymentStatus || "unpaid"}</td>
                <td className="border border-gray-300 p-2">{s.monthlyFee ? money(s.monthlyFee) : "N/A"}</td>
                <td className="border border-gray-300 p-2">{s.currentPaid > 0 ? money(s.currentPaid) : "-"}</td>
                <td className="border border-gray-300 p-2">{s.currentDue > 0 ? money(s.currentDue) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
`;

// if the fragment ending isn't there, we need to append the table to the end.
if (!c.includes("PRINT ONLY SECTION")) {
  c = c.replace(
    '  </div>;\n}',
    '  </div>\n' + printTable + '    </>;\n}'
  );
  // Also change the return statement to wrap with Fragment if not already done.
  if (!c.includes('return <>\n<div className="space-y-5')) {
    c = c.replace('return <div className="space-y-5', 'return <>\n<div className="space-y-5');
  }
}

fs.writeFileSync('app/dashboard/fees/page.jsx', c, 'utf8');
