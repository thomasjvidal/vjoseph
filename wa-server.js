/**
 * wa-server.js — VJ Office WorkAdventure standalone server
 *
 * Port 8090 → Serve WA built frontend (workadventure/play/dist/public/)
 * Port 3000 → Fake WebSocket pusher (minimum WA protocol for single-player)
 *
 * Run: node wa-server.js
 * No external packages — uses only Node.js built-ins + ws from WA's node_modules
 */

'use strict';
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const WA_PORT     = 8090;
const PUSHER_PORT = 3000;
const SERVE_PORT  = 8080; // serve.py port (for map files)

const DIST = path.join(__dirname, 'workadventure', 'play', 'dist', 'public');
const MAP_URL = `http://localhost:${SERVE_PORT}/workadventure/maps/starter/map.json`;

// ─── window.env injected into WA index.html ──────────────────────────────────
const ENV_SCRIPT = `window.env = ${JSON.stringify({
    DEBUG_MODE: false,
    PUSHER_URL: `http://localhost:${PUSHER_PORT}`,
    FRONT_URL:  `http://localhost:${WA_PORT}`,
    ADMIN_URL:  undefined,
    UPLOADER_URL: `http://localhost:${PUSHER_PORT}`,
    ICON_URL:   '',
    SKIP_RENDER_OPTIMIZATIONS: false,
    DISABLE_NOTIFICATIONS: true,
    JITSI_URL:  undefined,
    JITSI_PRIVATE_MODE: false,
    ENABLE_MAP_EDITOR: false,
    PUBLIC_MAP_STORAGE_PREFIX: undefined,
    MAX_USERNAME_LENGTH: 10,
    MAX_PER_GROUP: 4,
    MAX_DISPLAYED_VIDEOS: 4,
    NODE_ENV: 'production',
    CONTACT_URL: undefined,
    POSTHOG_API_KEY: undefined,
    POSTHOG_URL: undefined,
    DISABLE_ANONYMOUS: false,
    ENABLE_OPENID: false,
    OPID_PROFILE_SCREEN_PROVIDER: undefined,
    ENABLE_CHAT_UPLOAD: false,
    FALLBACK_LOCALE: 'pt-BR',
    OPID_WOKA_NAME_POLICY: undefined,
    ENABLE_REPORT_ISSUES_MENU: false,
    REPORT_ISSUES_URL: undefined,
    SENTRY_DSN_FRONT: undefined,
    SENTRY_DSN_PUSHER: undefined,
    SENTRY_ENVIRONMENT: undefined,
    SENTRY_RELEASE: undefined,
    SENTRY_TRACES_SAMPLE_RATE: undefined,
    WOKA_SPEED: 10,
    FEATURE_FLAG_BROADCAST_AREAS: false,
    KLAXOON_ENABLED: false,
    KLAXOON_CLIENT_ID: undefined,
    YOUTUBE_ENABLED: false,
    GOOGLE_DRIVE_ENABLED: false,
    GOOGLE_DOCS_ENABLED: false,
    GOOGLE_SHEETS_ENABLED: false,
    GOOGLE_SLIDES_ENABLED: false,
    ERASER_ENABLED: false,
    MINIMUM_DISTANCE: 64,
    GOOGLE_DRIVE_PICKER_CLIENT_ID: undefined,
    GOOGLE_DRIVE_PICKER_APP_ID: undefined,
    EXCALIDRAW_ENABLED: false,
    EXCALIDRAW_DOMAINS: [],
    CARDS_ENABLED: false,
    TLDRAW_ENABLED: false,
    EMBEDLY_KEY: undefined,
    MATRIX_PUBLIC_URI: undefined,
    MATRIX_ADMIN_USER: undefined,
    MATRIX_DOMAIN: undefined,
    ENABLE_CHAT: false,
    ENABLE_CHAT_ONLINE_LIST: false,
    ENABLE_CHAT_DISCONNECTED_LIST: false,
    ENABLE_SAY: false,
    ENABLE_ISSUE_REPORT: false,
    GRPC_MAX_MESSAGE_SIZE: 20971520,
    TURN_CREDENTIALS_RENEWAL_TIME: 10,
    BACKGROUND_TRANSFORMER_ENGINE: undefined,
    DEFAULT_WOKA_NAME: 'VJ',
    DEFAULT_WOKA_TEXTURE: 'Male 08-1',
    SKIP_CAMERA_PAGE: true,
    BYPASS_PWA: true,
    PROVIDE_DEFAULT_WOKA_NAME: 'fix',
    PROVIDE_DEFAULT_WOKA_TEXTURE: 'fix',
    ENABLE_TUTORIAL: false,
}, null, 0)};`;

// ─── Protobuf: ServerToClientMessage { roomJoinedMessage { currentUserId:1 } }
// Field 3 (roomJoinedMessage), wire type 2 (length-delimited): tag = 0x1a
// RoomJoinedMessage { currentUserId:1 } → field 4 varint 1 → [0x20, 0x01]
const ROOM_JOINED_BYTES = Buffer.from([0x1a, 0x02, 0x20, 0x01]);

// ─── MIME types ───────────────────────────────────────────────────────────────
const MIMES = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript',
    '.mjs':  'application/javascript',
    '.css':  'text/css',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg':  'image/svg+xml',
    '.json': 'application/json',
    '.wasm': 'application/wasm',
    '.mp3':  'audio/mpeg',
    '.mp4':  'video/mp4',
    '.ico':  'image/x-icon',
    '.txt':  'text/plain',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
};

function mimeOf(file) {
    return MIMES[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

// ─── Serve WA index.html with Mustache substitution ──────────────────────────
function serveIndex(res) {
    const indexPath = path.join(DIST, 'index.html');
    if (!fs.existsSync(indexPath)) {
        res.writeHead(503, {'Content-Type': 'text/plain'});
        res.end('WA frontend not built yet. Run: cd workadventure/play && npm run build');
        return;
    }
    let html = fs.readFileSync(indexPath, 'utf-8');

    // Fill Mustache variables (WA index.html uses {{{ }}} for unescaped)
    const DEFAULTS = {
        title:                  'VJ Office',
        description:            'VJoseph Virtual Office',
        author:                 'VJoseph',
        provider:               'VJoseph',
        themeColor:             '#1b2a3b',
        msApplicationTileImage: '',
        url:                    `http://localhost:${WA_PORT}`,
        cardImage:              '',
        favIcons:               '',
        logRocketId:            '',
        googleDrivePickerClientId: '',
        authToken:              '',
        matrixLoginToken:       '',
        cssVariablesOverride:   '',
        script:                 ENV_SCRIPT,
    };

    // Replace {{{ var }}} (unescaped) first, then {{ var }} (escaped)
    html = html.replace(/\{\{\{([^}]+)\}\}\}/g, (_, key) => DEFAULTS[key.trim()] || '');
    html = html.replace(/\{\{([^}]+)\}\}/g, (_, key) => DEFAULTS[key.trim()] || '');
    // Remove Mustache block tags
    html = html.replace(/\{\{#[^}]+\}\}[\s\S]*?\{\{\/[^}]+\}\}/g, '');

    const buf = Buffer.from(html, 'utf-8');
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': buf.length,
        'Cache-Control': 'no-cache',
        ...corsHeaders(),
    });
    res.end(buf);
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': '*',
    };
}

