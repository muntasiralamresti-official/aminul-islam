const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/page.jsx', 'utf8');

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

if (!c.includes("PRINT ONLY SECTION")) {
  c = c.replace(
    '<ConfirmDialog open={Boolean(deleteId)} title="Delete payment?" message="This payment record will be permanently deleted and the fee summary will be recalculated." confirmLabel="Delete Payment" cancelText="Cancel" danger onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />',
    '<ConfirmDialog open={Boolean(deleteId)} title="Delete payment?" message="This payment record will be permanently deleted and the fee summary will be recalculated." confirmLabel="Delete Payment" cancelText="Cancel" danger onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />\n' + printTable
  );
  fs.writeFileSync('app/dashboard/fees/page.jsx', c, 'utf8');
  console.log("Table added");
} else {
  console.log("Table already exists");
}
