# WordBeat Trainer

英単語のタイピング練習、発音確認、指使いガイドをまとめた Web アプリです。  
MVP では、ブラウザだけで練習開始から結果確認まで完結します。
- 公開URL: https://shgnaka.github.io/english-word-typing-pronunciation-web-trainer/

## MVPでできること

- 英単語を 1 語ずつ入力して練習する
- 次に打つ 1 文字を強調表示する
- `US QWERTY` 前提でキー位置と推奨指を表示する
- 端末の音声読み上げ機能で単語の発音を再生する
- カスタム英単語を追加して練習対象を増やす
- セッション設定を `localStorage` に保存する
- `WPM`, `Accuracy`, `Score`, `Level` を結果画面に表示する

## Tech Stack

- `Vite`
- `React 19`
- `TypeScript`
- `Vitest` + Testing Library
- `Playwright`
- `GitHub Pages`

## Local Development

前提:

- `Node.js 23` 前後
- `npm 11` 前後

セットアップ:

```bash
npm install
```

開発サーバー:

```bash
npm run dev
```

本番ビルド:

```bash
npm run build
```

プレビュー:

```bash
npm run preview
```

## Test

単体テスト:

```bash
npm test
```

E2E テスト:

```bash
npm run test:e2e
```

Playwright UI モード:

```bash
npm run test:e2e:ui
```

補足:

- 初回は Playwright ブラウザの導入が必要です
- 必要に応じて `npx playwright install` を実行してください
- 既定の E2E は `chromium` と `firefox` を実行します
- `WebKit` を含める場合は `PLAYWRIGHT_INCLUDE_WEBKIT=1 npm run test:e2e` を使ってください
- 一部環境では `WebKit` 実行に追加のシステム依存が必要です

## Project Structure

```text
src/
  data/       初期語彙
  domain/     セッション、スコア、単語、キーボードマップ
  features/   画面横断の状態管理
  infra/      localStorage と speech synthesis
  test/       Vitest セットアップ
tests/e2e/    Playwright E2E
docs/         仕様メモ
```

## Deploy

GitHub Pages へ自動デプロイする構成です。

- push 先ブランチ: `main`
- workflow: [deploy-pages.yml](./.github/workflows/deploy-pages.yml)

初回だけ GitHub 側で以下を設定してください。

1. リポジトリの `Settings`
2. `Pages`
3. `Source` を `GitHub Actions` に変更

## Current Constraints

- 練習対象は英単語のみ
- キーボード配列は `US QWERTY` 固定
- 保存先はブラウザの `localStorage`
- CSV import、アカウント、同期、バックエンドは未対応
- 発音はブラウザの `SpeechSynthesis API` 依存

## Acceptance Status

MVP として以下は完了済みです。

- 練習画面
- 単語追加
- 設定保存
- スコア表示
- 単体テスト
- Playwright E2E 基盤
- GitHub Pages デプロイ設定

## Related Files

- 仕様メモ: [docs/english-word-typing-pronunciation-web-trainer-spec.md](./docs/english-word-typing-pronunciation-web-trainer-spec.md)
- 実装仕様: [docs/implementation-spec.md](./docs/implementation-spec.md)
- E2E 設定: [playwright.config.ts](./playwright.config.ts)
- CI: [.github/workflows/ci.yml](./.github/workflows/ci.yml)
