import { Hono } from 'hono'
import { etag } from 'hono/etag'
import { page } from './page.js'

const app = new Hono()

// ハンドラが動いた回数。304 を返した回でも増えることを確かめるために使う
let handlerRuns = 0

app.use('/api/*', async (c, next) => {
  await next()
  console.log(`If-None-Match: ${c.req.header('if-none-match') ?? '(なし)'} -> ${c.res.status}`)
  // etag() が c.res を差し替えたあとに足すので、200 でも 304 でもヘッダに載る
  c.res.headers.set('X-Handler-Runs', String(handlerRuns))
  c.res.headers.set('Cache-Control', 'no-cache')
})
app.use('/api/*', etag())

app.get('/', (c) => c.html(page))
app.get('/api/contacts', (c) => {
  handlerRuns += 1
  console.log('  handler: DB を引いて JSON を作った')
  const name = c.req.query('name') ?? 'taro'
  return c.json({ data: [{ id: 1, name }] })
})

export default app
