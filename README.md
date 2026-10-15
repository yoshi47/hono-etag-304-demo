# hono-etag-304-demo

`ETag` / `If-None-Match` / `304 Not Modified` の挙動を、ブラウザの DevTools で確かめるための最小デモです。
[Hono](https://hono.dev/) の [etag ミドルウェア](https://hono.dev/docs/middleware/builtin/etag) を使って、Cloudflare Workers で動いています。

**公開デモ:** https://hono-etag-304-demo.yoshi47.workers.dev/

![デモページ](assets/demo.png)

## 確かめられること

- 2回目の `fetch('/api/contacts')` は**通信上は 304** になるが、**JS には 200 とボディが届く**（ブラウザがキャッシュから差し替える）
- 自分で `If-None-Match` を付けたときだけ、**304 がそのまま JS に届く**（`res.ok` は `false`、ボディは空）
- **304 でもサーバーのハンドラは毎回動いている**（`X-Handler-Runs` が増える）

公開デモのページを開き、DevTools の Network タブを出した状態でボタンを押すと確かめられます。

## 構成

| ファイル | 役割 |
| --- | --- |
| `src/app.js` | アプリ本体（Hono）。Workers と Node の両方から読み込む |
| `src/page.js` | 確認用の HTML ページ |
| `server.mjs` | Node で動かすためのランチャー |
| `wrangler.jsonc` | Cloudflare Workers の設定 |

アプリ本体は `src/app.js` の1つだけです。エントリポイントが Workers でも Node でも、同じコードが動きます。

## 手元で動かす

```bash
npm install
npm run dev     # wrangler dev → http://localhost:8787
```

Node（`@hono/node-server`）で動かす場合も同じアプリが動きます。

```bash
npm start       # node server.mjs → http://localhost:8787
```

## デプロイ

```bash
npx wrangler login
npm run deploy
```

`wrangler.jsonc` の `name` を変えれば、`https://<name>.<account>.workers.dev` で公開されます。

## レスポンスヘッダの補足

| ヘッダ | 意味 |
| --- | --- |
| `ETag` | ボディのハッシュ。`hono/etag` が付ける。ボディがバイト単位で同じなら同じ値になる |
| `Cache-Control: no-cache` | 「保存はするが毎回再検証する」をブラウザに伝える。ブラウザにはキャッシュさせたいがエッジ（Cloudflare）にはキャッシュさせたくない、という指定 |
| `X-Handler-Runs` | サーバー側のハンドラ実行回数（Workers インスタンスごと・全訪問者で共有）。304 のレスポンスにも載る |

## 元記事

- Zenn: https://zenn.dev/yoshi47/articles/etag-304-hono-devtools
