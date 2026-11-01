import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { createAuthMiddleware } from './server/auth.js'

const root = (p) => fileURLToPath(new URL(p, import.meta.url))

// The same login gate as server/serve.js, so `npm run dev` and `npm run preview` ask for it too.
const loginGate = () => ({
  name: 'login-gate',
  configureServer(server) {
    server.middlewares.use(createAuthMiddleware())
  },
  configurePreviewServer(server) {
    server.middlewares.use(createAuthMiddleware({ distDir: root('./dist') }))
  },
})

export default defineConfig({
  plugins: [react(), loginGate()],
  build: {
    rollupOptions: {
      input: { main: root('./index.html'), login: root('./login.html') },
    },
  },
})
