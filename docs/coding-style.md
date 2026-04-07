# コーディングスタイル

Biome で強制できるものは `biome.json` で縛る。ここには Biome で表現しきれないプロジェクト固有のスタイルルールを記載する。

## 関数定義スタイル

| 対象 | スタイル | 配置 |
| --- | --- | --- |
| React コンポーネント | `function` 宣言 | `components/` 配下、`page.tsx` など |
| カスタムフック | アロー関数 | `features/*/hooks/` |
| その他フロントエンド関数 | アロー関数 | — |
| サーバーアクション | `function` 宣言 | `features/*/actions/` |
| サービス・リポジトリ | `function` 宣言 | `features/*/services/`、`features/*/repositories/` |

サーバーサイドと React コンポーネント本体は `function` 宣言、それ以外（カスタムフックを含むフロントエンド関数）はアロー関数。

## React コンポーネント

- 1 ファイルにつき 1 コンポーネント。
- ファイル先頭で `export default function ComponentName(...)` の形でエクスポートする。末尾に `export default ComponentName` を別途書かない。
- props の型エイリアスは必ず `Props` という名前にする。

```tsx
type Props = {
  title: string;
};

export default function MovieCard({ title }: Props) {
  return <div>{title}</div>;
}
```

## import の順序

`biome.json` の `organizeImports` 設定で自動整列される。グループの意味論的な順序は以下の通り:

1. Node.js 組み込み（`node:` プレフィックス）
2. React・Next.js・その他サードパーティライブラリ
3. サーバーアクション（`@/features/*/actions/*`）
4. カスタムフック（`@/features/*/hooks/*`）
5. 汎用コンポーネント（`@/components/*`、`@/app/components/*`）
6. その他の内部モジュール（`@/**`）
7. 相対パス

Biome のグループ設定で表現しきれない細粒度の並び（React vs Next.js vs その他サードパーティの区別など）は手動で整える。