// ─── Static frontend server (port 8090) ──────────────────────────────────────
const waServer = http.createServer((req, res) => {
    const url = req.url.split('?')[0];

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders()); res.end(); return;
    }

    // SPA routes → serve index.html
    const isSpaRoute = url === '/' || url.startsWith('/_/') || url.startsWith('/@/') ||
                       url.startsWith('/login') || url.startsWith('/register') ||
                       url.startsWith('/selectCompanion') || url.startsWith('/selectCharacter') ||
                       url.startsWith('/customizeCharacter');
    if (isSpaRoute) {
        serveIndex(res); return;
    }

    // Static file
    const filePath = path.join(DIST, decodeURIComponent(url));
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        // For any unknown path, try index.html (SPA fallback)
        serveIndex(res); return;
    }

    const buf = fs.readFileSync(filePath);
    res.writeHead(200, {
        'Content-Type': mimeOf(filePath),
        'Content-Length': buf.length,
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders(),
    });
    res.end(buf);
});

// ─── WebSocket upgrade (fake pusher) on WA static server ─────────────────────
waServer.on('upgrade', handleWsUpgrade.bind(null, 'wa'));

// ─── Fake pusher HTTP server (port 3000) ─────────────────────────────────────
const pusherServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    const url = req.url.split('?')[0];

    // Anonymous login
    if (url === '/anonymLogin' && req.method === 'POST') {
        const fakeToken = `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({
            sub: 'vj-user-001',
            name: 'Você',
            iat: Math.floor(Date.now()/1000),
            exp: Math.floor(Date.now()/1000) + 86400 * 365,
        })).toString('base64url')}.`;

        const body = JSON.stringify({
            authToken:      fakeToken,
            userIdentifier: 'vj-user-001',
            username:       'Você',
            visitCardUrl:   null,
            textures:       [],
        });
        res.writeHead(200, {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body)});
        res.end(body);
        return;
    }

    // Woka / companion lists (return empty defaults)
    if (url.startsWith('/woka') || url.startsWith('/companion') ||
        url.startsWith('/api/')  || url.startsWith('/upload')) {
        const body = JSON.stringify({ woka: [], companion: [], collections: [], ok: true });
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(body);
        return;
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('{"ok":true}');
});

