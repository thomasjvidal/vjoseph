const fs = require('fs');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace rgba(255, 255, 255, X) with rgba(var(--glass-rgb), X)
  content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/g, 'rgba(var(--glass-rgb),');
  
  // Replace rgba(0, 0, 0, X) with rgba(var(--shadow-rgb), X)
  content = content.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,/g, 'rgba(var(--shadow-rgb),');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed ${filePath}`);
}

['style.css', 'index.html', 'lead-carousel-premium.css', 'lab-library.js', 'app.js'].forEach(processFile);
