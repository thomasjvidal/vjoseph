const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// =========================================================
// FIX 1: sanitizeGeneratedHtml - inline analytics regex
// The old [\s\S]*? lazily crosses </script> boundaries,
// wiping out large HTML chunks when gtag() appears in a
// later script block. Fix with negative lookahead guard.
// =========================================================
const oldSanitize = `function sanitizeGeneratedHtml(html, data) {
  let out = String(html || '');
  // Only remove tracking/analytics scripts - don't touch images or styles
  out = out.replace(/<script\\b[^>]*\\bsrc=["']https?:\\/\\/[^"']*(?:cdnjs\\.cloudflare\\.com\\/ajax\\/libs\\/lucide|googletagmanager\\.com\\/gtm\\.js|googletagmanager\\.com\\/gtag\\/js|google-analytics\\.com)[^"']*["'][^>]*>\\s*<\\/script>/gi, '');
  out = out.replace(/<script\\b[^>]*>\\s*[\\s\\S]*?(?:googletagmanager|gtm\\.start|gtag\\(|google_tag_manager)[\\s\\S]*?<\\/script>/gi, '');
  return out;
}`;

const newSanitize = `function sanitizeGeneratedHtml(html, data) {
  let out = String(html || '');
  // Remove external tracking/analytics scripts (CDN sources)
  out = out.replace(/<script\\b[^>]*\\bsrc=["']https?:\\/\\/[^"']*(?:googletagmanager\\.com\\/gtm\\.js|googletagmanager\\.com\\/gtag\\/js|google-analytics\\.com)[^"']*["'][^>]*>\\s*<\\/script>/gi, '');
  // Remove inline analytics scripts.
  // Use (?:(?!<\\/script>)[\\s\\S])* so the match never crosses a </script> boundary.
  // This prevents accidentally consuming multiple script blocks.
  out = out.replace(/<script\\b[^>]*>(?:(?!<\\/script>)[\\s\\S])*(?:googletagmanager|gtm\\.start|gtag\\(|google_tag_manager)(?:(?!<\\/script>)[\\s\\S])*<\\/script>/gi, '');
  return out;
}`;

if (js.includes(oldSanitize)) {
  js = js.replace(oldSanitize, newSanitize);
  console.log('Fix 1: sanitizeGeneratedHtml regex fixed');
} else {
  // Try line-by-line replacement
  const fnIdx = js.indexOf('function sanitizeGeneratedHtml(');
  let depth=0, p=fnIdx, fnEnd=-1;
  while(p<js.length){if(js[p]==='{')depth++;else if(js[p]==='}'){depth--;if(depth===0){fnEnd=p+1;break;}}p++;}
  console.log('Old sanitizeGeneratedHtml at', fnIdx, 'to', fnEnd);
  console.log('Old body:', JSON.stringify(js.substring(fnIdx, fnEnd)));

  // Replace using found boundaries
  js = js.substring(0, fnIdx) + newSanitize + js.substring(fnEnd);
  console.log('Fix 1 applied via boundaries');
}

// =========================================================
// FIX 2: generateSite - add try/catch and null check for iframe
// so errors don't silently fail + show toast with error info
// =========================================================
const oldGenSite = `  const iframe = document.getElementById('sitePreview');
  var _ph = document.getElementById('previewPlaceholder');
  if (_ph) _ph.style.display = 'none';
  iframe.style.display = 'block';
  iframe.style.visibility = 'visible';
  iframe.style.opacity = '1';
  iframe.srcdoc = editableHtml;`;

const newGenSite = `  const iframe = document.getElementById('sitePreview');
  if (!iframe) { console.error('sitePreview iframe not found'); toast('Erro: preview não encontrado'); return; }
  var _ph = document.getElementById('previewPlaceholder');
  if (_ph) _ph.style.display = 'none';
  iframe.removeAttribute('srcdoc');
  iframe.style.cssText = 'display:block;visibility:visible;opacity:1;width:100%;height:100%;border:none;';
  setTimeout(function(){ iframe.srcdoc = editableHtml; }, 20);`;

if (js.includes(oldGenSite)) {
  js = js.replace(oldGenSite, newGenSite);
  console.log('Fix 2: generateSite iframe display fixed with null guard');
} else {
  // CRLF
  const crlf = oldGenSite.replace(/\n/g, '\r\n');
  if (js.includes(crlf)) {
    js = js.replace(crlf, newGenSite);
    console.log('Fix 2: generateSite iframe display fixed (CRLF)');
  } else {
    console.log('Fix 2 FAIL - pattern not found');
    const idx = js.indexOf("iframe.style.display = 'block';");
    console.log('context:', JSON.stringify(js.substring(idx-100, idx+200)));
  }
}

try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('Done');