pusherServer.on('upgrade', handleWsUpgrade.bind(null, 'pusher'));

// ─── WebSocket handshake + fake protocol ─────────────────────────────────────
function handleWsUpgrade(origin, req, socket) {
    const key = req.headers['sec-websocket-key'];
    if (!key) { socket.destroy(); return; }

    const accept = crypto.createHash('sha1')
        .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
        .digest('base64');

    socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        'Sec-WebSocket-Accept: ' + accept + '\r\n' +
        'Access-Control-Allow-Origin: *\r\n' +
        '\r\n'
    );

    let responded = false;

    socket.on('data', (buf) => {
        try {
            const frame = decodeWsFrame(buf);
            if (!frame) return;

            // Respond to WS ping with pong
            if (frame.opcode === 0x9) {
                socket.write(encodeWsFrame(frame.payload, 0xA));
                return;
            }

            // First binary message from client → send RoomJoinedMessage
            if (!responded && frame.opcode === 0x2) {
                responded = true;
                socket.write(encodeWsFrame(ROOM_JOINED_BYTES, 0x2));
            }
        } catch (_) {}
    });

    // Keep-alive: respond to WS pings every 30s
    const ping = setInterval(() => {
        if (socket.destroyed) { clearInterval(ping); return; }
        socket.write(encodeWsFrame(Buffer.alloc(0), 0x9));
    }, 30_000);

    socket.on('error', () => clearInterval(ping));
    socket.on('close', () => clearInterval(ping));
}

function decodeWsFrame(buf) {
    if (buf.length < 2) return null;
    const opcode = buf[0] & 0x0f;
    const masked  = !!(buf[1] & 0x80);
    let len = buf[1] & 0x7f;
    let off = 2;
    if (len === 126) { len = buf.readUInt16BE(2); off = 4; }
    else if (len === 127) { len = Number(buf.readBigUInt64BE(2)); off = 10; }
    if (masked) {
        const mask = buf.slice(off, off + 4); off += 4;
        const payload = Buffer.alloc(len);
        for (let i = 0; i < len; i++) payload[i] = buf[off + i] ^ mask[i % 4];
        return { opcode, payload };
    }
    return { opcode, payload: buf.slice(off, off + len) };
}

function encodeWsFrame(payload, opcode) {
    const len = payload.length;
    let header;
    if (len < 126) {
        header = Buffer.from([0x80 | opcode, len]);
    } else if (len < 65536) {
        header = Buffer.alloc(4);
        header[0] = 0x80 | opcode; header[1] = 126;
        header.writeUInt16BE(len, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = 0x80 | opcode; header[1] = 127;
        header.writeBigUInt64BE(BigInt(len), 2);
    }
    return Buffer.concat([header, payload]);
}

// ─── Start both servers ───────────────────────────────────────────────────────
waServer.listen(WA_PORT, () => {
    console.log(`[WA Front]   http://localhost:${WA_PORT}  (WorkAdventure frontend)`);
});
pusherServer.listen(PUSHER_PORT, () => {
    console.log(`[WA Pusher]  ws://localhost:${PUSHER_PORT}   (fake pusher — single-player)`);
    console.log(`[Office URL] http://localhost:${WA_PORT}/_/global/localhost:${SERVE_PORT}/workadventure/maps/starter/map.json`);
});
