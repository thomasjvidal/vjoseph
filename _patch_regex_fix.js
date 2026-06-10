const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// Fix the corrupted regex in renderSectionPicker drag-drop handler
// The template literal stripped backslashes from [\s\S] and <\/body>
const bad  = 'var bodyMatch = insert.match(/<body[^>]*>([sS]*)</body>/i);';
const good = 'var bodyMatch = insert.match(/<body[^>]*>([\\s\\S]*)<\\/body>/i);';

if (js.includes(bad)) {
  js = js.replace(bad, good);
  console.log('Regex fix applied');
} else {
  console.log('Pattern not found - current state:');
  const idx = js.indexOf('var bodyMatch = insert.match(');
  if (idx > -1) console.log(JSON.stringify(js.substring(idx, idx+80)));
}

try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('Done');
