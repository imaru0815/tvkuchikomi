# TV口コミログ Ver.2

React + Vite + Supabase 対応版です。

## できること

- スマホ対応UI
- 番組表：放送中 / 今日 / 前後1週間
- 番組候補から口コミ投稿
- 表記ゆれ防止
- 放送回ごとの平均評価
- 口コミ一覧
- ネタバレぼかし
- いいね
- 神回ランキング
- 急上昇ランキング
- 口コミ数ランキング
- いいねランキング
- 番組ページ
- 番組追加
- Supabase未設定時はlocalStorageで動作

## Vercel反映

GitHubリポジトリ直下にこの中身をアップしてください。
Vercelは自動でReactアプリとしてビルドします。

## Supabaseを使う場合

1. Supabaseで新規プロジェクト作成
2. `supabase_schema.sql` をSQL Editorで実行
3. VercelのEnvironment Variablesに以下を設定
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
4. 再デプロイ
