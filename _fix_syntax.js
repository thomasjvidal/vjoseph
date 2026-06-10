const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// Remove the broken updateQuickPreview function entirely
const fnStart = js.indexOf('\nfunction updateQuickPreview(tpl) {');
if (fnStart === -1) { console.error('updateQuickPreview not found'); process.exit(1); }

let depth = 0, pos = fnStart + 1, fnEnd = -1;
while (pos < js.length) {
  if (js[pos] === '{') depth++;
  else if (js[pos] === '}') { depth--; if (depth === 0) { fnEnd = pos + 1; break; } }
  pos++;
}
// Remove the function
js = js.substring(0, fnStart) + js.substring(fnEnd);
console.log('Removed broken updateQuickPreview');

// Insert clean simple version before renderGeneratorTemplates
const insertBefore = '\nfunction renderGeneratorTemplates() {';
const insertIdx = js.indexOf(insertBefore);
if (insertIdx === -1) { console.error('renderGeneratorTemplates not found'); process.exit(1); }

// Use concat to avoid any escape issues in template literal
const newFn = '\nfunction updateQuickPreview(tpl) {\n' +
'  try {\n' +
'    const data = {\n' +
'      name: (document.getElementById("genName")||{}).value || "Dra. Ana Lima",\n' +
'      specialty: (document.getElementById("genSpecialty")||{}).value || "Nutricionista",\n' +
'      city: (document.getElementById("genCity")||{}).value || "Sao Paulo",\n' +
'      attendance: (document.getElementById("genAttendance")||{}).value || "Online",\n' +
'      tagline: (document.getElementById("genTagline")||{}).value || "Nutricao personalizada",\n' +
'      bio: (document.getElementById("genBio")||{}).value || "Especialista em nutricao.",\n' +
'      services: ((document.getElementById("genServices")||{}).value || "Consulta").split("\\n").filter(Boolean),\n' +
'      whatsapp: ((document.getElementById("genWhatsapp")||{}).value || "11999999999").replace(/[^0-9]/g, ""),\n' +
'      whatsapp_clean: ((document.getElementById("genWhatsapp")||{}).value || "11999999999").replace(/[^0-9]/g, ""),\n' +
'      instagram: (document.getElementById("genInstagram")||{}).value || "@draana",\n' +
'      cta: "Agendar Consulta",\n' +
'      photo: (document.getElementById("genAvatar")||{}).value || "",\n' +
'      initials: "DA",\n' +
'      images: {}\n' +
'    };\n' +
'    var html = tpl.isCustom ? generateCustomTemplate(tpl.html, data) : tpl.generator(data);\n' +
'    var iframe = document.getElementById("sitePreview");\n' +
'    var ph = document.getElementById("previewPlaceholder");\n' +
'    if (iframe && html) {\n' +
'      iframe.srcdoc = html;\n' +
'      if (ph) ph.style.display = "none";\n' +
'      iframe.style.display = "block";\n' +
'      state.generatedHTML = html;\n' +
'    }\n' +
'  } catch(e) { /* silent */ }\n' +
'}\n';

js = js.substring(0, insertIdx) + newFn + js.substring(insertIdx);
console.log('Clean updateQuickPreview inserted');

fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js, 'utf-8');
try { new Function(js); console.log('Syntax OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
