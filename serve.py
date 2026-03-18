import http.server, os, json, time, urllib.request, urllib.error
from http.server import ThreadingHTTPServer

PORT = int(os.environ.get("PORT", 3000))
BASE = os.path.dirname(os.path.abspath(__file__))
CFG  = os.path.join(BASE, 'ai-config.json')

def cfg():
    try:
        with open(CFG, encoding='utf-8') as f: return json.load(f)
    except: return {}

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=BASE, **kw)

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors(); self.end_headers()

    def do_POST(self):
        if self.path == '/api/chat':
            self._ai()
        else:
            self.send_error(404)

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _call_groq(self, groq_key, model, groq_msgs, maxtok):
        """Chama Groq com retry automático em rate limit (429)."""
        payload = json.dumps({
            'model':      model,
            'max_tokens': maxtok,
            'messages':   groq_msgs
        }).encode()
        req = urllib.request.Request(
            'https://api.groq.com/openai/v1/chat/completions',
            data=payload,
            headers={
                'Content-Type':  'application/json',
                'Authorization': f'Bearer {groq_key}',
                'User-Agent':    'VJoseph/1.0 Python/3.12'
            }
        )
        last_err = None
        for attempt in range(3):
            try:
                with urllib.request.urlopen(req, timeout=45) as r:
                    d = json.loads(r.read())
                    return d['choices'][0]['message']['content'].strip()
            except urllib.error.HTTPError as e:
                last_err = e
                if e.code == 429:
                    # Respeita o header retry-after, ou espera com backoff
                    try:
                        retry_after = int(e.headers.get('retry-after', 2))
                    except Exception:
                        retry_after = 2
                    wait = min(retry_after, 6) * (attempt + 1)
                    print(f'[Groq] Rate limit 429 — aguardando {wait}s (tentativa {attempt+1}/3)', flush=True)
                    time.sleep(wait)
                    continue
                raise  # outros erros HTTP: propaga direto
        raise last_err  # esgotou as 3 tentativas

    def _call_anthropic(self, anthropic_key, model, system, clean_msgs, maxtok):
        """Chama Anthropic Claude."""
        payload = json.dumps({
            'model':      model,
            'max_tokens': maxtok,
            'system':     system,
            'messages':   clean_msgs
        }).encode()
        req = urllib.request.Request(
            'https://api.anthropic.com/v1/messages',
            data=payload,
            headers={
                'Content-Type':      'application/json',
                'x-api-key':         anthropic_key,
                'anthropic-version': '2023-06-01'
            }
        )
        with urllib.request.urlopen(req, timeout=45) as r:
            d = json.loads(r.read())
            return d['content'][0]['text'].strip()

    def _ai(self):
        c = cfg()
        groq_key      = c.get('groq_key', '').strip()
        anthropic_key = c.get('anthropic_key', '').strip()

        if not groq_key and not anthropic_key:
            return self._err(400, 'Nenhuma API key. Adicione groq_key em ai-config.json.')

        try:
            n    = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(n))
            system   = body.get('system', 'Você é um assistente útil.')
            msgs     = body.get('messages', [])
            maxtok   = int(body.get('maxTokens', 600))
            pipeline = body.get('pipeline', False)

            clean_msgs = [m for m in msgs if m.get('role') in ('user','assistant') and m.get('content','').strip()]
            if not clean_msgs:
                clean_msgs = [{'role': 'user', 'content': 'Olá'}]

            text = None

            # ── Tenta Groq primeiro ──────────────────────────────────────────
            if groq_key:
                model = c.get('groq_model_pipeline', 'llama-3.3-70b-versatile') if pipeline \
                        else c.get('groq_model', 'llama-3.3-70b-versatile')
                groq_msgs = [{'role': 'system', 'content': system}] + clean_msgs
                try:
                    text = self._call_groq(groq_key, model, groq_msgs, maxtok)
                    print(f'[Groq OK] {model} — {len(text)} chars', flush=True)
                except Exception as groq_err:
                    print(f'[Groq FAIL] {groq_err} — tentando Anthropic...', flush=True)
                    # Cai no Anthropic se disponível
                    if not anthropic_key:
                        raise groq_err

            # ── Anthropic como fallback (ou primário se sem Groq) ────────────
            if text is None and anthropic_key:
                model = c.get('model_pipeline', 'claude-3-5-sonnet-20241022') if pipeline \
                        else c.get('model', 'claude-3-5-haiku-20241022')
                text = self._call_anthropic(anthropic_key, model, system, clean_msgs, maxtok)
                print(f'[Anthropic OK] {model} — {len(text)} chars', flush=True)

            if text is not None:
                self._ok({'text': text})
            else:
                self._err(500, 'Nenhum provider respondeu.')

        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'ignore')
            self._err(502, f'API {e.code}: {msg[:300]}')
        except Exception as e:
            self._err(500, str(e))

    def _ok(self, data):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self._cors(); self.end_headers()
        self.wfile.write(body)

    def _err(self, code, msg):
        body = json.dumps({'error': msg}).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self._cors(); self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *a):
        print(f'[{self.address_string()}] {fmt % a}', flush=True)

with ThreadingHTTPServer(('', PORT), H) as s:
    print(f'VJoseph serve.py rodando na porta {PORT} (threaded + Groq retry + Anthropic fallback)', flush=True)
    s.serve_forever()
