const fs = require('fs');
const filePath = 'app/dashboard/fees/page.jsx';
let c = fs.readFileSync(filePath, 'utf8');

// Ensure Printer is imported from lucide-react
if (!c.includes('Printer,')) {
  c = c.replace(
    'Plus, Edit, Trash2, Wallet, CircleDollarSign, AlertCircle, CheckCircle2,',
    'Plus, Edit, Trash2, Wallet, CircleDollarSign, AlertCircle, CheckCircle2, Printer,'
  );
}

const clearBtnStr = '<button onClick={clearStudentFilters} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Clear</button>';
const newBtns = `<button onClick={clearStudentFilters} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">Clear</button><button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Printer className="h-4 w-4" /> Print List</button>`;

if (c.includes(clearBtnStr)) {
  c = c.replace(clearBtnStr, newBtns);
} else {
  console.log("Could not find Clear button in desktop filter");
}

// Mobile clear button
const mobileClearStr = '<button onClick={clearStudentFilters} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700">Clear</button>';
const newMobileBtns = `<button onClick={clearStudentFilters} className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">Clear</button><button onClick={() => { setShowFilters(false); setTimeout(() => window.print(), 300); }} className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white">Print</button>`;

if (c.includes(mobileClearStr)) {
  c = c.replace(mobileClearStr, newMobileBtns);
}

// Add the print-only table at the very end of the main div
const printTable = `
      {/* PRINT ONLY SECTION */}
      <div className="hidden print:block print:p-8">
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

// Inject print:hidden into the main wrapper div's class list so the entire interactive UI hides during print
c = c.replace(
  '<div className="mx-auto max-w-7xl space-y-6">',
  '<div className="mx-auto max-w-7xl space-y-6 print:hidden">'
);

// We need to add printTable right after the main wrapper div closes.
// The main wrapper is `<div className="mx-auto max-w-7xl space-y-6 print:hidden"> ... </div>;`
c = c.replace(
  '    </div>;\n  }\n',
  '    </div>\n' + printTable + '    </>;\n  }\n'
);

// Also we need to wrap the whole return in a fragment since we're returning two siblings now.
c = c.replace(
  'return <div className="mx-auto max-w-7xl space-y-6 print:hidden">',
  'return <>\n<div className="mx-auto max-w-7xl space-y-6 print:hidden">'
);


fs.writeFileSync(filePath, c, 'utf8');
console.log("Modifications done");
