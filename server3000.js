const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, 'api-config.json');
function readConfig() {
  try { return JSON.parse(fs.readFileSync(configPath, 'utf8') || '{}'); } catch { return {}; }
}
function writeConfig(obj) {
  try { fs.writeFileSync(configPath, JSON.stringify(obj, null, 2), 'utf8'); } catch {}
}
function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }, headers || {}));
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
function sendText(res, status, text) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(text || '');
}
function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
  });
}
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost:3000');
  if (req.method === 'OPTIONS') { send(res, 204, {}); return; }
  if (u.pathname === '/api/health' && req.method === 'GET') { send(res, 200, { ok: true }); return; }
  if (u.pathname === '/api/getconfig' && req.method === 'GET') {
    const cfg = readConfig();
    
    // Função para mascarar chaves na exibição do front-end
    const maskKey = (k) => {
      if (!k) return '';
      k = String(k).trim();
      if (k.length <= 8) return '********';
      return k.substring(0, 6) + '********' + k.substring(k.length - 4);
    };
    
    send(res, 200, {
      groq_key: maskKey(cfg.groq_key),
      groq_key_2: maskKey(cfg.groq_key_2),
      groq_key_3: maskKey(cfg.groq_key_3),
      groq_model: cfg.groq_model || 'llama-3.3-70b-versatile',
      cal_url: cfg.cal_url || '',
      wa_url: cfg.wa_url || '',
      wa_key: cfg.wa_key || '',
      wa_instance: cfg.wa_instance || '',
      has_groq: !!(cfg.groq_key && cfg.groq_key.trim()),
      has_groq_2: !!(cfg.groq_key_2 && cfg.groq_key_2.trim()),
      has_groq_3: !!(cfg.groq_key_3 && cfg.groq_key_3.trim())
    });
    return;
  }
  if (u.pathname === '/api/setconfig' && req.method === 'POST') {
    const body = await parseBody(req);
    const currentCfg = readConfig();
    
    // Função auxiliar para atualizar chave apenas se for válida (não vazia e não for os asteriscos)
    const updateKey = (newVal, oldVal) => {
      if (!newVal) return oldVal || '';
      if (newVal.includes('****')) return oldVal || '';
      return newVal;
    };
    
    const cfg = Object.assign({}, currentCfg, {
      groq_key: updateKey(body.groq_key, currentCfg.groq_key),
      groq_key_2: updateKey(body.groq_key_2, currentCfg.groq_key_2),
      groq_key_3: updateKey(body.groq_key_3, currentCfg.groq_key_3),
      groq_model: body.groq_model || currentCfg.groq_model || 'llama-3.3-70b-versatile',
      cal_url: body.cal_url !== undefined ? body.cal_url : currentCfg.cal_url || '',
      wa_url: body.wa_url !== undefined ? body.wa_url : currentCfg.wa_url || '',
      wa_key: body.wa_key !== undefined ? body.wa_key : currentCfg.wa_key || '',
      wa_instance: body.wa_instance !== undefined ? body.wa_instance : currentCfg.wa_instance || ''
    });
    writeConfig(cfg);
    send(res, 200, {
      saved: true,
      has_groq: !!cfg.groq_key,
      has_groq_2: !!cfg.groq_key_2,
      has_groq_3: !!cfg.groq_key_3,
      groq_model: cfg.groq_model
    });
    return;
  }
  if (u.pathname === '/api/exportconfig' && req.method === 'GET') {
    const cfg = readConfig();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename=\"vjoseph-api-keys.json\"',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(cfg, null, 2));
    return;
  }
  if (u.pathname === '/api/chat' && req.method === 'POST') {
    const body = await parseBody(req);
    const cfg = readConfig();
    const keys = [cfg.groq_key, cfg.groq_key_2, cfg.groq_key_3].filter(k => k && k.trim());
    
    if (!keys.length) {
      send(res, 400, { error: 'Nenhuma API key configurada. Acesse Configuracoes no app e adicione sua chave Groq (gratuita).' });
      return;
    }

    const system = body.system || 'Você é um assistente útil.';
    let msgs = Array.isArray(body.messages) ? body.messages : [];
    const clean_msgs = msgs.filter(m => ['user', 'assistant'].includes(m.role) && m.content && m.content.trim());
    if (!clean_msgs.length) clean_msgs.push({ role: 'user', content: 'Olá' });
    
    const groq_msgs = [{ role: 'system', content: system }, ...clean_msgs];
    const maxtok = parseInt(body.maxTokens) || 600;
    const groq_model = body.pipeline ? (cfg.groq_model_pipeline || 'llama-3.3-70b-versatile') : (cfg.groq_model || 'llama-3.3-70b-versatile');
    
    let text = null;
    let lastError = 'Todas as chaves falharam.';

    for (let i = 0; i < keys.length; i++) {
      try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + keys[i]
          },
          body: JSON.stringify({
            model: groq_model,
            max_tokens: maxtok,
            messages: groq_msgs
          })
        });
        
        if (!r.ok) {
          lastError = 'HTTP ' + r.status + ' - ' + await r.text();
          console.error('[Groq erro] chave #' + (i+1), lastError);
          continue;
        }
        
        const data = await r.json();
        text = data.choices[0].message.content.trim();
        console.log('[Groq OK] chave #' + (i+1));
        break;
      } catch (e) {
        lastError = e.message;
        console.error('[Groq exception] chave #' + (i+1), lastError);
      }
    }

    if (text !== null) {
      send(res, 200, { text });
    } else {
      send(res, 503, { error: lastError });
    }
    return;
  }
  if (u.pathname === '/api/calendar' && req.method === 'GET') {
    const calUrl = u.searchParams.get('url') || '';
    if (!calUrl) { sendText(res, 400, 'Missing url'); return; }
    try {
      const r = await fetch(calUrl);
      if (!r.ok) { sendText(res, r.status, 'HTTP ' + r.status); return; }
      const txt = await r.text();
      sendText(res, 200, txt);
    } catch (e) {
      sendText(res, 503, 'Fetch error');
    }
    return;
  }
  
  // Serve static files from the root directory
  if (req.method === 'GET') {
    let filePath = path.join(__dirname, u.pathname === '/' ? 'index.html' : u.pathname);
    
    // Check if file exists
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        send(res, 404, { error: 'Not found' });
        return;
      }
      
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          send(res, 500, { error: 'Server error' });
          return;
        }
        
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
      });
    });
    return;
  }

  send(res, 404, { error: 'Not found' });
});
const PORT = 3000;
server.listen(PORT, () => {
  console.log('API server listening on http://localhost:' + PORT);
});
