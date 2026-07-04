const fs = require('fs');
let txt = fs.readFileSync('temperature.html', 'utf8');
txt = txt.replace(/\\\$\{/g, '${').replace(/\\`/g, '`');
fs.writeFileSync('temperature.html', txt, 'utf8');
console.log('Fixed temperature.html');
