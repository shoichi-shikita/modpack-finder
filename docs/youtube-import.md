# YouTubeからMOD構成を読み込む

実装ブランチ: `codex/youtube-mod-detection`。既存React/Viteアプリの構成作成ページに統合しています。本番へのマージ・公開はまだ行っていません。

## 使い方

1. 構成作成ページの「YouTubeの動画から探す」に動画URLを入力。
2. 「動画を調べる」で概要欄・取得可能な字幕・対応サイトのリンク先を確認。
3. 確定したMODと候補・推定MOD、Minecraftバージョン、ローダー、配布リンク、出典を確認。
4. 誤検出はチェックを外す。推定MODは初期選択しないため、必要なものだけ選択。
5. 条件が不明または複数の場合、Minecraftとローダーを指定して「対応ファイルを再確認」。
6. 「選択したMODで構成を作る」で既存の依存関係確認・構成編集・mrpack出力へ進む。

Modrinthの対応ファイルが確認できたものだけ取り込みます。未解決・非対応・CurseForgeのみの候補は取り込み数に含めません。構成は現在のMOD構成を置き換えます。

## アーキテクチャと変更ファイル

| ファイル | 役割 |
|---|---|
| `src/components/YouTubeImport.jsx` | URL、追加出典、進捗、中止、エラー、根拠付き結果、選択・除外、再照合 |
| `src/App.jsx` | 既存結果列への統合、バージョン・ローダーを反映して `buildPackFromSlugs` を実行 |
| `src/index.css` | 既存の暗い緑・角形・罫線中心のUIに合わせたレスポンシブ表示 |
| `src/utils/packBuilder.js` | 指定MODの選定理由を正しく表示。大きな入力でも依存確認用の余裕を確保し、上限到達を明示 |
| `src/components/Privacy.jsx` | 動画・出典URL、検索サービスへの問い合わせと保存範囲の説明 |
| `functions/api/youtube.js` | Cloudflare Pages Functions の `POST /api/youtube` |
| `server/youtube/handler.js` | JSON入力・オリジン検証、容量・時間制限、簡易レート制限、安全なエラー応答 |
| `server/youtube/network.js` | 許可ホストだけへのHTTPS取得、リダイレクト拒否、応答サイズ・タイムアウト制御 |
| `server/youtube/extract.js` | URL正規化、YouTube JSON抽出、HTML本文、MOD一覧、バージョン・ローダー抽出 |
| `server/youtube/analyze.js` | メタデータ・字幕・資料の収集、重複統合、確定/推定分類 |
| `server/youtube/resolve.js` | Modrinth、任意のCurseForge照合、対応ファイル検索 |
| `server/youtube/dev-plugin.js`, `vite.config.js` | 開発時も本番と同じハンドラーを実行。別サーバー起動不要 |
| `public/_routes.json`, `wrangler.jsonc` | APIのみFunctionsを通し、既存22ページは静的配信を維持 |
| `public/_redirects` | 無効な404書式を削除。既存の最上位404.htmlをPages標準機能で使用 |
| `.env.example`, `.gitignore` | サーバー用設定例と秘密情報の除外 |
| `package.json`, `package-lock.json` | Cheerio・Wranglerと検証コマンド |
| `tests/youtube.test.js`, `scripts/test-youtube-live.mjs` | オフラインの回帰テストと明示実行の実動画テスト |

APIの `action: "resolve"` は最大8件ずつ処理し、ブラウザから順に呼びます。多数のMODでも1回のWorker実行で大量の外部リクエストを発生させない構成です。クライアントにAPIキーやHTML解析ライブラリは含みません。

## 抽出・信頼度

- YouTubeのwatch、youtu.be、shorts、live、embed、モバイルURLを動画IDに正規化。
- 任意のYouTube Data APIでタイトル・概要欄を取得。未設定・API失敗時は公開watchページのJSONを読みます。スクリプトは実行しません。
- 公開ページが示す字幕トラックからJSON字幕を取得。空・制限付き字幕を取得成功とみなしません。
- 概要欄リンクおよび追加資料を最大4ページ取得。任意のBrave Search設定時はタイトル・作者名から関連資料を検索します。
- 箇条書き、MOD一覧の見出し、ラベル付き一覧、Modrinth/CurseForgeのMODリンクを抽出。字幕などの言及はModrinthの人気100件の名称辞書でも補足します。
- **確定/高**: 概要欄または概要欄がリンクした資料の明示的なMOD一覧。
- **推定/中**: 手動追加・検索で見つけた資料のMOD一覧。別シリーズとの取り違えを避けるため、作者が同じでも確定へ昇格させません。
- **推定/低**: タイトル・字幕などの名称言及。ゲーム映像で使用確認した意味ではありません。
- 各MODに出典URL・短い抜粋・出典種別・動画との関係を保持。数値の「正解確率」は表示しません。
- 名前またはslugの正規化後の完全一致が1件の場合だけ配布先を解決。曖昧な検索1位を採用しません。
- 選択したMinecraftとローダーの**組み合わせ**でリリースを検索。掲載バージョン一覧だけで対応を判断しません。
- LLMは使用していません。AIによる架空のMOD推測や追加料金はありません。

## 環境変数

すべて任意。キーなしでも公開YouTubeページ、リンクされた資料、Modrinthで動作します。

| 名前 | 用途 |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3を有効化したキー。メタデータ取得を補助。字幕制限を解除するものではありません |
| `BRAVE_SEARCH_API_KEY` | 概要欄にないMOD一覧の発見を補助。検索で得た資料は推定扱い |
| `CURSEFORGE_API_KEY` | Modrinthで名前を解決できない場合のCurseForge検索・対応ファイル照合 |

