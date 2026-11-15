// 本地预览：  node serve.js   然后打开 http://localhost:8766
// 和 python -m http.server 的区别：支持视频的分段请求（Range），
// 没有它浏览器没法在视频里跳转，首页的滚动视频就不会动。
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, PORT = process.env.PORT || 8766;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.mp4': 'video/mp4', '.pdf': 'application/pdf', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  let p = path.normalize(path.join(ROOT, decodeURIComponent(req.url.split('?')[0])));
  if (!p.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  // 样式和脚本直接读 src/ 里的原文件：改完保存，刷新页面就能看到，不用重新生成
  const live = { 'style.css': 1, 'site.js': 1 }[path.basename(p)];
  if (live && path.dirname(p) === ROOT) p = path.join(__dirname, 'src', path.basename(p));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end('Not found'); }
  const size = fs.statSync(p).size, type = TYPES[path.extname(p).toLowerCase()] || 'application/octet-stream';
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (m) {
    const start = m[1] ? +m[1] : size - +m[2], end = m[1] && m[2] ? Math.min(+m[2], size - 1) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    return fs.createReadStream(p, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
  fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
