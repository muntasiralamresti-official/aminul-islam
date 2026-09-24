const fs = require('fs');
let c = fs.readFileSync('app/api/fees/summary/route.js', 'utf8');

c = c.replace(/const payments = studentIds\.length\s*\?\s*await Payment\.find\(\{\s*status: 'paid',\s*student: \{ \$in: studentIds \},\s*\}\)\s*\.select\('student month year amount date'\)\s*\.lean\(\)\s*:\s*\[\];/, `const payments = await Payment.find({ status: 'paid' }).select('student month year amount date').lean();`);

c = c.replace(/acc\.totalCollected \+= row\.paid;/, `// totalCollected will be calculated separately from ALL payments to ensure it matches the actual cash collected`);

c = c.replace(/return NextResponse\.json\(\{/, `
    let trueTotalCollected = 0;
    for (const p of payments) {
      if (p.month === month && Number(p.year) === year) {
        trueTotalCollected += Number(p.amount) || 0;
      }
    }
    summary.totalCollected = trueTotalCollected;

    return NextResponse.json({`);

fs.writeFileSync('app/api/fees/summary/route.js', c);
