const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/edit/[id]/page.jsx', 'utf8');

c = c.replace(/\{selectedStudentSummary && \([\s\S]*?<\/div>\s*\)\}/, `{selectedStudentSummary && (
              <div className="mt-3 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                <div>Monthly<br /><strong className="text-gray-900">{money(selectedStudentSummary.student?.monthlyFee || 0)}</strong></div>
                <div>Total due<br /><strong className="text-blue-700">{money(selectedStudentSummary.totalOutstanding || 0)}</strong></div>
                <div>Previous due<br /><strong className="text-amber-700">{money(selectedStudentSummary.previousDue || 0)}</strong></div>
              </div>
            )}`);

fs.writeFileSync('app/dashboard/fees/edit/[id]/page.jsx', c);
