<p align="center">
    <img height="250" width="250" src="public/logo.png">
</p>
<h1 align="center">りすとぽっと</h1>
<p align="center">観たい映画のリストを作成・管理するためのWebアプリケーション</p>

配信サービスからタイトルと視聴URLを入力することで、一元化されたリストを作成します。

以下の配信サービスに対応しています。

- Netflix
- Prime Video
- Disney+
- Hulu
- U-NEXT

oonawaの個人プロジェクトであり、個人的な利用とソフトウェア開発の学習を兼ねて開発しています。

## 主な機能

- メールアドレス＋認証コードによるパスワードレスの認証（JWT＋Cookie）
- 配信サービスの共有リンクを使ったリスト登録
- TMDB API と連携した映画情報の検索 ＆ 取得
- リストからランダムに一本を抽選
- LocalStorageによるユーザー登録なしでの利用

## ローカル環境構築

Next.js / Turso / Vercel のフルスタックな構成になっています。

### 環境変数

`.env`と`.env.test`を使います。

#### `.env`

| 変数名 | 用途 | 内容 |
| --- | --- | --- |
| RESEND_API_KEY | 認証時のメール送信 | [Resend](https://resend.com/)で発行 |
| TMDB_API_KEY | 詳細な映画情報の取得 | [TMDB](https://www.themoviedb.org/?language=ja)で発行 |
| TURSO_DATABASE_URL | アプリケーションが接続するデータベースの指定 | `file:local.db` |
| JWT_SECRET | セッションごとに発行されるトークンの検証 | ランダム文字列を指定 or `openssl rand -hex 64`などで作成

#### `.env.test`

| 変数名 | 用途 | 内容 |
| --- | --- | --- |
| TURSO_DATABASE_URL | アプリケーションが接続するデータベースの指定 | `file:local.test.db` |
| JWT_SECRET | セッションごとに発行されるトークンの検証 | ランダム文字列を指定 or `openssl rand -hex 64`などで作成

### リポジトリをクローン

1. リポジトリをクローン（`git clone https://github.com/oonawa/risutopo.git`）
2. 依存関係をインストール（`npm install`）
4. ルートへ`local.db`を作成
5. 環境変数をセット
6. 開発サーバーを起動（`npm run dev` or `make dev`）
7. データベースをマイグレーション（`npm run db:migrate` or `make migrate`）
8. マスタテーブルへレコードを登録（`npm run db:seed` or `make seed`）
8. `https://localhost:3000`をブラウザで開く

<br>

> ⚠️開発サーバーは`https`化しています。

## AIの利用ポリシー

このプロジェクトでは開発にCodex CLIを使用しています。
しかし設計（再設計）・リファクタリングの多くは開発者自身で行なっています。

生成されたコードは、基本的に開発者によるレビュー / リファクタリングを受けます。

Codex CLIには、主に以下の作業を依頼しています。

- 設計相談
- 既存機能への仕様追加
- ローカルでのコードレビュー
- 軽微な修正 / 単調な作業

## 開発フロー

### タスク管理
- 追加や修正の内容はIssueへ書き出す。
- 新規機能など、影響範囲の大きい作業はなるべくSub Issueへ分割する。
- ローカルではIssue（Sub Issue）ごとにブランチを作成する。
    - タスクがSub Issueへ分割される場合は、main > 親Issue > Sub Issueとして作成する。
    - ブランチ名は新規追加なら`feat/#Issue番号`・修正なら`fix/#Issue番号`とする。

### Git運用
- コミットはコメントへプレフィックスをつける。
    - feat: 追加
    - fix: 修正
    - ref: 振る舞いの変わらないリファクタリング
    - test: テストコードの追加
- 適宜Codexへレビューを依頼し、コードの品質をチェックする。
- リモートへプッシュする際はコミットをスカッシュする。
    - `git rebase -i HEAD~{コミット数}`
    - 単一Issueなら`main`・Sub Issue なら 親IssueのブランチへPRを作成する。

## 設計ポリシー

`/features`へ機能のカテゴリ別にディレクトリを作成します。
ディレクトリ内では責務ごとに層を分けます。

| 層 | 概要 | 責務 | 
| --- | --- | --- |
| /actions | Reactのサーバーアクション。バックエンドのエントリポイント。 | 認証チェック<br>引数のバリデーション<br>Serviceの呼び出し |
| /services | バックエンドのビジネスロジックを記述する。 | DBのレコード / 外部APIの戻り値等の加工・整形<br>認可チェック<br>Repositoryの呼び出し |
| /repositories | データのCRUDを行う。 | データベース操作<br>外部APIの呼び出し |
| /hooks | フロントエンドのビジネスロジックをカスタムフックとして記述する。 | ステートやLocalStorageの操作<br>入力値の加工 / 操作
| /types | 型定義を記述する。| 機能全体で共有するデータのモデリング |
| /schemas | Zodのスキーマを記述する。 | バリデーション |

Action層・Service層は共通の`Resullt`型を返し、`success: boolean`で成功 / 失敗を表現します。

### フロントエンド

コンポーネントを分類し、種類別に配置します。

| コンポーネントの種類 | 配置箇所 |
| --- | --- |
| 機能に紐づかない汎用コンポーネント | ルートの`/components` |
| 機能に紐づく汎用コンポーネント | `/app/components` |
| 特定のページ内でのみ使用するコンポーネント | `/page.tsx`と同階層の`/components` |

## 自動テストのポリシー

### 分類

**「テストサイズ」**を用います。

| サイズ | 定義 |
| --- | --- |
| Small | 単一のプロセス内で実行可能なテスト。 |
| Medium | 単一のマシン内で実行可能なテスト。 |
| Large | アプリケーション外部も含めて実物を使用するテスト。 |

### 実装

当面、`Medium`テストを中心に実装します。

- Action層に対して実装し、Service / Repository / テスト用DBまで一気通貫でテストする。
- Actionの`.ts`ファイルのすぐ隣へ実装する。（例：`getCurrentUserMovieList.ts` / `getCurrentUserMovieList.test.ts`）
- テストケースは日本語で記述する。（例：`ログイン中ユーザーは自身のリストアイテム全件を取得できる`）
- 1ケース＝1仕様とし、戻り値 / データベースの状態など期待する処理結果を網羅的に検証する。
- Cookieなど、副作用的に参照 / 更新される領域はモックしてテストする。

> ※UIコンポーネントのテスト方針は未定
