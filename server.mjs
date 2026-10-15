import { serve } from '@hono/node-server'
import app from './src/app.js'

// Cloudflare Workers 版（wrangler dev / wrangler deploy）と同じ app を
// Node でも動かすためのランチャー。アプリ本体は src/app.js にある。
serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`http://localhost:${info.port}`)
})
