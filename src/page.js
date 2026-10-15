export const page = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ETag と 304 のデモ</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0 auto; max-width: 62rem; padding: 2rem 1rem 4rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
    line-height: 1.7;
  }
  h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
  p { margin: .5rem 0; }
  .lead, .hint { color: #666; }
  .hint { font-size: .9rem; }
  .buttons { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin: 1rem 0 0; }
  button, input {
    font: inherit; padding: .55rem 1rem; border-radius: .5rem;
    border: 1px solid #ccc; background: #fff;
  }
  button { cursor: pointer; }
  button:hover { background: #f3f4f6; }
  input { width: 7rem; }
  table { border-collapse: collapse; width: 100%; margin-top: 1.25rem; font-size: .9rem; }
  th, td { border-bottom: 1px solid #e5e7eb; padding: .4rem .5rem; text-align: left; vertical-align: top; }
  th { font-weight: 600; white-space: nowrap; }
  td.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .8rem; word-break: break-all; }
  td.req { white-space: pre-line; }
  td.s304 { color: #b45309; font-weight: 600; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  @media (prefers-color-scheme: dark) {
    body { background: #111; color: #eee; }
    .lead, .hint { color: #aaa; }
    button, input { background: #1f2937; color: #eee; border-color: #444; }
    button:hover { background: #374151; }
    th, td { border-color: #333; }
  }
</style>
</head>
<body>
<h1>ETag と 304 のデモ</h1>
<p class="lead">
  <strong>DevTools の Network タブを開いてから</strong>ボタンを押してください。
  表と Network タブを見比べられます。
</p>

<div class="buttons">
  <button id="first">1回目を fetch</button>
  <button id="second">2回目を fetch</button>
  <button id="manual">If-None-Match を付けて fetch</button>
</div>
<div class="buttons">
  <span class="hint">name=</span>
  <input id="name" value="jiro">
  <button id="rename">名前を変えて fetch</button>
</div>

<table>
  <thead>
    <tr>
      <th>リクエスト</th><th>status</th><th>res.ok</th><th>ETag</th><th>X-Handler-Runs</th><th>JS が受け取ったボディ</th>
    </tr>
  </thead>
  <tbody id="rows"></tbody>
</table>
<p class="hint">
  <code>X-Handler-Runs</code> はサーバーがハンドラを実行した回数
</p>

<p class="hint"><a href="https://github.com/yoshi47/hono-etag-304-demo">yoshi47/hono-etag-304-demo</a></p>

<script>
const rows = document.getElementById('rows')
const etags = {}
const plain = '/api/contacts'

function addRow(request, status, ok, etag, runs, body) {
  const values = [
    { text: request, cls: 'mono req' },
    { text: String(status), cls: status === 304 ? 's304' : '' },
    { text: String(ok), cls: '' },
    { text: etag || '-', cls: 'mono' },
    { text: runs || '-', cls: '' },
    { text: body || '(空)', cls: 'mono' },
  ]
  const tr = document.createElement('tr')
  values.forEach(function (v) {
    const td = document.createElement('td')
    td.textContent = v.text
    if (v.cls) td.className = v.cls
    tr.appendChild(td)
  })
  rows.prepend(tr)
}

async function run(path, request, init) {
  const res = await fetch(path, init)
  const body = await res.text()
  const etag = res.headers.get('etag')
  if (etag) etags[path] = etag
  addRow(request, res.status, res.ok, etag, res.headers.get('x-handler-runs'), body)
}

document.getElementById('first').addEventListener('click', function () {
  run(plain, plain, undefined)
})

document.getElementById('second').addEventListener('click', function () {
  run(plain, plain, undefined)
})

document.getElementById('manual').addEventListener('click', async function () {
  if (!etags[plain]) await run(plain, plain, undefined)
  await run(plain, plain + '\\n+ If-None-Match', { headers: { 'If-None-Match': etags[plain] } })
})

document.getElementById('rename').addEventListener('click', function () {
  const path = plain + '?name=' + encodeURIComponent(document.getElementById('name').value)
  run(path, path, undefined)
})
</script>
</body>
</html>
`
