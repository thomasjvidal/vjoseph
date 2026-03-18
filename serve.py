import http.server, os, json, time, urllib.request, urllib.error, sys
from http.server import ThreadingHTTPServer

def _log(msg):
    """Print seguro no Windows — converte caracteres especiais para ASCII."""
    try:
        safe = str(msg).encode('ascii', 'replace').decode('ascii')
        print(safe, flush=True)
    except Exception:
        pass

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
        elif self.path == '/api/transcribe':
            self._transcribe()
        else:
            self.send_error(404)

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _call_groq(self, groq_key, model, groq_msgs, maxtok):
        """Chama Groq com uma chave específica. Lança HTTPError 429 sem esperar (para rotação de chave)."""
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
        with urllib.request.urlopen(req, timeout=45) as r:
            d = json.loads(r.read())
            return d['choices'][0]['message']['content'].strip()

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

    def _transcribe(self):
        import base64
        c = cfg()
        # Pega primeira chave Groq disponível
        groq_key = ''
        for k in ['groq_key', 'groq_key_2', 'groq_key_3']:
            v = c.get(k, '').strip()
            if v:
                groq_key = v
                break
        if not groq_key:
            return self._err(400, 'Sem groq_key para transcrição')
        try:
            n = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(n))
            audio_b64 = body.get('audio', '')
            mime = body.get('mime', 'audio/webm')
            if not audio_b64:
                return self._err(400, 'Sem audio')
            audio_bytes = base64.b64decode(audio_b64)
            # Determina extensão
            if 'webm' in mime:
                ext = 'webm'
            elif 'ogg' in mime:
                ext = 'ogg'
            elif 'mp4' in mime or 'm4a' in mime:
                ext = 'mp4'
            else:
                ext = 'webm'
            # Monta multipart/form-data manualmente
            boundary = 'VJBoundary7x9z2k'
            parts = []
            parts.append(('--' + boundary + '\r\n').encode())
            parts.append(('Content-Disposition: form-data; name="file"; filename="audio.' + ext + '"\r\n').encode())
            parts.append(('Content-Type: ' + mime + '\r\n\r\n').encode())
            parts.append(audio_bytes)
            parts.append(b'\r\n')
            parts.append(('--' + boundary + '\r\n').encode())
            parts.append(b'Content-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3-turbo\r\n')
            parts.append(('--' + boundary + '\r\n').encode())
            parts.append(b'Content-Disposition: form-data; name="language"\r\n\r\npt\r\n')
            parts.append(('--' + boundary + '\r\n').encode())
            parts.append(b'Content-Disposition: form-data; name="response_format"\r\n\r\njson\r\n')
            parts.append(('--' + boundary + '--\r\n').encode())
            payload = b''.join(parts)
            req = urllib.request.Request(
                'https://api.groq.com/openai/v1/audio/transcriptions',
                data=payload,
                headers={
                    'Content-Type': 'multipart/form-data; boundary=' + boundary,
                    'Authorization': 'Bearer ' + groq_key,
                    'User-Agent': 'VJoseph/1.0 Python/3.12',
                }
            )
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.loads(r.read())
                self._ok({'text': d.get('text', '')})
        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'ignore')
            self._err(502, 'Whisper: ' + msg[:200])
        except Exception as e:
            self._err(500, str(e))

    def _ai(self):
        c = cfg()
        anthropic_key = c.get('anthropic_key', '').strip()

        # Coleta TODAS as chaves Groq disponíveis: groq_key, groq_key_2, groq_key_3 ...
        groq_keys = []
        for k in ['groq_key', 'groq_key_2', 'groq_key_3', 'groq_key_4']:
            v = c.get(k, '').strip()
            if v:
                groq_keys.append(v)

        if not groq_keys and not anthropic_key:
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
            groq_model = c.get('groq_model_pipeline', 'llama-3.3-70b-versatile') if pipeline \
                         else c.get('groq_model', 'llama-3.3-70b-versatile')
            groq_msgs  = [{'role': 'system', 'content': system}] + clean_msgs

            # ── Rotação de chaves Groq: NUNCA raise dentro do loop ──────────
            # Qualquer erro (429, 500, timeout) -> tenta próxima chave
            for idx, key in enumerate(groq_keys):
                try:
                    text = self._call_groq(key, groq_model, groq_msgs, maxtok)
                    _log(f'[Groq OK] chave #{idx+1}')
                    break
                except urllib.error.HTTPError as e:
                    err_body = e.read().decode('utf-8', 'ignore')
                    safe = err_body.encode('ascii', 'replace').decode('ascii')[:60]
                    _log(f'[Groq {e.code}] chave #{idx+1} falhou: {safe}')
                    continue  # sempre tenta proxima chave, sem raise
                except Exception as e:
                    safe = str(e).encode('ascii', 'replace').decode('ascii')[:60]
                    _log(f'[Groq ERR] chave #{idx+1}: {safe}')
                    continue  # idem

            # ── Anthropic fallback: entra se TODAS as chaves Groq falharam ───
            if text is None and anthropic_key:
                ant_model = c.get('model_pipeline', 'claude-3-5-sonnet-20241022') if pipeline \
                            else c.get('model', 'claude-3-5-haiku-20241022')
                _log(f'[Groq exauriu -> Anthropic] usando {ant_model}...')
                text = self._call_anthropic(anthropic_key, ant_model, system, clean_msgs, maxtok)
                _log(f'[Anthropic OK] {ant_model}')

            if text is not None:
                self._ok({'text': text})
            else:
                self._err(503, 'Todas as chaves Groq falharam. Adicione groq_key_2/3 ou configure anthropic_key.')

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
        _log(f'[{self.address_string()}] {fmt % a}')

with ThreadingHTTPServer(('', PORT), H) as s:
    print(f'VJoseph serve.py rodando na porta {PORT} (threaded + Groq retry + Anthropic fallback)', flush=True)
    s.serve_forever()
