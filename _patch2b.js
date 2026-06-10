const fs = require('fs');
let lib = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/lab-library.js', 'utf-8');

// Find and replace the return block inside renderLibraryGridLanding
const oldTypeLabel = "    const typeObj  = _allTypes.find(t => t.name === item.type);\n    const typeLabel = typeObj ? typeObj.label : (item.type ? item.type.replace(/_/g,' ') : 'Landing Page');";
const newTypeLabel = "    const typeObj  = _allTypes.find(t => t.name === item.type);\n    const typeLabel = item.isBuiltin ? 'Nativo' : (typeObj ? typeObj.label : (item.type ? item.type.replace(/_/g,' ') : 'Landing Page'));\n    const bgGrad = item.isBuiltin ? 'linear-gradient(135deg,#7C3AED 0%,#06B6D4 100%)' : 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)';\n    const actionBtns = item.isBuiltin\n      ? '<button class=\"btn-secondary\" onclick=\"navigate(\\'generator\\');genGoSlide(1)\" style=\"flex:1;justify-content:center;font-size:12px;\">🎨 Usar no Gerador</button>'\n      : '<button class=\"btn-secondary\" onclick=\"editTemplateHtml(\\'landing\\',\\'' + item.id + '\\')\" style=\"flex:1;justify-content:center;font-size:12px;\">🖊️ Editar HTML</button><button class=\"btn-secondary\" onclick=\"deleteCustomTemplate(\\''+item.id+'\\')\" style=\"padding:7px 10px;justify-content:center;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#f87171;\" title=\"Excluir template\">🗑️</button>';";

if (lib.includes(oldTypeLabel)) {
  lib = lib.replace(oldTypeLabel, newTypeLabel);
  console.log('typeLabel block replaced');
} else {
  console.error('typeLabel block not found');
  const idx = lib.indexOf('const typeObj');
  console.log('context:', JSON.stringify(lib.substring(idx, idx+200)));
}

// Now replace the gradient and action buttons in the template literal
const oldGradient = "background:linear-gradient(135deg,#f59e0b 0%,#ef4444 100%);display:flex;";
const newGradient = 'background:${bgGrad};display:flex;';

// Find inside the return template literal
const oldActions = `            <button class="btn-secondary" onclick="editTemplateHtml('landing','${item.id}')" style="flex:1;justify-content:center;font-size:12px;">🖊️ Editar HTML</button>
            <button class="btn-secondary" onclick="deleteCustomTemplate('${item.id}')" style="padding:7px 10px;justify-content:center;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#f87171;" title="Excluir template">🗑️</button>`;
const newActions = '${actionBtns}';

// Use indexOf to find and replace the gradient line inside the template literal
const gradIdx = lib.indexOf('background:linear-gradient(135deg,#f59e0b 0%,#ef4444 100%);display:flex;');
if (gradIdx > -1) {
  lib = lib.substring(0, gradIdx) + 'background:${bgGrad};display:flex;' + lib.substring(gradIdx + oldGradient.length);
  console.log('gradient replaced');
} else {
  console.error('gradient not found');
}

// Replace action buttons block
const actIdx = lib.indexOf("            <button class=\"btn-secondary\" onclick=\"editTemplateHtml('landing','${item.id}')\"");
if (actIdx > -1) {
  const actEnd = lib.indexOf('</button>', actIdx + 200) + 9; // find second </button>
  const actEnd2 = lib.indexOf('</button>', actEnd) + 9;
  lib = lib.substring(0, actIdx) + '            ${actionBtns}' + lib.substring(actEnd2);
  console.log('action buttons replaced');
} else {
  console.error('action buttons not found');
}

fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/lab-library.js', lib, 'utf-8');
console.log('lab-library.js saved');
