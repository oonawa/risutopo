# フロントエンド実装指針：Async React

## 基本的な考え方

アプリケーションをデフォルトで非同期とみなして構築する。ユーザーの操作からUIが更新されるまでの間には必ず時間がかかる。この時間を3つの状態として捉え、それぞれを適切なAPIで埋めることで、チラつきやポップインのない滑らかなUIを実現する。

| 状態 | タイミング | 使うAPI |
|------|----------|---------|
| busy | ユーザー操作 → サーバーへのリクエスト送信まで | useOptimistic |
| loading | リクエスト送信 → レスポンス受信まで | Suspense |
| done | レスポンス受信 → 画面描画まで | ViewTransition |

## useTransition / startTransition

すべての非同期操作の前提となる。状態更新を「緊急でない更新」としてマークし、現在の画面をブロックしない。

- サーバーへのリクエストを伴う操作は必ず `startTransition` でラップする
- `useTransition` の `isPending` をローディング表示の判定に使う

## useOptimistic

busy 状態を埋める。サーバーのレスポンスを待たずにUIを即座に更新し、ユーザーの操作を遅延なく反映させる。

- フォームの送信・ボタンのトグルなど、結果が予測できる操作に使う
- `startTransition` の中で `setOptimisticState` を呼ぶ

## Suspense

loading 状態を埋める。データフェッチ中の画面をフォールバックコンポーネントで表示する。

- データを取得するコンポーネントは `<Suspense fallback={...}>` で囲む
- フォールバックはスケルトンUIなど、レイアウトが崩れないものを用意する
- `<Suspense>` の境界はなるべく細かく設定し、ページ全体をブロックしない

## useDeferredValue

入力フィルタや検索など、ユーザーの入力に対してリストの再レンダリングを遅延させるときに使う。入力のレスポンシビリティを優先しながら、重い更新を後回しにする。

## ViewTransition

done 状態を埋める。画面遷移やリストの変化を滑らかにアニメーションする。

- ページ間のナビゲーションに適用する
- リスト要素の追加・削除・並び替えに key と組み合わせて使う
- アニメーションの目的は「要素がどこから来てどこへ行くか」をユーザーに伝えること。派手さのためのアニメーションは入れない

## use / Suspense との組み合わせ

Promiseを `use()` でunwrapすることで、コンポーネントのレンダリングをデータ取得と宣言的に結びつける。

## useActionState / useFormStatus

フォーム入力＋非同期処理（アクション）＋stateの更新をまとめて扱うAPIとして使う。

| API | 用途 |
| --- | --- |
| useActionState | 非同期処理の結果が格納されるstate、非同期関数をトランジション内にラップした関数と、進行状態booleanを返す |
| useFormStatus | 親コンポーネントのトランジションから進行状態のみを取得する |

## useSyncExternalStore

LocalStorageなどReact外部の値を参照してUIを同期させる。

## useEffectEvent（React 19.2）

useEffectからイベントハンドラを分離するためのAPIとして使う。エフェクト内で登録したイベントリスナーの解除・再登録を防ぎ、かつ常に最新のstateを参照できる。

```tsx
const onTick = useEffectEvent(() => {
  fetchLatestData(filters, sortOrder);
});

useEffect(() => {
  const id = setInterval(onTick, 10000);
  return () => clearInterval(id);
}, []); // filtersなどを依存配列に含めなくてよい
```

依存配列への過剰な追加を避けられるため、パフォーマンスと可読性の両方が向上する。

## &lt;Activity /&gt;

条件付きレンダー（`{flag && <Component />}`）の代替。`hidden` のときは `display: none` で非表示になるが、内部のstateは保持される。

```tsx
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <Page />
</Activity>
```

- stateを保持したい場合は `<Activity>`を使う
- 不要な場合は条件付きレンダーを使い分ける

## cacheSignal（React 19.2）

RSCにおいて不要になった非同期フェッチを即座にキャンセルするAPIとして使う。`cache` によりデデュープされたフェッチが複数コンポーネントから待機されている場合でも、`cacheSignal` によりまとめてキャンセルされる。

```tsx
import { cache, cacheSignal } from 'react';

const dedupedFetch = cache(fetch);

async function ComponentA() {
  return await dedupedFetch('/api/user', { signal: cacheSignal() });
}
```

## 実装チェックリスト

コンポーネントを実装する際に以下を確認する。

- [ ] サーバーへのリクエストを伴う操作を `startTransition` でラップしているか
- [ ] 楽観的更新が必要な操作に `useOptimistic` を使っているか
- [ ] データフェッチするコンポーネントを `<Suspense>` で囲んでいるか
- [ ] フォールバックUIがレイアウトを崩さないか
- [ ] 画面遷移・リスト変化に `ViewTransition` を適用しているか
- [ ] useEffect内でイベントリスナーを登録しているなら `useEffectEvent` を検討したか
- [ ] 条件付きレンダーでstateを保持したい場合に `<Activity>` を検討したか
- [ ] RSCの非同期フェッチに `cacheSignal` を付与しているか
