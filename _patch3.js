const fs = require('fs');
const js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// Binary search for syntax error line
function checkChunk(code) {
  try { new Function(code); return true; } catch(e) { return false; }
}

// Find which 10k chunk fails
const chunkSize = 10000;
for (let i = 0; i < js.length; i += chunkSize) {
  const chunk = js.substring(0, i + chunkSize);
  if (!checkChunk(chunk)) {
    // Narrow down
    for (let j = i; j < Math.min(i + chunkSize, js.length); j += 100) {
      if (!checkChunk(js.substring(0, j + 100))) {
        console.log('Error around char', j, '-', j+100);
        console.log(JSON.stringify(js.substring(Math.max(0,j-50), j+150)));
        break;
      }
    }
    break;
  }
}
