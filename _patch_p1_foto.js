const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// Problem 1: generateCustomTemplate does not replace {{foto_1}}..{{foto_9}}
// Add those replacements after the existing avatar/foto replacements

const old1 = "  // Legacy support for {{avatar}} if used\n  output = output.replace(/{{avatar}}/g, data.avatar || '');\n  return output;";
const new1 = "  // Legacy support for {{avatar}} if used\n  output = output.replace(/{{avatar}}/g, data.avatar || '');\n  // Support {{foto_1}} through {{foto_9}} (assigned by auto-convert)\n  var imgArr = Array.isArray(data.images) ? data.images : [];\n  for (var fi = 0; fi < 9; fi++) {\n    var fSrc = imgArr[fi] || (fi === 0 ? data.avatar || '' : '');\n    output = output.replace(new RegExp('\\\\{\\\\{foto_' + (fi+1) + '\\\\}\\\\}', 'g'), fSrc);\n  }\n  return output;";

if (js.includes(old1)) {
  js = js.replace(old1, new1);
  console.log('P1: foto_1..foto_9 substitution added to generateCustomTemplate');
} else {
  const crlf = old1.replace(/\n/g, '\r\n');
  if (js.includes(crlf)) {
    js = js.replace(crlf, new1);
    console.log('P1: applied (CRLF)');
  } else {
    console.log('P1 FAIL - pattern not found');
    const idx = js.indexOf('Legacy support for {{avatar}}');
    if (idx > -1) console.log('context:', JSON.stringify(js.substring(idx-50, idx+200)));
  }
}

try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('Done P1');
