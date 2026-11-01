// Login gate for the portfolio, shared by the Vite dev/preview servers and server/serve.js.
// Credentials come from the environment (ADMIN_USER / ADMIN_PASSWORD); the defaults are
// admin / 1234. Only a scrypt hash of the password is kept in memory.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const USER = process.env.ADMIN_USER || 'admin'
const SALT = randomBytes(16)
const PASS_HASH = scryptSync(process.env.ADMIN_PASSWORD || '1234', SALT, 32)
// Without SESSION_SECRET every restart signs out everyone, which is acceptable for a personal site.
const SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex')
const COOKIE = 'pf_session'
const MAX_AGE = 7 * 24 * 3600 // seconds
const MAX_FAILS = 5
const LOCK_MS = 60_000

const fails = new Map() // ip -> { count, until }

const sign = (value) => createHmac('sha256', SECRET).update(value).digest('base64url')

function makeToken(user) {
  const body = Buffer.from(JSON.stringify({ u: user, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url')
  return `${body}.${sign(body)}`
}

function readToken(token) {
  if (!token || !token.includes('.')) return null
  const [body, mac] = token.split('.')
  const expected = Buffer.from(sign(body))
  const given = Buffer.from(mac)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString())
    return data.exp > Date.now() ? data : null
  } catch {
    return null
  }
}

function cookies(req) {
  const out = {}
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

function checkCredentials(user, pass) {
  // Hash both sides so the comparison takes the same time whatever was typed.
  const userOk = timingSafeEqual(scryptSync(String(user), SALT, 32), scryptSync(USER, SALT, 32))
  const passOk = timingSafeEqual(scryptSync(String(pass), SALT, 32), PASS_HASH)
  return userOk && passOk
}

const isSecure = (req) => req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https'

function setSession(req, res, value, maxAge) {
  const parts = [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`]
  if (isSecure(req)) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

function json(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 4096) reject(new Error('too large'))
    })
    req.on('end', () => resolve(raw))
    req.on('error', reject)
  })
}

async function handleLogin(req, res) {
  const ip = req.socket.remoteAddress || 'unknown'
  const f = fails.get(ip)
  if (f && f.until > Date.now()) {
    return json(res, 429, { error: 'Too many attempts. Try again in a minute.', retryAfter: Math.ceil((f.until - Date.now()) / 1000) })
  }
  let body
  try {
    body = JSON.parse(await readBody(req))
  } catch {
    return json(res, 400, { error: 'Bad request.' })
  }
  if (!checkCredentials(body.username ?? '', body.password ?? '')) {
    const count = (f?.count || 0) + 1
    fails.set(ip, count >= MAX_FAILS ? { count: 0, until: Date.now() + LOCK_MS } : { count, until: 0 })
    return json(res, 401, { error: 'Wrong username or password.' })
  }
  fails.delete(ip)
  setSession(req, res, makeToken(USER), MAX_AGE)
  return json(res, 200, { ok: true })
}

// Paths that must load before signing in. In strict mode (built files) these are the
// login page and exactly the assets it references; in dev, Vite's module requests pass
// and only page navigations are gated.
function publicPaths(distDir) {
  const allowed = new Set(['/login.html', '/favicon.svg'])
  if (distDir) {
    const html = fs.readFileSync(path.join(distDir, 'login.html'), 'utf8')
    for (const m of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) allowed.add(m[1])
  }
  return allowed
}

export function createAuthMiddleware({ distDir } = {}) {
  const strict = Boolean(distDir)
  let allowed = null

  return async function auth(req, res, next) {
    const url = new URL(req.url, 'http://local')
    const p = url.pathname
    const session = readToken(cookies(req)[COOKIE])

    if (p === '/api/login' && req.method === 'POST') return handleLogin(req, res)
    if (p === '/api/logout' && req.method === 'POST') {
      setSession(req, res, '', 0)
      return json(res, 200, { ok: true })
    }
    if (p === '/api/session') return json(res, 200, { user: session?.u ?? null })

    if (p === '/login' || p === '/login.html') {
      if (session) return redirect(res, '/')
      if (p === '/login') return redirect(res, '/login.html')
      return next()
    }
    if (session) return next()

    allowed ??= publicPaths(distDir)
    if (allowed.has(p)) return next()
    const isPage = p === '/' || p.endsWith('.html') || (req.headers.accept || '').includes('text/html')
    if (!strict && !isPage) return next()
    if (isPage) return redirect(res, '/login.html')
    res.statusCode = 401
    res.end('Sign in first.')
  }
}

function redirect(res, to) {
  res.statusCode = 302
  res.setHeader('Location', to)
  res.setHeader('Cache-Control', 'no-store')
  res.end()
}
