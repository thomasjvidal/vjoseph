const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// Fix 1: sidebar toggle - save state on click
const oldToggle = js.indexOf("document.getElementById('sidebarToggle').addEventListener('click', () => {");
const oldToggleEnd = js.indexOf('});', oldToggle) + 3;
const oldToggleBlock = js.substring(oldToggle, oldToggleEnd);
console.log('old toggle block:', JSON.stringify(oldToggleBlock));

const newToggleBlock = "document.getElementById('sidebarToggle').addEventListener('click', () => {\n    var sb = document.getElementById('sidebar');\n    sb.classList.toggle('collapsed');\n    localStorage.setItem('lf_sidebar_collapsed', sb.classList.contains('collapsed') ? '1' : '0');\n  });";
js = js.substring(0, oldToggle) + newToggleBlock + js.substring(oldToggleEnd);
console.log('Toggle handler updated');

// Fix 2: replace syncSidebarViewport - remove the style.display reset, only handle mobile
const oldSync = js.indexOf('const syncSidebarViewport = () => {');
const oldSyncEnd = js.indexOf('syncSidebarViewport();', oldSync) + 'syncSidebarViewport();'.length;
const oldSyncBlock = js.substring(oldSync, oldSyncEnd);
console.log('old sync block:', JSON.stringify(oldSyncBlock));

const newSyncBlock = "const syncSidebarViewport = () => {\n    const sb = document.getElementById('sidebar');\n    if (window.matchMedia('(min-width: 901px)').matches) sb.classList.remove('mobile-open');\n  };\n  window.addEventListener('resize', syncSidebarViewport);\n  syncSidebarViewport();";
js = js.substring(0, oldSync) + newSyncBlock + js.substring(oldSyncEnd);
console.log('syncSidebarViewport fixed');

// Fix 3: Load section - always start collapsed (never restore expanded state)
// Change the "Start sidebar collapsed" block to always add collapsed
const oldLoad = "    // Start sidebar collapsed\n    const sb = document.getElementById('sidebar');\n    if (sb) sb.classList.add('collapsed');";
const newLoad = "    // Sidebar: restore user's last state, default always collapsed\n    const sbEl = document.getElementById('sidebar');\n    const sbCollapsed = localStorage.getItem('lf_sidebar_collapsed');\n    if (sbEl) {\n      // Default: collapsed. Only expand if user explicitly opened it\n      if (sbCollapsed === '0') {\n        sbEl.classList.remove('collapsed');\n      } else {\n        sbEl.classList.add('collapsed');\n      }\n    }";

if (js.includes(oldLoad)) {
  js = js.replace(oldLoad, newLoad);
  console.log('Load section updated');
} else {
  console.log('FAIL load section - trying CRLF variant');
  const crlf = oldLoad.replace(/\n/g, '\r\n');
  if (js.includes(crlf)) {
    js = js.replace(crlf, newLoad);
    console.log('Load section updated (CRLF)');
  } else {
    // Find and replace by index
    const startIdx = js.indexOf('// Start sidebar collapsed');
    if (startIdx > -1) {
      const endIdx = js.indexOf("sb.classList.add('collapsed');", startIdx) + "sb.classList.add('collapsed');".length;
      console.log('Found via indexOf at', startIdx, 'to', endIdx);
      js = js.substring(0, startIdx) + "// Sidebar: restore user's last state, default always collapsed\n    var sbEl = document.getElementById('sidebar');\n    var sbCollapsed = localStorage.getItem('lf_sidebar_collapsed');\n    if (sbEl) {\n      if (sbCollapsed === '0') { sbEl.classList.remove('collapsed'); } else { sbEl.classList.add('collapsed'); }\n    }" + js.substring(endIdx);
      console.log('Load section updated via indexOf');
    } else {
      console.log('FAIL completely');
    }
  }
}

try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('Done');
