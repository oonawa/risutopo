# list feature のクライアント/サーバー分割

list feature の repository 層はユーザーの認証状態によって実装を切り替える。

## 構造

```
features/list/repositories/
  client/   # 未認証ユーザー向け（localStorage）
  server/   # 認証済みユーザー向け（DB）
```

## 動作

- **未認証**: `features/list/repositories/client/` が localStorage を使ってリストを管理する。
- **認証済み**: `features/list/repositories/server/` が DB を使ってリストを管理する。
- **ログイン時**: `syncUserList` を呼び出し、localStorage のデータを DB へ同期する。
