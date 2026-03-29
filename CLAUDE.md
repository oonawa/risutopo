# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 基本ルール

- 思考は英語、ユーザーへの回答やコード内のコメント、ドキュメント作成は常に日本語で行うこと。
- コードは可読性と型安全性を重視する。
  - 同じことができるなら、行数がより少ない方がいい。
  - 同じことができるなら、より単純なコードがいい。
  - コードの変更を行う際は、必ず型チェックを実行する。エラーがなくなるまで再帰的に修正と再チェックを繰り返す。
  - コードの変更を行う際は、必ずBiomeでのリントを実行する。エラーがなくなるまで再帰的に修正と再チェックを繰り返す。
  - コードを変更したら、必ずセルフチェックしてパフォーマンスやセキュリティの懸念を見つける。
  - `as`による型アサーションは絶対に使用しない。（`as const`によるconstアサーションは型アサーションではない）
  - `any`型は絶対に使用しない。
  - 現行の実装を尊重しすぎず、継ぎ足しによる局所最適ではなく全体最適なコードを書くこと。
- レビュー・指摘・整合性確認・差分説明を行う前に、必ず対象ファイルを再読すること。
  - ユーザーはCodexの指摘に対応していても、それをCodexへ伝えないことがあります。
  - 「さっき読んだ内容」は無効。回答直前に再読した内容のみを根拠にすること。
  - 対象が複数ファイルの場合、全ファイルを再読すること。
  - 再読せずに推測で回答してはいけない。
- レビューは厳正に忖度なく行うこと。
  - ファイル名、ディレクトリ名、コード内のすべての記述において誤字と思われるものがあれば必ず指摘すること。
  - 「理論上あり得る入力」ではなく「この実装の実際の入力経路」に基づいて懸念を判断すること。
  - 改善提案を出すときは、前提（入力源・型定義・到達経路）を明示し、前提が満たされる場合は簡潔な実装を優先すること。
  - 指摘や説明を行う際は、必ず「現状の事実」と「将来の可能性（リスク・拡張時の注意点）」を明確に区別して記載すること。
    - 現状では問題ない事項を述べる場合は、「現状では問題ない」と明示したうえで補足として将来の可能性を記載すること。
    - 将来の可能性を理由に指摘する場合は、推測で断定せず「将来リスク」であることを明示すること。

## 実装ルール

###　Reactコンポーネント

- 余計な再レンダリングは防ぐように実装すること。
- ステートの変化により再レンダリングが無限にループする可能性には特に留意し、これを防ぐこと。

### データベース操作

- クエリ効率を重視する。
- 同じテーブルへ複数のレコードの追加 / 削除を行う場合は一度のクエリで行う。
- `for`などのループ処理の中では絶対にクエリを発行してはならない。

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

## アーキテクチャ

**スタック**: Next.js 16 (React 19)、Turso (LibSQL)、Drizzle ORM、Tailwind CSS v4、Jotai、Zod、Vitest、Biome

バックエンド処理はすべて **Server Actions** で実装（APIルートなし）。各featureは以下の階層構造を持つ：

```
features/<name>/
  actions/      # "use server" — 入力バリデーション + サービス呼び出し + Cookie操作
  services/     # ビジネスロジック + 認可
  repositories/ # Drizzle ORM CRUD（listfeatureはserver/とclient/に分割）
  hooks/        # フロントエンドの状態管理 + localStorage操作
  schemas/      # Zodバリデーションスキーマ
  types/        # TypeScript型定義
```

Features: `auth`、`list`、`movieDatabase`、`user`、`shared`

### Resultパターン

全レイヤーは以下の判別共用体を返す：

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: AppError }
```

`AppError`は`features/shared/types/`で定義。

### 認証

パスワードレスメール認証フロー：コード送信 → コード検証 → JWTセッショントークンをHttpOnly Cookieに設定（`session_token`）。未登録ユーザーには登録完了まで短命の`temp_session_token`を発行。レート制限は`login_attempts_table`で管理。

### Listfeatureのクライアント/サーバー分割

`features/list/repositories/client/`は未認証ユーザー向けにlocalStorageを使用。`features/list/repositories/server/`はDBを使用。ログイン時に`syncUserList`でクライアント側のデータをDBへ同期。

### データベース

スキーマは`db/schema.ts`、マイグレーションは`migrations/`。ローカル開発は`file:local.db`（`TURSO_DATABASE_URL`で設定）、本番はTurso cloudに接続。

### テスト

以下のように分類する。

- Small：単一プロセスで実行可能なテスト。
- Medium：単一マシン内で実行可能なテスト。
- Large：ブラウザや外部APIなどに実物を用いるテスト。

テストはMediumサイズを中心に実装する。

バックエンドはaction → service → repository → テスト用DBを通しでテストする。
テストセットアップ（`tests/helpers/setup.ts`）は初回にマイグレーションを実行し、各テスト間で全テーブルをリセットする。
テスト名は日本語で記述。最大ワーカー数は1（`vitest.config.ts`）。
