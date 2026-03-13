# Reading Katakana Generator MVP Status

最終更新: 2026-03-13

この文書は、英単語の読み方をカタカナで補助表示する MVP 実装について、

- いま何ができているか
- まだ未達成のことは何か
- 次にどこを伸ばすと効果が高いか

を整理して残すための現状メモです。

`docs/implementation-spec.md` のような固定仕様ではなく、改善を進めるための開発メモとして扱います。

## Summary

現在の読み方生成は、`設定トグル + 例外辞書 + 簡易 grapheme/phoneme/mora パイプライン` で動く最小版です。

目的は、辞書品質の発音再現ではなく、

- 練習中に読み方が分からなくなったときの補助になること
- 典型語で大きく破綻しにくいこと
- 後から規則や例外を足しやすいこと

に置いています。

## Current Scope

現在の実装範囲は次の通りです。

- Settings 画面に `英単語の読み方を表示` トグルがある
- このトグルは即時反映・`localStorage` 保存される
- Practice 画面で、現在単語の上にカタカナ読みを表示できる
- 読み方生成は `src/domain/reading/` の段階分割ロジックで行う
- 例外辞書ヒット語は辞書値を優先する
- 規則変換語は `normalize -> grapheme -> phoneme -> mora -> katakana` の順で生成する
- `confidence === "low"` は表示しない

主な実装箇所:

- `src/components/SettingsPanel.tsx`
- `src/components/PracticePanel.tsx`
- `src/domain/reading/`
- `src/infra/storage.ts`

## What Works Now

### 1. UI と保存まわり

- `showWordReading` を `SessionConfig` に持っている
- 即時反映設定として保存・復元できる
- 既存の `showKeyboardHint` / `showFingerGuide` と同じ運用になっている

### 2. 読み方生成パイプライン

段階分割された関数があるため、処理の見通しは比較的よいです。

- `normalizeReadingInput`
- `lookupReadingException`
- `tokenizeGraphemes`
- `graphemesToPhonemes`
- `phonemesToMoras`
- `morasToKatakana`
- `convertWordToKatakana`
- `generateReadingHint`

### 3. 例外辞書

少数ですが、MVP で外しやすい語を例外辞書で救済しています。

例:

- `apple -> アップル`
- `hello -> ハロー`
- `computer -> コンピューター`
- `phone -> フォーン`
- `language -> ランゲージ`
- `one -> ワン`
- `queue -> キュー`

### 4. 最小限の規則変換

以下のような基本ルールは入っています。

- 最長一致 grapheme 分解
  - `tion`, `sion`, `igh`, `sh`, `ch`, `th`, `ph`, `wh`, `ck`, `ng`
  - `ee`, `oo`, `oa`, `ai`, `ay`, `ea`, `ou`, `ow`, `oi`, `oy`
  - `ar`, `er`, `ir`, `or`, `ur`, `qu`
- 文脈依存の一部処理
  - `c + e/i/y -> S`
  - `g + e/i/y -> J`
  - 語末 `silent e`
  - `aCe`, `iCe`, `oCe`, `uCe` の長母音化
- 日本語モーラ化
  - 基本子音行
  - `SH`, `CH`, `KW`
  - 一部の語末子音と促音

### 5. テストの土台

以下があるため、今後の改善時に回帰を見やすい状態です。

- パイプライン単体テスト
- 設定トグルの永続化テスト
- Practice 画面の表示テスト

## Known Gaps

### 1. 発音精度はまだ MVP 水準

いちばん大きい未達成事項です。

- 英語発音の厳密再現はしていない
- schwa を扱っていない
- 強勢を扱っていない
- `th` の /θ/ /ð/ を区別していない
- `ea`, `ow`, `ou`, `gh` などの曖昧パターンはまだ粗い
- 固有名詞や不規則語には弱い

### 2. 慣用カタカナ表記とのズレ

今の実装は「読み補助」を優先しており、一般的な外来語表記と一致しない場合があります。

例:

- `phone` は辞書で寄せているが、規則側だけでは表記がぶれやすい
- `strike` のような子音連続はまだ雑な補母音に頼る部分がある
- `computer` のような実用語は例外辞書前提になっている

