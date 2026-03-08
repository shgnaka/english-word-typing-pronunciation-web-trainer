# WordBeat Trainer Implementation Spec

最終更新: 2026-03-09

この文書は、構想メモではなく「現在の実装がどう振る舞うべきか」を固定するための実装同期用仕様です。
変更時は、コードとこの文書を同じ PR で更新することを前提にします。

## 1. 画面と主要フロー

アプリには次の 4 画面がある。

- Practice
- Words
- Settings
- Results

初期表示は `Practice` で、`defaultWords + customWords` をもとにセッションキューを生成する。
`Words` 画面では `defaultWords` と `customWords` を分けて表示する。

### 1.1 初期化フロー

1. `localStorage` から `customWords`、`sessionConfig`、`displayLanguage` を読み込む
2. `defaultWords` と `customWords` を結合し、重複除去する
3. `wordCount` と `shuffle` に従ってセッションキューを生成する
4. キューから `TypingSessionState` を初期化する
5. キューが空でなければ `countdown = 3`、空なら `countdown = 0`

補足:

- `defaultWords` は初心者向けに、短くて身近な語から長めの語へ進む並びを採用する
- 現在の先頭単語は `apple`

### 1.2 練習フロー

1. `screen === "practice"` かつ `countdown > 0` の間はカウントダウン状態
2. カウントダウン中は毎秒 `countdown` を 1 減らす
3. カウントダウン中に `Enter` または `Start now` を押すと `countdown = 0`
4. `countdown === 0` になったら入力受付状態に入る
5. 正しい英字キー入力で `charIndex` を進める
6. 誤入力時は `mistakes` と `keystrokes` を増やし、進行は止める
7. 単語の最後の文字を正しく入力したら `TypingResult` を追加し、次単語へ進む
8. キューを使い切ったら `session.isComplete = true` とし、自動で `Results` 画面へ遷移する

## 2. セッション状態遷移

`TypingSessionState` の主要状態は次の通り。

| 状態 | 条件 | 説明 |
| --- | --- | --- |
| Empty | `currentWord === null && isComplete === true` | 練習対象が存在しない |
| Countdown | `screen === "practice" && countdown > 0 && currentWord !== null` | 練習開始前 |
| Active | `screen === "practice" && countdown === 0 && currentWord !== null && isComplete === false` | 入力受付中 |
| Complete | `isComplete === true && completedWords.length > 0` | セッション完了 |

### 2.1 入力イベントごとの挙動

| イベント | 前提 | 結果 |
| --- | --- | --- |
| 英字以外のキー入力 | `Active` | 状態は変わらない |
| 正しい英字入力 | `Active` | `keystrokes += 1`, `lastInputCorrect = true`, `lastMistypedKey = null` |
| 誤った英字入力 | `Active` | `keystrokes += 1`, `mistakes += 1`, `lastInputCorrect = false`, `lastMistypedKey = key` |
| 単語完了 | `Active` | `TypingResult` を追加し、次単語へ遷移または完了 |
| `Enter` | `Countdown` | カウントダウンをスキップ |

### 2.2 例外・補正

- 英字判定は `/^[a-z]$/` に一致するキーのみを受け付ける
- `wordCount` は `1..20` に丸める
- 練習語彙が 0 件のとき、Practice 画面は empty state を表示する

## 3. スコア仕様

スコア計算は `src/domain/scoring.ts` に従う。

- `completedChars = sum(result.word.length)`
- `minutes = totalElapsedMs / 60000`。ただし `totalElapsedMs <= 0` の場合は `1`
- `grossWpm = completedChars / 5 / minutes`
- `accuracy = ((totalKeystrokes - totalMistakes) / totalKeystrokes) * 100`
- `rawScore = grossWpm * (accuracy / 100)`
- `wpm`, `accuracy`, `rawScore` は小数第 1 位で四捨五入

### 3.1 レベル閾値

| rawScore | level |
| --- | --- |
| `>= 55` | Expert |
| `>= 40` | Advanced |
| `>= 25` | Skilled |
| `>= 12` | Building |
| `< 12` | Starter |

### 3.2 代表ケース

| ケース | words | elapsedMs | keystrokes | mistakes | wpm | accuracy | rawScore | level |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | `apple` | 60000 | 5 | 0 | 1 | 100 | 1 | Starter |
| 2 | `apple` | 12000 | 5 | 0 | 5 | 100 | 5 | Starter |
| 3 | `apple` | 6000 | 5 | 0 | 10 | 100 | 10 | Starter |
| 4 | `apple` | 5000 | 5 | 0 | 12 | 100 | 12 | Building |
| 5 | `apple` | 2400 | 5 | 0 | 25 | 100 | 25 | Skilled |
| 6 | `apple` | 1500 | 5 | 0 | 40 | 100 | 40 | Advanced |
| 7 | `apple` | 1091 | 5 | 0 | 55 | 100 | 55 | Expert |
| 8 | `apple` | 5000 | 6 | 1 | 12 | 83.3 | 10 | Starter |
| 9 | `apple` | 2500 | 6 | 1 | 24 | 83.3 | 20 | Building |
| 10 | `apple` + `banana` | 6000 | 11 | 1 | 22 | 90.9 | 20 | Building |

注記:

- ケース 8 の `rawScore` は `12 * 0.833... = 10.0`
- ケース 10 の `completedChars` は `11`