Vite開発時: `.env.example` を `.env.local` にコピーして必要な値だけ設定し、再起動。
Wrangler開発時: 同じ変数を `.dev.vars` に設定。
本番: Cloudflare PagesプロジェクトのVariables and Secretsにサーバー側のSecretとして設定。
**`VITE_` 接頭辞を付けないでください。** キーを入力するクライアントUIはありません。

## ローカル起動・テスト

Node.js 22.12以降または24を使用。検証環境はNode 24.19.0。

```sh
npm ci
npm run dev
```

画面とAPIの両方が起動します。外部のYouTube・Modrinth等への通信が必要です。

```sh
npm test
npm run lint
npm run build
node scripts/check-static.mjs
npm run check:worker
npm run preview:api
```

`preview:api` はビルド後に実行。本番相当のCloudflare実行環境でAPIも動かします。通常の `npm run preview` は静的ViteプレビューなのでYouTube APIは動きません。

実動画テスト:

```sh
npm run test:youtube:live
```

このコマンドは実際に外部通信します。環境変数を使う場合はシェルに設定するか `node --env-file=.env.local scripts/test-youtube-live.mjs` で実行。通常のテストは通信不要です。

## 指定動画での検証結果（2026-09-21）

対象: https://www.youtube.com/watch?v=v8AhuSKAJpc

- URLのみ・APIキーなし: メタデータ取得成功。概要欄に対応するMOD一覧リンクなし。字幕トラックは存在するものの本文が空だったため、MODを捏造せず「特定できない」と表示。
- 追加の出典 `https://note.com/nigghome/n/nbac4b639ebc0` を指定: 65件の候補、Minecraft 1.20.1、Forge 47.3.0を抽出。Thermal Dynamicsの重複は統合。
- Ex Deorum / Create / ProjectE / Powah / Refined Storage / Hostile Neural Networks の6件を抽出。
- Ex Deorum / Create / Powah / Refined Storage / Hostile Neural Networks はModrinthで1.20.1 / Forge対応ファイルを確認。
- ProjectEは検証時に一意のModrinth掲載先を解決できず未解決。CurseForgeの実APIはキー未設定につき未検証。
- noteの埋め込み動画は指定動画と異なるため、この記事からの抽出は**候補**のまま。動画固有の名前・バージョン・出典を本体コードに埋め込んでいません。
- ブラウザで候補チェック、Powahの選択解除、CreateとEx Deorumの2件取り込み、既存構成結果・mrpack出力ボタンを確認。
- PC幅と390px幅で表示確認。モバイル入力は縦配置、横はみ出しなし。
- オフライン回帰テスト、Lint、本番ビルド、既存22静的ページのチェック、Workerコンパイル、Worker環境の実APIで65候補取得を確認。

## 制限と運用

- YouTubeはホスト環境・地域・IP・アクセス制限で取得できない場合があります。認証、視聴制限、CAPTCHAは回避しません。
- YouTube Data APIが使えても他人の動画の字幕取得が保証されるわけではありません。
- ネットワーク・API失敗は利用できた出典や結果を残し、再照合できます。非公開/削除済みとアクセス制限を常に厳密に区別できるわけではありません。
- タイトル・概要欄・字幕にMinecraftの記載がないとMinecraft動画と確認できません。日本語別名や説明文だけのMODは取りこぼします。
- 追加資料の自動取得対象はnote、Modrinth、CurseForge、GitHub（raw/gist含む）、Pastebinの許可ホストのみ。短縮URL・リダイレクトは追跡しません。任意URLプロキシにはしていません。
- zip/mrpackアーカイブの中身やJavaScriptで後から描画される一覧は読みません。リンクは表示しますが、設定ファイル等を実行しません。
- 上限: 4資料、本文各10万文字、80候補、照合8件/リクエスト。外部取得8秒、API全体45秒、入力16KB、応答本文2.5MB（資料1.5MB）。
- サーバーに解析内容を永続保存しません。レスポンスはno-store。ホスティング側の通常のアクセスログは別です。
- 簡易レート制限は実行インスタンス単位で30リクエスト/分。大規模な公開運用ではCloudflare側でもAPIへのレート制限とAPI利用上限を設定してください。分散したアクセスを完全に制限する仕組みではありません。
- Brave Search / CurseForgeの任意経路はモックで検証します。実キーを使ったサービス接続は未検証です。
- 相互競合・正確なMODリリース・作者の設定変更・レシピスクリプト・ローダーの厳密なビルド番号・ワールドは再現しません。既存の構成作成は選択条件に合う配布ファイルと依存MODを調べるもので、ゲームの起動試験は行いません。

## 公開方法

既存のCloudflare Pages Git連携を利用し、ビルドは `npm run build`、出力は `dist`、ルートはリポジトリ直下。`functions/` を含むソースから公開する必要があります。distだけをダッシュボードへアップロードするとFunctionsは含まれません。CLIならリポジトリ直下で `npx wrangler pages deploy dist` を実行できます。この変更では公開操作を行っていません。

参照した仕様: [Pages Functions](https://developers.cloudflare.com/pages/functions/)、[YouTube videos.list](https://developers.google.com/youtube/v3/docs/videos/list)、[Modrinth Search](https://docs.modrinth.com/api/operations/searchprojects/)、[CurseForge API](https://docs.curseforge.com/rest-api/)、[Brave Search](https://api-dashboard.search.brave.com/app/documentation/web-search/get-started)。
