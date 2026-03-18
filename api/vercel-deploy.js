module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const readBody = () =>
    new Promise((resolve, reject) => {
      let buf = '';
      req.on('data', chunk => {
        buf += chunk;
        if (buf.length > 5_000_000) req.destroy();
      });
      req.on('end', () => resolve(buf));
      req.on('error', reject);
    });

  let input = {};
  try {
    const raw = await readBody();
    input = raw ? JSON.parse(raw) : {};
  } catch (e) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    return;
  }

  const html = (input.html || '').toString();
  const deploymentName = (input.deploymentName || input.name || '').toString();
  const token = (process.env.VERCEL_TOKEN || input.token || '').toString().trim();

  if (!html.trim()) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Missing html' }));
    return;
  }

  if (!token) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Missing Vercel token (set VERCEL_TOKEN or send token)' }));
    return;
  }

  const payload = {
    name: deploymentName || `site-${Date.now()}`,
    public: true,
    files: [
      {
        file: 'index.html',
        data: Buffer.from(html, 'utf8').toString('base64'),
        encoding: 'base64',
      },
    ],
    projectSettings: { framework: null },
  };

  try {
    const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const deployData = await deployRes.json().catch(() => ({}));
    if (!deployRes.ok) {
      const msg =
        deployData?.error?.message || deployData?.message || `Erro ao publicar (${deployRes.status})`;
      res.statusCode = deployRes.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: msg }));
      return;
    }

    let user = null;
    try {
      const userRes = await fetch('https://api.vercel.com/v2/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json().catch(() => null);
      if (userRes.ok) {
        const u = userData?.user || null;
        if (u) user = { id: u.id, username: u.username, email: u.email };
      }
    } catch (e) {}

    const rawUrl = deployData?.url || (Array.isArray(deployData?.alias) ? deployData.alias[0] : '');
    const deployedUrl = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`) : '';

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ url: deployedUrl, user, deployment: deployData }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: e?.message || 'Internal error' }));
  }
};
