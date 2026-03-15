<div style="display:flex; justify-content:center;">
    <img height="250" width="250" src="public/logo.png">
</div>
<p style="text-align:center; font-size:2rem; font-weight:bold;">りすとぽっと</p>
<p style="text-align:center;">観たい映画のリストを作成・管理するためのWebアプリケーションです。</p>

---

配信サービスからタイトルと視聴URLを入力することで、一元化されたリストを作成します。

以下の配信サービスに対応しています。

- Netflix
- Prime Video
- Disney+
- Hulu
- U-NEXT

Next.js / Turso / Vercel のフルスタックな構成になっています。

oonawaの個人プロジェクトであり、個人的な利用とソフトウェア開発の学習を兼ねて開発しています。

## 機能

- メールアドレス＋認証コードによるパスワードレスの認証（JWT＋Cookie）
- 観たい映画のリストへ作品を追加 / 編集 / 削除（React＋LocalStorage）
- TMDB API と連携した映画作品の検索  → 詳細情報の取得
- リストからランダムに一本を提案
- Tursoデータベースを使用したリストのクラウド同期

## ローカル環境構築

### 外部APIの利用登録

以下のAPIキーが必要です。

- [Resend](https://resend.com/)
- [TMDB](https://www.themoviedb.org/?language=ja)

### リポジトリをクローン

1. クローンする（`git clone https://github.com/oonawa/risutopo.git`）
2. 依存関係をインストールする（`npm install`）
4. ルートへ`local.db`を作成する
5. 環境変数をセットする
6. npm run devで開発サーバーを起動する
7. https://localhost:3000をブラウザで開く

> ローカルサーバーは`https`化されています。

> `.env` > `JWT_SECRET`は、コマンドでランダムな文字列を作成してください。
>
> 例：`openssl rand -hex 64`

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

### バックエンド

`/features`へ機能のカテゴリ別にディレクトリを作成します。
カテゴリ内では以下のように責務ごとの層を分けます。

| 層 | 概要 | 責務 | 
| --- | --- | --- |
| Action | Reactのサーバーアクション。バックエンドのエントリポイント。 | 認証チェック<br>引数のバリデーション<br>Serviceの呼び出し |
| Service | ビジネスロジックを記述する。 | DBのレコード / 外部APIの戻り値等の加工・整形<br>認可チェック<br>Repositoryの呼び出し |
| Repository | データのCRUDを行う。 | データベース操作<br>外部APIの呼び出し |

Action層・Service層は共通の`Resullt`型を返し、`success: boolean`で成功 / 失敗を表現します。

## 自動テストのポリシー

### 分類

**「テストサイズ」**を用います。

| サイズ | 定義 |
| --- | --- |
| Small | 単一のプロセス内で実行可能なテスト。 |
| Medium | 単一のマシン内で実行可能なテスト。 |
| Large | アプリケーション外部も含めて実物を使用するテスト。 |

### 実装

当面、実装は`Medium`テストを中心に行います。

- Action層に対して実装し、Service / Repository / テスト用DBまで一気通貫でテストする。
- Actionの`.ts`ファイルのすぐ隣へ実装する。（例：`getCurrentUserMovieList.ts` / `getCurrentUserMovieList.test.ts`）
- テストケースは日本語で記述する。（例：`ログイン中ユーザーは自身のリストアイテム全件を取得できる`）
- 1ケース＝1仕様とし、戻り値 / データベースの状態など期待する処理結果を網羅的に検証する。
- Cookieなど、副作用的に参照 / 更新される領域はモックしてテストする。

> ※UIコンポーネントのテスト方針は未定
