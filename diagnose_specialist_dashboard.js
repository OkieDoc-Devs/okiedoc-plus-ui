const fs = require('fs');
const parser = require('@babel/parser');
const path = 'src/Specialists/SpecialistDashboard.jsx';
const code = fs.readFileSync(path, 'utf8');
try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'classProperties',
      'optionalChaining',
      'nullishCoalescingOperator',
    ],
  });
  console.log('PARSE_OK');
} catch (err) {
  console.error('PARSE_ERROR');
  console.error(err.message);
  if (err.loc) {
    console.error('line', err.loc.line, 'column', err.loc.column);
    const lines = code.split('\n');
    const start = Math.max(0, err.loc.line - 3);
    const end = Math.min(lines.length, err.loc.line + 2);
    console.error('--- context ---');
    for (let i = start; i < end; i++) {
      const marker = i + 1 === err.loc.line ? '>>' : '  ';
      console.error(`${marker} ${i + 1}: ${lines[i]}`);
    }
  }
  process.exit(1);
}
