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

## ファイル命名規則

| 対象 | 規則 | 例 |
| --- | --- | --- |
| リポジトリ | `{エンティティ名}Repository.ts`（エンティティ単位でまとめる） | `movieRepository.ts` |
| サービス | `{関数名}Service.ts`（export する関数は1つ。ファイル内固有のヘルパー関数は複数記述可） | `getMovieWithCacheService.ts` |

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

## CSS スタイリング

Tailwind で表現不可能なスタイル（カスタムアニメーション、CSS Variables を用いた動的スタイルなど）は `style` 属性・`<style>` タグを使用せず、コンポーネントと同階層に `index.module.css` を作成してインポートする。

## アイコン

アイコンは `components/ui/Icons/` のコンポーネントを使用する。

### アイコンコンポーネントの作成

新しいアイコンを追加する場合は `components/ui/Icons/XxxIcon.tsx` を作成する。

- シグネチャ: `export default function XxxIcon(props: React.SVGProps<SVGSVGElement>)`
- 色は `fill="currentColor"` を使用し、ハードコードしない（呼び出し元で `className` や `style` で制御する）
- `{...props}` でスプレッドし、サイズ・クラス等を上書き可能にする
- `<title>` タグでスクリーンリーダー向けのアクセシビリティ対応を行う

```tsx
import React from "react";

export default function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <title>スター</title>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
```

## アニメーション

UI の開発・改修にあたっては、スプリングアニメーションの実装を検討すること。

CSS の `linear()` 関数でスプリング曲線を表現する。参考: [CSSのlinear()によるスプリングアニメーション活用術](https://ics.media/entry/260402/)

```css
/* linear() でスプリング曲線を定義する例 */
.element {
  transition: transform 0.5s linear(/* ここにスプリング曲線の値 */);
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
