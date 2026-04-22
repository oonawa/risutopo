# Issue: サブリストUI コンポーネントのテスト追加

## 背景

フェーズ6のUI実装（SubListCreateModal・SubListSelectDrawer・SubMenu拡張）が完了した。
ただし UIコンポーネントのテストが存在しない。

---

## 追加すべきテスト一覧

### 1. SubListCreateModal

ファイル: `app/components/SubListCreateModal/index.test.tsx`

| # | テスト内容 | 確認ポイント |
|---|---|---|
| 1 | `isLoggedIn=true` でフォーム送信 → `createSubList` Server Action が呼ばれる | Action 呼び出し確認 |
| 2 | `isLoggedIn=false` でフォーム送信 → LocalStorage の `createSubList` が呼ばれる | ローカル処理確認 |
| 3 | 作成成功後に `router.push` で遷移する | 遷移先 URL 確認 |
| 4 | 名前が空のとき送信ボタンが disabled になる | バリデーション確認 |
| 5 | キャンセルボタンで `onClose` が呼ばれる | コールバック確認 |

### 2. SubListSelectDrawer

ファイル: `app/components/SubListSelectDrawer/index.test.tsx`

| # | テスト内容 | 確認ポイント |
|---|---|---|
| 1 | `isLoggedIn=true` でドロワーを開く → `getSubLists` Action が呼ばれる | データ取得確認 |
| 2 | `isLoggedIn=false` でドロワーを開く → LocalStorage からサブリストを読む | ローカル取得確認 |
| 3 | 未ログイン時: アイテムが既に属するサブリストはチェック済み状態で表示される | 初期チェック確認 |
| 4 | チェック ON → `addSubListItem` Action（ログイン済み）または `addLocal`（未ログイン）が呼ばれる | トグルON確認 |
| 5 | チェック OFF → `removeSubListItem` Action（ログイン済み）または `removeLocal`（未ログイン）が呼ばれる | トグルOFF確認 |
| 6 | 「新しいサブリストを作成」ボタンで SubListCreateModal が開く | モーダル開閉確認 |

### 3. SubMenu（「サブリストに追加」メニュー項目追加）

ファイル: `app/components/ListItem/Content/SubMenu/index.test.tsx`（既存があれば追記）

| # | テスト内容 | 確認ポイント |
|---|---|---|
| 1 | メニューを開くと「サブリストに追加」項目が表示される | UI存在確認 |
| 2 | 「サブリストに追加」をクリックすると SubListSelectDrawer が開く | ドロワー開閉確認 |

### 4. LocalList（サブリストフィルタ）

ファイル: `app/[publicListId]/components/LocalList/index.test.tsx`

| # | テスト内容 | 確認ポイント |
|---|---|---|
| 1 | `publicListId` がメインリストIDと一致する場合、全アイテムを表示する | フィルタなし確認 |
| 2 | `publicListId` がサブリストIDと一致する場合、所属アイテムのみ表示する | フィルタあり確認 |
| 3 | `publicListId` がどのサブリストとも一致しない場合、全アイテムを表示する（フォールバック） | フォールバック確認 |

---

## 優先度

高: `SubListSelectDrawer`（ログイン/未ログイン分岐・チェック状態が複雑）
中: `SubListCreateModal`（フォームバリデーション・遷移）
低: `SubMenu` 項目追加・`LocalList` フィルタ
