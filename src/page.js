export const page = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ETag と 304 のデモ</title>
<style>
  :root {
    --fg: #18181b;
    --muted: #71717a;
    --line: #d4d4d8;
    --surface: #fff;
    --hover: #f4f4f5;
    --accent: #b45309;
    color-scheme: light dark;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fg: #e4e4e7;
      --muted: #a1a1aa;
      --line: #3f3f46;
      --surface: #27272a;
      --hover: #3f3f46;
      --accent: #fbbf24;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0 auto; max-width: 72rem; padding: 2.5rem 1.25rem 4rem;
    color: var(--fg); font-size: 1rem; line-height: 1.6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
  }
  h1 { margin: 0 0 .35rem; font-size: 1.3rem; font-weight: 700; }
  .lead, .hint { margin: 0; color: var(--muted); font-size: .9rem; }
  .lead strong { color: var(--fg); }
  .hint { margin-top: 1.25rem; }
  code, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  code { font-size: .85em; }

  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: 1.5rem; }
  .sep { width: 1px; height: 1.5rem; margin: 0 .25rem; background: var(--line); flex: none; }

  button, .field {
    height: 2.4rem;
    border: 1px solid var(--line);
    border-radius: .5rem;
    background: var(--surface);
  }
  button {
    padding: 0 1rem; color: inherit; font: inherit; font-size: .9rem;
    cursor: pointer; transition: background .12s, border-color .12s;
  }
  button:hover { background: var(--hover); }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
  .field:focus-within { border-color: var(--accent); }

  .field { display: inline-flex; align-items: center; overflow: hidden; }
  .field .prefix {
    padding-left: .7rem; color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .8rem;
  }
  .field input {
    width: 5rem; height: 100%; padding: 0 .65rem; border: 0; background: transparent;
    color: inherit; font: inherit; font-size: .9rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .field input:focus { outline: none; }

  .table-wrap { overflow-x: auto; margin-top: 1.5rem; }
  table { width: 100%; border-collapse: collapse; font-size: .85rem; }
  th, td { padding: .55rem .7rem .55rem 0; text-align: left; vertical-align: top; border-bottom: 1px solid var(--line); }
  th { color: var(--muted); font-size: .75rem; font-weight: 600; white-space: nowrap; }
  td { white-space: nowrap; }
  td:last-child, th:last-child { padding-right: 0; }
  tbody tr:hover { background: var(--hover); }
  td.cell-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .78rem; }
  td.cell-num { font-variant-numeric: tabular-nums; }
  td.cell-s304 { color: var(--accent); font-weight: 600; }
  .sub { display: block; color: var(--muted); font-size: .72rem; }
  td.cell-body { color: var(--muted); }
</style>
</head>
<body>
<h1>ETag と 304 のデモ</h1>
<p class="lead">
  <strong>DevTools の Network タブを開いてから</strong>fetch を何度か押してください。
  表と Network タブを見比べられます。
</p>

<div class="controls">
  <button id="fetch">fetch</button>
  <button id="manual">If-None-Match を付けて fetch</button>
  <span class="sep"></span>
  <label class="field">
    <span class="prefix">name=</span>
    <input id="name" value="jiro" spellcheck="false" aria-label="name">
  </label>
  <button id="rename">名前を変えて fetch</button>
</div>

<div class="table-wrap">
  <table>
    <thead>
      <tr>
        <th>リクエスト</th><th>status</th><th>res.ok</th><th>ETag</th><th>X-Handler-Runs</th><th>JS が受け取ったボディ</th>
      </tr>
    </thead>
    <tbody id="rows"></tbody>
  </table>
</div>
<p class="hint">
  <code>X-Handler-Runs</code> はサーバーがハンドラを実行した回数
</p>
<p class="hint">
  <a href="https://github.com/yoshi47/hono-etag-304-demo">yoshi47/hono-etag-304-demo</a>
</p>

<script>
const rows = document.getElementById('rows')
const etags = {}
const plain = '/api/contacts'

function cell(cls, text) {
  const td = document.createElement('td')
  if (cls) td.className = cls
  td.textContent = text
  return td
}

function addRow(req, status, ok, etag, runs, body) {
  const tr = document.createElement('tr')
  const tdReq = cell('cell-mono', req.url)
  if (req.header) {
    const sub = document.createElement('span')
    sub.className = 'sub'
    sub.textContent = '+ ' + req.header
    tdReq.appendChild(sub)
  }
  tr.appendChild(tdReq)
  tr.appendChild(cell('cell-num' + (status === 304 ? ' cell-s304' : ''), String(status)))
  tr.appendChild(cell('cell-num', String(ok)))
  tr.appendChild(cell('cell-mono', etag || '—'))
  tr.appendChild(cell('cell-num', String(runs || '—')))
  tr.appendChild(cell('cell-mono cell-body', body || '(空)'))
  rows.prepend(tr)
}

async function run(path, req, init) {
  const res = await fetch(path, init)
  const body = await res.text()
  const etag = res.headers.get('etag')
  if (etag) etags[path] = etag
  addRow(req, res.status, res.ok, etag, res.headers.get('x-handler-runs'), body)
}

document.getElementById('fetch').addEventListener('click', function () {
  run(plain, { url: plain }, undefined)
})

document.getElementById('manual').addEventListener('click', async function () {
  if (!etags[plain]) await run(plain, { url: plain }, undefined)
  await run(plain, { url: plain, header: 'If-None-Match' }, { headers: { 'If-None-Match': etags[plain] } })
})

document.getElementById('rename').addEventListener('click', function () {
  const path = plain + '?name=' + encodeURIComponent(document.getElementById('name').value)
  run(path, { url: path }, undefined)
})
</script>
</body>
</html>
`
