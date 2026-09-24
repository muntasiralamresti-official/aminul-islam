const fs = require('fs');
let c = fs.readFileSync('models/Payment.js', 'utf8');

if (!c.includes('discount:')) {
  c = c.replace(
    'amount: {',
    `discount: {
      type: Number,
      default: 0,
    },
    amount: {`
  );
  fs.writeFileSync('models/Payment.js', c);
}
