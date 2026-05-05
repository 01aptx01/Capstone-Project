const fs = require('fs');
const file = 'd:/Bin/Capstone-Project/web/machine-ui/src/app/globals.css';
let content = fs.readFileSync(file, 'utf8');

const start = content.indexOf('@keyframes pulse-red {');
const end = content.indexOf('.step-item {');

if (start === -1 || end === -1) {
  console.log('Markers not found. start:', start, 'end:', end);
  process.exit(1);
}

const segment = content.slice(start, end);
console.log('Replacing segment:', JSON.stringify(segment));

const fixed = `@keyframes pulse-red {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

`;

content = content.slice(0, start) + fixed + content.slice(end);
fs.writeFileSync(file, content, 'utf8');
console.log('CSS fixed successfully!');
