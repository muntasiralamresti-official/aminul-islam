const fs = require('fs');
let c = fs.readFileSync('app/dashboard/fees/edit/[id]/page.jsx', 'utf8');

if (!c.includes('discount:')) {
  c = c.replace(
    'amount: payment.amount || "",',
    'amount: payment.amount || "", discount: payment.discount || "",'
  );
  
  c = c.replace(
    '<label className="mb-1.5 block text-sm font-semibold text-gray-700">Amount</label>',
    `<label className="mb-1.5 block text-sm font-semibold text-gray-700">Amount Paid (?)</label>`
  );

  const discountHtml = `
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Discount/Waiver (?)</label>
              <input
                min="0"
                step="0.01"
                type="number"
                value={formData.discount}
                onChange={(event) => setFormData((current) => ({ ...current, discount: event.target.value }))}
                placeholder="Optional discount"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900"
              />
            </div>`;
            
  // Let's insert the discountHtml right after the Amount div.
  c = c.replace(
    'placeholder="e.g. 1000"\n                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900"\n              />\n            </div>',
    `placeholder="e.g. 1000"\n                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900"\n              />\n            </div>` + discountHtml
  );
  
  fs.writeFileSync('app/dashboard/fees/edit/[id]/page.jsx', c);
}
