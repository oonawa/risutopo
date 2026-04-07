# CLAUDE.md

Next.js 16 / React 19 / Turso / Drizzle ORM / Tailwind CSS v4 / Jotai / Zod / Vitest / Biome 構成の映画リスト管理アプリ。

## 言語

- 思考は英語、ユーザーへの回答・コード内のコメント・ドキュメントは日本語。

## 作業フロー

すべての作業は @docs/workflow.md のフローに従う。原則として計画フェーズ（Opus）から開始し、ユーザーの承認なしにコード編集を始めない。依頼されていないリファクタリングを実装フェーズ中に混ぜない。

## 作業前後の必須動作

- レビュー・指摘・整合性確認・差分説明の直前に、対象ファイルを必ず再読すること。「さっき読んだ」は無効。
- コード変更後は型チェックと `npm run lint` を実行し、エラーがなくなるまで再帰的に修正すること。

## 絶対ルール

- `as` による型アサーションは使用しない。（`as const` は許可）
- ループ内で DB クエリを発行しない。同一テーブルへの複数操作は 1 クエリにまとめる。

## コマンド

```bash
# 開発
npm run dev          # HTTPS付きでNext.js開発サーバー起動 (--experimental-https)

# ビルド・リント
npm run build
npm run lint         # Biome自動修正付きリント
npm run format       # Biome自動修正付きフォーマット

# テスト
npm run test                    # 全テスト実行 (Vitest)
npx vitest run path/to/file     # 特定のテストファイルのみ実行

# データベース
npm run db:generate  # スキーマ変更からマイグレーション生成
npm run db:migrate   # マイグレーション適用
npm run db:seed      # ストリーミングサービスのシードデータ投入
```

## ドキュメント参照

- アーキテクチャ・設計: @docs/architecture.md
- list feature の client/server 分割: @docs/list-feature.md
- テスト方針: @docs/testing.md
- レビュー・指摘のポリシー: @docs/review-policy.md
- コーディングスタイル: @docs/coding-style.md
- 作業フロー: @docs/workflow.md
