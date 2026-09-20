# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


## コンテンツの確認・更新

- `node scripts/verify-examples.mjs`：条件別ページの代表MODをModrinth APIで照合し、確認日・公開バージョンIDを `src/data/verifiedExamples.json` に保存する。通常のビルドはこの記録を使用し、外部APIに依存しない。
- 照合結果の差分を読み、候補0件の案内や選定方法の記事の実例が引き続き正しいか確認する。APIでファイルが見つかっても、ゲーム内の起動確認とは区別する。
- `npm run build` の後に `node scripts/check-static.mjs` と `npm run lint` を実行する。本文・内部リンク・canonical・サイトマップを確認する。
- 新しいMODを候補に加える場合は、役割、用途の日本語説明、公式配布元、対応条件を確認する。類似した条件ページを機械的に増やさない。
- 不具合報告ではバージョン・ローダー・MOD名・再現手順を確認する。修正した事実と未検証の内容を混同しない。
- 広告は現在pending。liveへの変更だけでは配信準備は完了しない。広告ローダーと必要な同意管理は別途設定・検証する。
