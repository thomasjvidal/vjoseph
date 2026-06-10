const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');
const newFn = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/_new_injectEditor.js', 'utf-8');

// Find injectEditor function boundaries
const fnIdx = js.indexOf('function injectEditor(');
let depth=0, pos=fnIdx, fnEnd=-1;
while(pos<js.length){if(js[pos]==='{')depth++;else if(js[pos]==='}'){depth--;if(depth===0){fnEnd=pos+1;break;}}pos++;}
console.log('injectEditor at', fnIdx, 'to', fnEnd);

js = js.substring(0, fnIdx) + newFn.trim() + '\n' + js.substring(fnEnd);

try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('P3/4/5: injectEditor replaced - color fix + AI button + grayscale fix');