## 4. 発音仕様

発音処理は `src/infra/speech.ts` と `src/infra/browserTts.ts` に従う。

### 4.1 基本ルール

- 単語が空文字なら何もしない
- `speechEnabled === false` のとき、UI からの発音操作は無効
- `browserTtsEnabled === false` または Browser TTS 非対応環境では `speechSynthesis` を使う
- 自動発音は `Practice` 画面で `countdown === 0` になり、`currentWord` があるときに発火する
- 同一単語・同一位置での自動発音は 1 回だけ行う

### 4.2 自動発音と手動発音

| トリガー | Browser TTS キャッシュあり | Browser TTS キャッシュなし | Browser TTS 失敗 |
| --- | --- | --- | --- |
| auto | キャッシュ再生 | 生成をキュー投入しつつ `speechSynthesis` にフォールバック | `speechSynthesis` にフォールバック |
| manual | キャッシュ再生 | その場で生成を試み、成功時は生成音声を再生 | `speechSynthesis` にフォールバック |

### 4.3 手動発音時の UI 状態

`pronunciationStatus` は次の値を取る。

- `idle`
- `generating`
- `playing`
- `fallback`
- `error`

遷移ルール:

1. 手動発音開始時、Browser TTS 有効かつキャッシュ未生成なら `generating`
2. Browser TTS キャッシュ済み、または Browser TTS 無効時の手動発音開始では `playing`
3. 手動発音後、Browser TTS ではなく `speech-synthesis` が使われたら `fallback`
4. 手動発音 backend がどちらも使えない場合は `error`
5. それ以外の手動発音完了後は `idle`
6. `currentWord` が変わったら `idle` に戻す

### 4.4 Browser TTS キャッシュ運用

- Browser TTS キャッシュは IndexedDB を使う
- キャッシュ済み音声には `createdAt` を保存する
- 30 日より古いキャッシュは期限切れとして扱い、参照時または事前生成時に削除する
- Settings 画面から Browser TTS キャッシュを手動削除できる

## 5. 設定保存仕様

保存対象:

- `customWords`
- `sessionConfig`
- `displayLanguage`

保存先はすべて `localStorage`。

### 5.1 保存フォーマット

- `customWords` と `sessionConfig` は `{ version: 1, value: ... }` 形式で保存する
- 旧形式の生配列・生オブジェクトも読み込み可能とし、読み込み時に新形式へ migrate する

### 5.2 反映ルール

- `displayLanguage` は即時反映して保存する
- `showKeyboardHint` と `showFingerGuide` は即時反映して保存する
- `wordCount`, `shuffle`, `speechEnabled`, `browserTtsEnabled` は `draftConfig` に対して編集し、`Apply` 時に保存する
- `Apply` 後は新しいセッションを開始する
- `Discard` は `draftConfig` を現在の `config` に戻す

## 6. 画面別受け入れ条件

### 6.1 Practice

- 現在単語を 1 文字ずつ表示する
- 次に入力すべき文字だけを target 表示する
- カウントダウン中は開始前の案内を表示する
- 誤入力時は feedback、target 文字、キーボードガイド、指ガイドに誤り状態を反映する
- セッション完了時は結果画面へ遷移する

### 6.2 Words

- `defaultWords` と `customWords` を別セクションで表示する
- `defaultWords` は閲覧専用で表示する
- 英字のみの単語を追加できる
- 重複単語は拒否する
- `customWords` は編集できる
- `customWords` は削除できる
- `customWords` は上下移動で並び替えできる
- `customWords` の並び順は再読み込み後も維持される

### 6.3 Settings

- 表示言語は即時反映される
- 補助表示設定は即時反映される
- 単語数、shuffle、speech、browser TTS の変更だけが pending 扱いになる
- `Apply` 後に新しいセッションが開始される
- `wordCount` は常に `1..20` に補正される
- Browser TTS キャッシュは手動削除できる

### 6.4 Results

- `WPM`, `Accuracy`, `Score`, `Level` を表示する
- 結果画面に学習フィードバックを表示する
  フィードバック内容は、最も時間がかかった単語、最もミスが多かった単語またはノーミス案内、ミスなしで完了した単語数
- 完了単語ごとの `elapsedMs` と `mistakes` を表示する
- 完了語がなければ empty state を表示する

## 7. テスト対応

現時点の最低限の対応関係は次の通り。

| 領域 | 主な担保手段 |
| --- | --- |
| セッション進行 | `src/domain/session.test.ts`, `src/App.test.tsx`, `tests/e2e/app.spec.ts` |
| スコア表示 | `src/domain/scoring.test.ts`, `src/App.test.tsx`, `tests/e2e/app.spec.ts` |
| 発音フォールバック | `src/infra/speech.test.ts`, `src/App.test.tsx` |
| Browser TTS キャッシュ方針 | `src/infra/browserTts.test.ts`, `src/App.test.tsx` |
| 設定保存と反映 | `src/infra/storage.test.ts`, `src/App.test.tsx`, `tests/e2e/app.spec.ts` |
| 単語管理 | `src/App.test.tsx` |

不足しているもの:

- アクセシビリティ要件の直接テスト強化
- `useTrainer` 分割後のロジック単位テスト
- built-in / custom words 混在時の E2E テスト強化
