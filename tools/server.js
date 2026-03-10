const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

const PORT = 3456;
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

function respond(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // ダッシュボードHTML配信
  if (req.url === '/' || req.url === '/dashboard') {
    const html = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // API: ステータス
  if (req.url === '/status') {
    return respond(res, { ok: true });
  }

  // API: データ取得
  if (req.url === '/data' && req.method === 'GET') {
    return respond(res, loadData());
  }

  // API: 広告追加
  if (req.url === '/ads' && req.method === 'POST') {
    const data = loadData();
    const ad = await parseBody(req);
    ad.id = ad.id || Date.now().toString();
    ad.active = true;
    data.ads.push(ad);
    saveData(data);
    return respond(res, { success: true, ads: data.ads });
  }

  // API: 広告削除
  if (req.url.startsWith('/ads/') && req.method === 'DELETE') {
    const id = req.url.split('/ads/')[1];
    const data = loadData();
    data.ads = data.ads.filter(a => a.id !== id);
    saveData(data);
    return respond(res, { success: true, ads: data.ads });
  }

  // API: 広告更新
  if (req.url.startsWith('/ads/') && req.method === 'PUT') {
    const id = req.url.split('/ads/')[1];
    const updates = await parseBody(req);
    const data = loadData();
    const idx = data.ads.findIndex(a => a.id === id);
    if (idx >= 0) {
      data.ads[idx] = { ...data.ads[idx], ...updates };
      saveData(data);
    }
    return respond(res, { success: true, ads: data.ads });
  }

  // API: バズリンク追加
  if (req.url === '/buzz' && req.method === 'POST') {
    const data = loadData();
    const buzz = await parseBody(req);
    buzz.id = Date.now().toString();
    buzz.addedAt = new Date().toISOString();
    data.buzzLinks.push(buzz);
    saveData(data);
    return respond(res, { success: true, buzzLinks: data.buzzLinks });
  }

  // API: バズリンク削除
  if (req.url.startsWith('/buzz/') && req.method === 'DELETE') {
    const id = req.url.split('/buzz/')[1];
    const data = loadData();
    data.buzzLinks = data.buzzLinks.filter(b => b.id !== id);
    saveData(data);
    return respond(res, { success: true, buzzLinks: data.buzzLinks });
  }

  // API: PICKUP更新
  if (req.url === '/pickup' && req.method === 'PUT') {
    const data = loadData();
    const pickup = await parseBody(req);
    data.pickupLink = pickup;
    saveData(data);
    return respond(res, { success: true });
  }

  // API: Claude記事生成
  if (req.url === '/generate' && req.method === 'POST') {
    const { url, keywords } = await parseBody(req);
    if (!url) return respond(res, { error: 'URLが必要です' }, 400);

    const prompt = keywords
      ? `${url} この内容で記事を書いて。タイトルに「${keywords}」を入れて。デプロイまで全自動で。`
      : `${url} この内容で記事を書いて。デプロイまで全自動で。`;

    try {
      exec(`cd "${ROOT}" && claude -p "${prompt.replace(/"/g, '\\"')}"`, {
        timeout: 120000,
        maxBuffer: 10 * 1024 * 1024,
      }, (err, stdout, stderr) => {
        if (err) {
          return respond(res, { success: false, error: stderr || err.message });
        }
        return respond(res, { success: true, output: stdout });
      });
    } catch (e) {
      return respond(res, { success: false, error: e.message });
    }
    return; // async response
  }

  // API: 記事作成（手動）
  if (req.url === '/create-article' && req.method === 'POST') {
    const body = await parseBody(req);
    const { slug, content } = body;
    if (!slug || !content) return respond(res, { error: 'slug と content が必要' }, 400);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dir = path.join(ROOT, 'content', 'posts', String(year), month);
    const filePath = path.join(dir, `${slug}.md`);

    if (fs.existsSync(filePath)) return respond(res, { error: 'ファイルが既に存在' }, 400);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    return respond(res, { success: true, path: path.relative(ROOT, filePath) });
  }

  // API: デプロイ
  if (req.url === '/deploy' && req.method === 'POST') {
    try {
      const output = execSync('./scripts/deploy.sh', {
        cwd: ROOT,
        encoding: 'utf-8',
        timeout: 60000,
      });
      return respond(res, { success: true, output });
    } catch (e) {
      return respond(res, { success: false, error: e.stderr || e.message });
    }
  }

  // API: デプロイステータス
  if (req.url === '/deploy-status') {
    try {
      const output = execSync('gh run list --limit 1 --json status,conclusion,displayTitle', {
        cwd: ROOT,
        encoding: 'utf-8',
        timeout: 10000,
      });
      const runs = JSON.parse(output);
      if (runs.length > 0) {
        return respond(res, { status: runs[0].conclusion || runs[0].status, title: runs[0].displayTitle });
      }
      return respond(res, { status: 'unknown' });
    } catch (e) {
      return respond(res, { status: 'error', error: e.message });
    }
  }

  // API: 記事一覧
  if (req.url === '/articles') {
    try {
      const output = execSync('find content/posts -name "*.md" -not -name "_index.md" | sort -r | head -20', {
        cwd: ROOT,
        encoding: 'utf-8',
      });
      const articles = output.trim().split('\n').filter(Boolean).map(f => {
        const content = fs.readFileSync(path.join(ROOT, f), 'utf-8');
        const titleMatch = content.match(/title:\s*"(.+?)"/);
        const dateMatch = content.match(/date:\s*(.+)/);
        return {
          path: f,
          title: titleMatch ? titleMatch[1] : f,
          date: dateMatch ? dateMatch[1].trim() : '',
        };
      });
      return respond(res, { articles });
    } catch (e) {
      return respond(res, { articles: [] });
    }
  }

  respond(res, { error: 'Not Found' }, 404);
});

server.listen(PORT, () => {
  console.log(`\n  buzzter news ダッシュボード`);
  console.log(`  http://localhost:${PORT}\n`);
});
