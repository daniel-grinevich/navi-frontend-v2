import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import tailwindcss from '@tailwindcss/vite'

import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (no prefix filter) so we can read proxy config that
  // should never be exposed to the client bundle.
  const env = loadEnv(mode, process.cwd(), '')

  const proxyTarget = env.VITE_PROXY_TARGET

  // When VITE_PROXY_TARGET is set (e.g. `pnpm dev:staging`), the dev server
  // proxies /api and /ws to it. The browser talks same-origin to localhost so
  // there's no CORS; we rewrite Origin/Referer to a trusted origin so Django's
  // CSRF checks pass, and rewrite Set-Cookie so cross-site cookies stick on
  // localhost (drop Domain, drop Secure, downgrade SameSite=None -> Lax).
  const buildProxy = (): Record<string, ProxyOptions> | undefined => {
    if (!proxyTarget) return undefined

    // Origin/Referer Django will trust (CSRF_TRUSTED_ORIGINS). Falls back to
    // the target itself if not separately configured.
    const proxyOrigin = env.VITE_PROXY_ORIGIN || proxyTarget

    const configure: ProxyOptions['configure'] = (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('origin', proxyOrigin)
        proxyReq.setHeader('referer', `${proxyOrigin}/`)
      })

      proxy.on('proxyRes', (proxyRes) => {
        const setCookie = proxyRes.headers['set-cookie']
        if (!setCookie) return

        proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
          cookie
            .replace(/;\s*Domain=[^;]+/i, '')
            .replace(/;\s*Secure/gi, '')
            .replace(/;\s*SameSite=None/gi, '; SameSite=Lax'),
        )
      })
    }

    const common: ProxyOptions = {
      target: proxyTarget,
      changeOrigin: true,
      secure: true,
      configure,
    }

    return {
      '/api': common,
      '/ws': { ...common, ws: true },
    }
  }

  return {
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: buildProxy(),
    },
  }
})
