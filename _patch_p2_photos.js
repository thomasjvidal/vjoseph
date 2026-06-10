const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// Problem 2: rebuildPreviewImagesList - also show empty/placeholder image slots
// Rewrite the entire function

const fnIdx = js.indexOf('function rebuildPreviewImagesList(');
let depth=0, pos=fnIdx, fnEnd=-1;
while(pos<js.length){if(js[pos]==='{')depth++;else if(js[pos]==='}'){depth--;if(depth===0){fnEnd=pos+1;break;}}pos++;}
console.log('rebuildPreviewImagesList at', fnIdx, 'to', fnEnd);

const newFn = `function rebuildPreviewImagesList(iframeId) {
  if (!iframeId) iframeId = 'sitePreview';
  const grid = document.getElementById('previewImagesList');
  const doc = getIframeDoc(iframeId);
  if (!grid) return;
  grid.innerHTML = '';
  if (!doc || !doc.body) {
    grid.innerHTML = '<div class="preview-image-meta" style="padding:16px;text-align:center;color:var(--text-muted)">Gere um site primeiro para ver as imagens.</div>';
    return;
  }

  function isRealImage(src) {
    if (!src || typeof src !== 'string') return false;
    const s = src.trim();
    if (!s) return false;
    if (s.startsWith('{{') || s.includes('}}')) return false;
    if (s.startsWith('data:image/svg')) return false;
    if (s.length < 5) return false;
    return true;
  }

  function isEmptySlot(src) {
    if (!src || typeof src !== 'string') return true;
    const s = src.trim();
    if (!s) return true;
    if (s.startsWith('{{') || s.includes('}}')) return true;
    return false;
  }

  // Collect all img elements
  const allImgs = Array.from(doc.querySelectorAll('img'));

  const realImgEls = allImgs.filter(img => {
    const src = (img.getAttribute ? img.getAttribute('src') : '') || '';
    return isRealImage(src);
  });
  const emptySlotEls = allImgs.filter(img => {
    const src = (img.getAttribute ? img.getAttribute('src') : '') || '';
    return isEmptySlot(src);
  });

  const bgs = (typeof extractBackgroundUrls === 'function' ? extractBackgroundUrls(doc) : [])
    .map(s => String(s).trim())
    .filter(isRealImage);

  const uniqueRealSrcs = Array.from(new Set(
    realImgEls.map(img => (img.getAttribute('src') || '').trim()).concat(bgs)
  ));

  const hasContent = uniqueRealSrcs.length > 0 || emptySlotEls.length > 0;
  if (!hasContent) {
    grid.innerHTML = '<div class="preview-image-meta" style="padding:16px;text-align:center;color:var(--text-muted)">Nenhuma imagem no site gerado.</div>';
    return;
  }

  // ---- Section: real images ----
  if (uniqueRealSrcs.length > 0) {
    const secHeader = document.createElement('div');
    secHeader.style.cssText = 'font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;padding:8px 0 6px;';
    secHeader.textContent = 'Imagens no site (' + uniqueRealSrcs.length + ')';
    grid.appendChild(secHeader);

    uniqueRealSrcs.forEach((src, idx) => {
      const item = document.createElement('div');
      item.className = 'preview-image-item';

      const thumb = document.createElement('img');
      thumb.className = 'preview-image-thumb';
      thumb.src = src;
      thumb.alt = '';
      thumb.onerror = function() { this.style.opacity = '0.3'; };

      const meta = document.createElement('div');
      meta.className = 'preview-image-meta';
      meta.textContent = (typeof getFileNameFromUrl === 'function') ? getFileNameFromUrl(src, idx) : ('imagem-' + (idx+1) + '.png');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-secondary';
      btn.textContent = 'Baixar';
      btn.addEventListener('click', async () => {
        const fileName = (typeof getFileNameFromUrl === 'function') ? getFileNameFromUrl(src, idx) : ('imagem-' + (idx+1) + '.png');
        const ok = (typeof downloadUrlAsFile === 'function') ? await downloadUrlAsFile(src, fileName) : false;
        if (ok) toast('Download iniciado');
        else { window.open(src, '_blank'); toast('Abrindo imagem em nova aba'); }
      });

      const swapBtn = document.createElement('button');
      swapBtn.type = 'button';
      swapBtn.className = 'btn-secondary';
      swapBtn.textContent = 'Trocar';
      swapBtn.addEventListener('click', async () => {
        if (typeof replacePreviewImageForUrl === 'function') {
          await replacePreviewImageForUrl(src, iframeId);
          rebuildPreviewImagesList(iframeId);
        }
      });

      item.appendChild(thumb);
      item.appendChild(meta);
      item.appendChild(btn);
      item.appendChild(swapBtn);
      grid.appendChild(item);
    });
  }

  // ---- Section: empty image slots ----
  if (emptySlotEls.length > 0) {
    const secHeader2 = document.createElement('div');
    secHeader2.style.cssText = 'font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;padding:12px 0 6px;border-top:1px solid rgba(255,255,255,.08);margin-top:8px;';
    secHeader2.textContent = 'Locais sem foto (' + emptySlotEls.length + ')';
    grid.appendChild(secHeader2);

    emptySlotEls.forEach((imgEl, idx) => {
      const item = document.createElement('div');
      item.className = 'preview-image-item';

      const thumb = document.createElement('div');
      thumb.style.cssText = 'width:60px;height:45px;background:rgba(255,255,255,.08);border:2px dashed rgba(255,255,255,.2);border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
      thumb.innerHTML = '<span style="font-size:18px;opacity:.5">🖼</span>';

      const meta = document.createElement('div');
      meta.className = 'preview-image-meta';
      meta.textContent = 'Slot ' + (idx+1) + ' (vazio)';

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn-secondary';
      addBtn.textContent = '+ Adicionar';
      addBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (ev) => {
          const file = ev.target.files && ev.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target && e.target.result ? String(e.target.result) : '';
            if (!dataUrl) return;
            imgEl.setAttribute('src', dataUrl);
            toast('Imagem adicionada!');
            rebuildPreviewImagesList(iframeId);
          };
          reader.readAsDataURL(file);
        };
        input.click();
      });

      item.appendChild(thumb);
      item.appendChild(meta);
      item.appendChild(addBtn);
      grid.appendChild(item);
    });
  }
}`;

js = js.substring(0, fnIdx) + newFn + js.substring(fnEnd);

try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('P2: rebuildPreviewImagesList updated with empty slots');
