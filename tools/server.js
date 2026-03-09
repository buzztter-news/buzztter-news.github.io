const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3456;
const ROOT = path.join(__dirname, '..');

// 広告一覧（ここで管理）
const ADS = {
  'lVM3LgiRzrQ': { name: 'ベストお薬', type: 'banner' },
  'i946xt1euvg': { name: 'FaceSwitch', type: 'banner' },
  'PACa2QJNwqs': { name: 'サイドバー広告1', type: 'banner' },
  'txCaj_1DrSI': { name: 'サイドバー広告2', type: 'banner' },
};

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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    return respond(res, { ok: true, ads: ADS });
  }

  // API: 広告一覧
  if (req.url === '/ads') {
    return respond(res, { ads: ADS });
  }

  // API: 記事作成
  if (req.url === '/create-article' && req.method === 'POST') {
    const data = await parseBody(req);
    const { slug, content } = data;
    if (!slug || !content) return respond(res, { error: 'slug と content が必要' }, 400);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dir = path.join(ROOT, 'content', 'posts', String(year), month);
    const filePath = path.join(dir, `${slug}.md`);

    if (fs.existsSync(filePath)) return respond(res, { error: 'ファイルが既に存在します' }, 400);

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');

    const relPath = path.relative(ROOT, filePath);
    return respond(res, { success: true, path: relPath });
  }

  // API: デプロイ
  if (req.url === '/deploy' && req.method === 'POST') {
    try {
      const output = execSync('git add . && git commit -m "記事更新: $(date +\'%Y-%m-%d %H:%M\')" && git push', {
        cwd: ROOT,
        encoding: 'utf-8',
        timeout: 30000,
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

  respond(res, { error: 'Not Found' }, 404);
});

server.listen(PORT, () => {
  console.log(`\n  buzzter news ダッシュボード`);
  console.log(`  http://localhost:${PORT}\n`);
});
