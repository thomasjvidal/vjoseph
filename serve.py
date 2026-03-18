import http.server, os, json, urllib.request, urllib.error
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

    def _ai(self):
        c = cfg()

        # Decide provider: usa Groq se tiver groq_key, senão tenta Anthropic
        groq_key      = c.get('groq_key', '').strip()
        anthropic_key = c.get('anthropic_key', '').strip()

        if not groq_key and not anthropic_key:
            return self._err(400, 'Nenhuma API key encontrada. Abra ai-config.json e cole sua chave Groq gratuita.')

        try:
            n    = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(n))
            system   = body.get('system', 'Você é um assistente útil.')
            msgs     = body.get('messages', [])
            maxtok   = int(body.get('maxTokens', 600))
            pipeline = body.get('pipeline', False)

            # Filtra mensagens vazias
            clean_msgs = [m for m in msgs if m.get('role') in ('user','assistant') and m.get('content','').strip()]
            if not clean_msgs:
                clean_msgs = [{'role': 'user', 'content': 'Olá'}]

            # ── GROQ (OpenAI-compatible, gratuito) ──────────────────────────
            if groq_key:
                model = c.get('groq_model_pipeline', 'llama-3.3-70b-versatile') if pipeline \
                        else c.get('groq_model', 'llama-3.3-70b-versatile')

                # Groq usa formato OpenAI: system fica dentro de messages
                groq_msgs = [{'role': 'system', 'content': system}] + clean_msgs

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
                with urllib.request.urlopen(req, timeout=40) as r:
                    d    = json.loads(r.read())
                    text = d['choices'][0]['message']['content'].strip()
                    self._ok({'text': text})

            # ── ANTHROPIC (fallback, pago) ───────────────────────────────────
            else:
                model = c.get('model_pipeline', 'claude-3-5-sonnet-20241022') if pipeline \
                        else c.get('model', 'claude-3-5-haiku-20241022')

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
                with urllib.request.urlopen(req, timeout=40) as r:
                    d    = json.loads(r.read())
                    text = d['content'][0]['text'].strip()
                    self._ok({'text': text})

        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'ignore')
            provider = 'Groq' if groq_key else 'Anthropic'
            self._err(502, f'{provider} {e.code}: {msg[:300]}')
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
    print(f'Serving on port {PORT} (threaded)', flush=True)
    s.serve_forever()