### 3. confidence 判定がまだ粗い

現状の `high / medium / low` は簡易的です。

- 曖昧 grapheme 数ベースで大まかに落としている
- 「不自然だから隠す」精度はまだ高くない
- 本来は段階ごとの失敗理由を持った方が改善しやすい

### 4. 例外辞書の運用フローはまだ人手依存

運用としては正しい方向ですが、まだルール化が文書レベルで止まっています。

- 外れた単語をどう追加するか
- 規則で直すか辞書で直すか
- どの単語を優先救済するか

が、今後の改善で重要になります。

### 5. デバッグ支援はまだコード内止まり

パイプライン自体は段階分割されていますが、UI 上で

- 正規化結果
- grapheme 列
- phoneme 列
- mora 列

を確認する仕組みはまだありません。

## High-Leverage Areas

次に精度を上げるなら、効果が大きい順にこのあたりです。

### 1. 例外辞書の拡充

もっとも即効性があります。

優先候補:

- 内蔵 `defaultWords`
- アプリでよく練習される語
- カタカナ表示を見て違和感が強い語

おすすめ運用:

1. 外れた単語をテストに追加する
2. 規則で安全に直せるか考える
3. 副作用が大きければ例外辞書へ入れる

### 2. 長母音・silent e 周辺の強化

MVP でも改善効果が大きい領域です。

- `aCe`, `iCe`, `oCe`, `uCe`
- `ee`, `ea`, `oa`, `oo`
- 語末 `r` を含む長音化

ここを伸ばすと、典型語の見た目がかなり改善します。

### 3. 子音連続のモーラ化改善

`strike`, `school`, `smart`, `spring` 系の品質に効きます。

- `s + t/p/k`
- `tr`, `dr`
- 語頭の 2 子音 / 3 子音クラスタ
- 語末閉鎖音の促音化

### 4. confidence 判定の精密化

表示品質を上げるうえでかなり重要です。

改善候補:

- 未知 grapheme を検出する
- 無理な補母音の多さを評価する
- katakana 長さと phoneme 長さの比を見る
- `reasons` を内部保持して low 判定の根拠を残す

### 5. 評価ベンチの導入

将来 `english2kana` を比較用ベンチに使う方針は有効です。

用途:

- 内蔵単語リストでの出力比較
- 例外辞書追加前後の比較
- 自作規則の改善度を定量化する基準

ただし、本番ロジックとして直接組み込む前提ではなく、評価用に留めるのが現実的です。

## Suggested Improvement Loop

読み方生成の改善フローは、次の形に固定するのがよさそうです。

1. 外れた単語を見つける
2. 期待カタカナを決めてテストに追加する
3. 規則で安全に直せるか確認する
4. 安全なら規則修正、危険なら例外辞書追加
5. App テストと単体テストを通す

このフローにすると、

- 例外辞書の肥大化
- ルール修正の副作用
- 直したつもりで別の語を壊すこと

を追いやすくなります。

## Not Yet Ready For

現時点では、次の期待を置くのはまだ早いです。

- 辞書品質の発音表記
- IPA や ARPABET 相当の精度
- 慣用外来語表記への高一致率
- 固有名詞の安定変換
- 英語学習教材としての厳密なフォニックス説明

## Recommendation For Documentation Placement

この内容は、現時点では `docs/implementation-spec.md` に直接混ぜず、

- `docs/reading-katakana-generator-mvp-status.md`

のような独立メモに置くのが適切です。

理由:

- まだ実験的で変更が多い
- 精度改善の途中経過を残したい
- 固定仕様と開発メモを分けた方が読みやすい

将来、挙動が安定してきたら以下を `implementation-spec` へ昇格させるとよいです。

- UI 上の表示条件
- `showWordReading` の保存仕様
- low confidence 非表示ルール
- 例外辞書優先の基本方針

## Related Files

- `src/domain/reading/`
- `src/components/PracticePanel.tsx`
- `src/components/SettingsPanel.tsx`
- `src/domain/types.ts`
- `src/infra/storage.ts`
- `src/domain/reading.test.ts`
- `src/App.test.tsx`
