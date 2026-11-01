// Production server: the built site (dist/) behind the login gate.
// usage: npm run build && npm start   (PORT, ADMIN_USER, ADMIN_PASSWORD, SESSION_SECRET from env)
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAuthMiddleware } from './auth.js'

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
if (!fs.existsSync(path.join(distDir, 'login.html'))) {
  console.error('dist/ is missing — run `npm run build` first.')
  process.exit(1)
}
const port = Number(process.env.PORT || 4173)
const auth = createAuthMiddleware({ distDir })
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
}

function serveStatic(req, res) {
  let rel = decodeURIComponent(new URL(req.url, 'http://local').pathname)
  if (rel.endsWith('/')) rel += 'index.html'
  const file = path.join(distDir, rel)
  if (!file.startsWith(distDir)) {
    res.statusCode = 403
    return res.end('Forbidden')
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.statusCode = 404
      return res.end('Not found')
    }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream')
    // Hashed assets can be cached; pages must be re-checked against the session every time.
    res.setHeader('Cache-Control', rel.startsWith('/assets/') ? 'private, max-age=31536000, immutable' : 'no-store')
    res.end(data)
  })
}

http.createServer((req, res) => auth(req, res, () => serveStatic(req, res)))
  .listen(port, () => console.log(`Portfolio running at http://localhost:${port}/`))
