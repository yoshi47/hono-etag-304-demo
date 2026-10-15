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
    margin: 0 auto; max-width: 60rem; padding: 2rem 1rem 4rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
    line-height: 1.7;
  }
  h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
  p { margin: .5rem 0; }
  .lead, .hint { color: #666; }
  .hint { font-size: .9rem; }
  .buttons { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1.25rem 0 .5rem; }
  button {
    font: inherit; padding: .55rem 1rem; border-radius: .5rem;
    border: 1px solid #ccc; background: #fff; cursor: pointer;
  }
  button:hover { background: #f3f4f6; }
  table { border-collapse: collapse; width: 100%; margin-top: 1rem; font-size: .9rem; }
  th, td { border-bottom: 1px solid #e5e7eb; padding: .4rem .5rem; text-align: left; vertical-align: top; }
  th { font-weight: 600; white-space: nowrap; }
  td.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .8rem; word-break: break-all; }
  td.s304 { color: #b45309; font-weight: 600; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  @media (prefers-color-scheme: dark) {
    body { background: #111; color: #eee; }
    .lead, .hint { color: #aaa; }
    button { background: #1f2937; color: #eee; border-color: #444; }
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

<table>
  <thead>
    <tr>
      <th>押したボタン</th><th>status</th><th>res.ok</th><th>ETag</th><th>X-Handler-Runs</th><th>JS が受け取ったボディ</th>
    </tr>
  </thead>
  <tbody id="rows"></tbody>
</table>
<p class="hint">
  <code>X-Handler-Runs</code> はサーバー側のハンドラ実行回数で、訪問者全員の分が積み上がります。
</p>

<script>
const rows = document.getElementById('rows')
let lastEtag = null

function addRow(label, status, ok, etag, runs, body) {
  const tr = document.createElement('tr')
  const values = [label, String(status), String(ok), etag || '-', runs || '-', body || '(空)']
  values.forEach(function (value, i) {
    const td = document.createElement('td')
    td.textContent = value
    if (i === 3 || i === 5) td.className = 'mono'
    if (i === 1 && status === 304) td.className = 's304'
    tr.appendChild(td)
  })
  rows.prepend(tr)
}

async function run(label, init) {
  const res = await fetch('/api/contacts', init)
  const body = await res.text()
  const etag = res.headers.get('etag')
  if (etag) lastEtag = etag
  addRow(label, res.status, res.ok, etag, res.headers.get('x-handler-runs'), body)
}

document.getElementById('first').addEventListener('click', function () {
  run('1回目', undefined)
})

document.getElementById('second').addEventListener('click', function () {
  run('2回目', undefined)
})

document.getElementById('manual').addEventListener('click', async function () {
  if (!lastEtag) await run('(ETag 取得)', undefined)
  await run('If-None-Match を付けて fetch', { headers: { 'If-None-Match': lastEtag } })
})
</script>

<p class="hint">ソースコードは <a href="https://github.com/yoshi47/hono-etag-304-demo">yoshi47/hono-etag-304-demo</a> です。</p>
</body>
</html>
`
