import { fingerButtonLabels, fingerLabels } from "./domain/keyboard";
import type { DisplayLanguage, FingerId } from "./domain/types";

type MessageKey =
  | "tabs.practice"
  | "tabs.words"
  | "tabs.settings"
  | "tabs.results"
  | "practice.progress"
  | "practice.remaining"
  | "practice.sessionProgress"
  | "practice.currentWord"
  | "practice.noWords"
  | "practice.pronounce"
  | "practice.countdown"
  | "practice.startNow"
  | "practice.keyboardMap"
  | "practice.keyboardHelp"
  | "practice.noKey"
  | "practice.fingerGuideTitle"
  | "practice.fingerGuideHelp"
  | "practice.noFinger"
  | "practice.feedback.ready"
  | "practice.feedback.incorrect"
  | "practice.feedback.incorrectWithKey"
  | "practice.feedback.default"
  | "practice.feedback.complete"
  | "practice.audio.generating"
  | "practice.audio.playing"
  | "practice.audio.error"
  | "practice.audio.fallback"
  | "practice.restart"
  | "practice.viewResults"
  | "practice.emptyTitle"
  | "practice.emptyCopy"
  | "practice.a11y.status.countdown"
  | "practice.a11y.status.active"
  | "practice.a11y.status.complete"
  | "practice.a11y.status.empty"
  | "practice.a11y.target"
  | "words.title"
  | "words.subtitle"
  | "words.placeholder"
  | "words.newWord"
  | "words.add"
  | "words.edit"
  | "words.save"
  | "words.cancel"
  | "words.delete"
  | "words.moveUp"
  | "words.moveDown"
  | "words.builtinTitle"
  | "words.customTitle"
  | "words.empty"
  | "words.error.invalid"
  | "words.error.duplicate"
  | "settings.title"
  | "settings.subtitle"
  | "settings.language"
  | "settings.wordsPerSession"
  | "settings.shuffle"
  | "settings.speech"
  | "settings.browserTts"
  | "settings.browserTtsHelp"
  | "settings.browserTtsClear"
  | "settings.browserTtsCacheCleared"
  | "settings.browserTtsCacheClearFailed"
  | "settings.browserTtsCachePolicy"
  | "settings.keyboardHint"
  | "settings.fingerGuide"
  | "settings.sessionGroup"
  | "settings.assistGroup"
  | "settings.pending"
  | "settings.synced"
  | "settings.sessionApplyHint"
  | "settings.assistApplyHint"
  | "settings.apply"
  | "settings.discard"
  | "results.title"
  | "results.subtitle"
  | "results.complete"
  | "results.wpm"
  | "results.accuracy"
  | "results.score"
  | "results.level"
  | "results.summary"
  | "results.feedbackTitle"
  | "results.feedbackSlowest"
  | "results.feedbackMostMistakes"
  | "results.feedbackCleanWords"
  | "results.feedbackNoMistakes"
  | "results.empty"
  | "results.mistakes"
  | "results.time"
  | "results.startNew"
  | "results.a11y.summary";

const messages: Record<DisplayLanguage, Record<MessageKey, string>> = {
  en: {
    "tabs.practice": "Practice",
    "tabs.words": "Words",
    "tabs.settings": "Settings",
    "tabs.results": "Results",
    "practice.progress": "Progress",
    "practice.remaining": "Remaining",
    "practice.sessionProgress": "Session progress",
    "practice.currentWord": "Current word",
    "practice.noWords": "No words available",
    "practice.pronounce": "Pronounce",
    "practice.countdown": "Start in",
    "practice.startNow": "Start now",
    "practice.keyboardMap": "Keyboard map",
    "practice.keyboardHelp": "Follow the highlighted key for the next letter.",
    "practice.noKey": "No key",
    "practice.fingerGuideTitle": "Finger guide",
    "practice.fingerGuideHelp": "Use the raised finger button as the recommended touch-typing finger.",
    "practice.noFinger": "No finger",
    "practice.feedback.ready": "Get ready. Press Enter or Start now to begin immediately.",
    "practice.feedback.incorrect": "Incorrect key. Keep aiming for the highlighted letter.",
    "practice.feedback.incorrectWithKey": "Wrong key: {key}. Keep aiming for the highlighted letter.",
    "practice.feedback.default": "Keep typing.",
    "practice.feedback.complete": "Session complete. Review your score or start another round.",
    "practice.audio.generating": "Generating browser audio for this word...",
    "practice.audio.playing": "Playing pronunciation...",
    "practice.audio.error": "Pronunciation was unavailable in this browser.",
    "practice.audio.fallback": "Browser audio was unavailable, so system pronunciation was used.",
    "practice.restart": "Restart session",
    "practice.viewResults": "View results",
    "practice.emptyTitle": "Practice words are not available.",
    "practice.emptyCopy": "Add a custom word or increase the session word count to continue.",
    "practice.a11y.status.countdown": "Typing will start in {count}.",
    "practice.a11y.status.active": "Typing is active.",
    "practice.a11y.status.complete": "Session complete. Results are ready.",
    "practice.a11y.status.empty": "No practice words are available.",
    "practice.a11y.target": "Current target letter {char}. Use key {key} with {finger}.",
    "words.title": "Custom vocabulary",
    "words.subtitle": "Add your own practice words",
    "words.placeholder": "Enter an English word",
    "words.newWord": "New word",
    "words.add": "Add word",
    "words.edit": "Edit",
    "words.save": "Save",
    "words.cancel": "Cancel",
    "words.delete": "Delete",
    "words.moveUp": "Move up",
    "words.moveDown": "Move down",
    "words.builtinTitle": "Built-in words",
    "words.customTitle": "Custom words",
    "words.empty": "No custom words yet.",
    "words.error.invalid": "Enter letters only.",
    "words.error.duplicate": "That word already exists.",
    "settings.title": "Session settings",
    "settings.subtitle": "Control practice conditions",
    "settings.language": "Display language",
    "settings.wordsPerSession": "Words per session",
    "settings.shuffle": "Shuffle words",
    "settings.speech": "Enable pronunciation",
    "settings.browserTts": "Use browser pronunciation (Experimental)",
    "settings.browserTtsHelp": "Generate and cache English audio in this browser when system voices are not enough.",
    "settings.browserTtsClear": "Clear browser audio cache",
    "settings.browserTtsCacheCleared": "Browser audio cache was cleared.",
    "settings.browserTtsCacheClearFailed": "Browser audio cache could not be cleared.",
    "settings.browserTtsCachePolicy": "Generated browser audio expires after 30 days of inactivity.",
    "settings.keyboardHint": "Show key position",
    "settings.fingerGuide": "Show finger guide",
    "settings.sessionGroup": "Session setup",
    "settings.assistGroup": "Visual assistance",
    "settings.pending": "You have unapplied changes. Start a new session to use them.",
    "settings.synced": "Current session already matches these settings.",
    "settings.sessionApplyHint": "These settings apply when you start a new session.",
    "settings.assistApplyHint": "These visual assistance settings apply immediately.",
    "settings.apply": "Apply and start new session",
    "settings.discard": "Discard changes",
    "results.title": "Session score",
    "results.subtitle": "Review your typing result",
    "results.complete": "Session complete. Nice finish.",
    "results.wpm": "WPM",
    "results.accuracy": "Accuracy",
    "results.score": "Score",
    "results.level": "Level",
    "results.summary": "Score blends speed and accuracy across the whole session.",
    "results.feedbackTitle": "Practice insights",
    "results.feedbackSlowest": "Slowest word: {word} ({time} ms)",
    "results.feedbackMostMistakes": "Most mistakes: {word} ({mistakes})",
    "results.feedbackCleanWords": "Clean words: {count} of {total}",
    "results.feedbackNoMistakes": "No mistakes this session. Push for more speed next round.",
    "results.empty": "No completed words yet.",
    "results.mistakes": "mistakes",
    "results.time": "time",
    "results.startNew": "Start new session",
    "results.a11y.summary": "Completed {count} words. WPM {wpm}. Accuracy {accuracy} percent. Score {score}. Level {level}."
  },
  ja: {
    "tabs.practice": "練習",
    "tabs.words": "単語",
    "tabs.settings": "設定",
    "tabs.results": "結果",
    "practice.progress": "進捗",
    "practice.remaining": "残り",
    "practice.sessionProgress": "セッション進捗",
    "practice.currentWord": "現在の単語",
    "practice.noWords": "単語がありません",
    "practice.pronounce": "発音",
    "practice.countdown": "開始まで",
    "practice.startNow": "今すぐ開始",
    "practice.keyboardMap": "キーボードマップ",
    "practice.keyboardHelp": "ハイライトされたキーが次に押す位置です。",
    "practice.noKey": "キーなし",
    "practice.fingerGuideTitle": "指ガイド",
    "practice.fingerGuideHelp": "浮き上がっている指ボタンが、次に使うおすすめの指です。",
    "practice.noFinger": "指なし",
    "practice.feedback.ready": "準備してください。Enter または今すぐ開始で始められます。",
    "practice.feedback.incorrect": "キーが違います。ハイライトされた文字をそのまま狙ってください。",
    "practice.feedback.incorrectWithKey": "誤って押したキー: {key}。ハイライトされた文字をそのまま狙ってください。",
    "practice.feedback.default": "そのまま入力を続けてください。",
    "practice.feedback.complete": "セッション完了です。スコアを確認するか、新しく始めてください。",
    "practice.audio.generating": "この単語のブラウザ音声を生成しています...",
    "practice.audio.playing": "発音を再生しています...",
    "practice.audio.error": "このブラウザでは発音を再生できませんでした。",
    "practice.audio.fallback": "ブラウザ音声を使えなかったため、システムの発音を使いました。",
    "practice.restart": "セッションをやり直す",
    "practice.viewResults": "結果を見る",
    "practice.emptyTitle": "練習できる単語がありません。",
    "practice.emptyCopy": "カスタム単語を追加するか、セッション単語数を見直してください。",
    "practice.a11y.status.countdown": "{count} 秒後に入力を開始できます。",
    "practice.a11y.status.active": "入力を受け付けています。",
    "practice.a11y.status.complete": "セッション完了です。結果を確認できます。",
    "practice.a11y.status.empty": "練習できる単語がありません。",
    "practice.a11y.target": "現在のターゲット文字は {char}。押すキーは {key}、推奨する指は {finger} です。",
    "words.title": "カスタム単語",
    "words.subtitle": "練習したい単語を追加できます",
    "words.placeholder": "英単語を入力",
    "words.newWord": "新しい単語",
    "words.add": "追加",
    "words.edit": "編集",
    "words.save": "保存",
    "words.cancel": "キャンセル",
    "words.delete": "削除",
    "words.moveUp": "上へ移動",
    "words.moveDown": "下へ移動",
    "words.builtinTitle": "標準単語",
    "words.customTitle": "カスタム単語",
    "words.empty": "カスタム単語はまだありません。",
    "words.error.invalid": "英字のみ入力してください。",
    "words.error.duplicate": "その単語はすでにあります。",
    "settings.title": "セッション設定",
    "settings.subtitle": "練習条件を調整できます",
    "settings.language": "表示言語",
    "settings.wordsPerSession": "1セッションの単語数",
    "settings.shuffle": "単語をシャッフル",
    "settings.speech": "発音を有効化",
    "settings.browserTts": "ブラウザ内発音を使う（実験中）",
    "settings.browserTtsHelp": "システム音声が足りない環境でも、このブラウザ内で英語音声を生成して保存します。",
    "settings.browserTtsClear": "ブラウザ音声キャッシュを削除",
    "settings.browserTtsCacheCleared": "ブラウザ音声キャッシュを削除しました。",
    "settings.browserTtsCacheClearFailed": "ブラウザ音声キャッシュを削除できませんでした。",
    "settings.browserTtsCachePolicy": "生成したブラウザ音声は 30 日間未使用で期限切れになります。",
    "settings.keyboardHint": "キー位置を表示",
    "settings.fingerGuide": "指ガイドを表示",
    "settings.sessionGroup": "セッション条件",
    "settings.assistGroup": "表示補助",
    "settings.pending": "未適用の変更があります。新しいセッションで反映されます。",
    "settings.synced": "現在のセッションはこの設定と一致しています。",
    "settings.sessionApplyHint": "この設定は新しいセッション開始時に反映されます。",
    "settings.assistApplyHint": "この表示補助設定はすぐに反映されます。",
    "settings.apply": "適用して新しいセッションを開始",
    "settings.discard": "変更を破棄",
    "results.title": "セッションスコア",
    "results.subtitle": "タイピング結果を確認",
    "results.complete": "セッション完了です。おつかれさまでした。",
    "results.wpm": "WPM",
    "results.accuracy": "正確さ",
    "results.score": "スコア",
    "results.level": "レベル",
    "results.summary": "スコアはセッション全体の速さと正確さをまとめて評価します。",
    "results.feedbackTitle": "練習の振り返り",
    "results.feedbackSlowest": "最も時間がかかった単語: {word} ({time} ms)",
    "results.feedbackMostMistakes": "最もミスが多かった単語: {word} ({mistakes})",
    "results.feedbackCleanWords": "ミスなしで終えた単語: {count} / {total}",
    "results.feedbackNoMistakes": "今回のセッションはノーミスです。次はスピードを伸ばせます。",
    "results.empty": "完了した単語はまだありません。",
    "results.mistakes": "ミス",
    "results.time": "時間",
    "results.startNew": "新しいセッションを開始",
    "results.a11y.summary": "{count} 単語を完了しました。WPM は {wpm}、正確さは {accuracy} パーセント、スコアは {score}、レベルは {level} です。"
  },
  "ja-hira": {
    "tabs.practice": "れんしゅう",
    "tabs.words": "たんご",
    "tabs.settings": "せってい",
    "tabs.results": "けっか",
    "practice.progress": "しんちょく",
    "practice.remaining": "のこり",
    "practice.sessionProgress": "セッションしんちょく",
    "practice.currentWord": "いまの たんご",
    "practice.noWords": "たんごが ありません",
    "practice.pronounce": "はつおん",
    "practice.countdown": "かいしまで",
    "practice.startNow": "いますぐ かいし",
    "practice.keyboardMap": "キーボードマップ",
    "practice.keyboardHelp": "ハイライトされたキーが つぎに おす いちです。",
    "practice.noKey": "キーなし",
    "practice.fingerGuideTitle": "ゆびガイド",
    "practice.fingerGuideHelp": "うきあがっている ゆびボタンが、つぎに つかう おすすめの ゆびです。",
    "practice.noFinger": "ゆびなし",
    "practice.feedback.ready": "じゅんびしてください。Enter または いますぐかいしで はじめられます。",
    "practice.feedback.incorrect": "キーが ちがいます。ハイライトされた もじを そのまま ねらってください。",
    "practice.feedback.incorrectWithKey": "あやまって おしたキー: {key}。ハイライトされた もじを そのまま ねらってください。",
    "practice.feedback.default": "そのまま にゅうりょくを つづけてください。",
    "practice.feedback.complete": "セッションかんりょうです。スコアを みるか、あたらしく はじめてください。",
    "practice.audio.generating": "この たんごの ブラウザおんせいを せいせいしています...",
    "practice.audio.playing": "はつおんを さいせいしています...",
    "practice.audio.error": "このブラウザでは はつおんを さいせいできませんでした。",
    "practice.audio.fallback": "ブラウザおんせいが つかえなかったため、システムの はつおんを つかいました。",
    "practice.restart": "セッションを やりなおす",
    "practice.viewResults": "けっかを みる",
    "practice.emptyTitle": "れんしゅうできる たんごが ありません。",
    "practice.emptyCopy": "カスタムたんごを ついかするか、セッションの たんごすうを みなおしてください。",
    "practice.a11y.status.countdown": "{count} びょうごに にゅうりょくを かいしできます。",
    "practice.a11y.status.active": "にゅうりょくを うけつけています。",
    "practice.a11y.status.complete": "セッションかんりょうです。けっかを かくにんできます。",
    "practice.a11y.status.empty": "れんしゅうできる たんごが ありません。",
    "practice.a11y.target": "いまの ターゲットもじは {char}。おすキーは {key}、おすすめの ゆびは {finger} です。",
    "words.title": "カスタムたんご",
    "words.subtitle": "れんしゅうしたい たんごを ついかできます",
    "words.placeholder": "えいたんごを にゅうりょく",
    "words.newWord": "あたらしい たんご",
    "words.add": "ついか",
    "words.edit": "へんしゅう",
    "words.save": "ほぞん",
    "words.cancel": "キャンセル",
    "words.delete": "さくじょ",
    "words.moveUp": "うえへ いどう",
    "words.moveDown": "したへ いどう",
    "words.builtinTitle": "はじめからある たんご",
    "words.customTitle": "カスタムたんご",
    "words.empty": "カスタムたんごは まだ ありません。",
    "words.error.invalid": "えいじのみ にゅうりょくしてください。",
    "words.error.duplicate": "その たんごは すでに あります。",
    "settings.title": "セッションせってい",
    "settings.subtitle": "れんしゅう じょうけんを ちょうせいできます",
    "settings.language": "ひょうじ げんご",
    "settings.wordsPerSession": "1せっしょんの たんごすう",
    "settings.shuffle": "たんごを シャッフル",
    "settings.speech": "はつおんを ゆうこうか",
    "settings.browserTts": "ブラウザないはつおんを つかう（じっけんちゅう）",
    "settings.browserTtsHelp": "システムおんせいが たりない かんきょうでも、このブラウザないで えいごおんせいを つくって ほぞんします。",
    "settings.browserTtsClear": "ブラウザおんせいキャッシュを さくじょ",
    "settings.browserTtsCacheCleared": "ブラウザおんせいキャッシュを さくじょしました。",
    "settings.browserTtsCacheClearFailed": "ブラウザおんせいキャッシュを さくじょできませんでした。",
    "settings.browserTtsCachePolicy": "せいせいした ブラウザおんせいは 30にちかん みしようで きげんぎれに なります。",
    "settings.keyboardHint": "キーいちを ひょうじ",
    "settings.fingerGuide": "ゆびガイドを ひょうじ",
    "settings.sessionGroup": "セッションじょうけん",
    "settings.assistGroup": "ひょうじ ほじょ",
    "settings.pending": "みてきようの へんこうが あります。あたらしい セッションで はんえいされます。",
    "settings.synced": "いまの セッションは このせっていと いっちしています。",
    "settings.sessionApplyHint": "このせっていは あたらしい セッションかいしじに はんえいされます。",
    "settings.assistApplyHint": "この ひょうじほじょせっていは すぐに はんえいされます。",
    "settings.apply": "てきようして あたらしい セッションを かいし",
    "settings.discard": "へんこうを はき",
    "results.title": "セッションスコア",
    "results.subtitle": "タイピングけっかを かくにん",
    "results.complete": "セッションかんりょうです。おつかれさまでした。",
    "results.wpm": "WPM",
    "results.accuracy": "せいかくさ",
    "results.score": "スコア",
    "results.level": "レベル",
    "results.summary": "スコアは セッションぜんたいの はやさと せいかくさを まとめて ひょうかします。",
    "results.feedbackTitle": "れんしゅうの ふりかえり",
    "results.feedbackSlowest": "もっとも じかんが かかった たんご: {word} ({time} ms)",
    "results.feedbackMostMistakes": "もっとも ミスが おおかった たんご: {word} ({mistakes})",
    "results.feedbackCleanWords": "ミスなしで おえた たんご: {count} / {total}",
    "results.feedbackNoMistakes": "こんかいの セッションは ノーミスです。つぎは スピードを のばせます。",
    "results.empty": "かんりょうした たんごは まだ ありません。",
    "results.mistakes": "ミス",
    "results.time": "じかん",
    "results.startNew": "あたらしい セッションを かいし",
    "results.a11y.summary": "{count} たんごを かんりょうしました。WPM は {wpm}、せいかくさは {accuracy} パーセント、スコアは {score}、レベルは {level} です。"
  }
};

export const displayLanguageOptions: Array<{ value: DisplayLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ja-hira", label: "にほんご" }
];

export function t(language: DisplayLanguage, key: MessageKey): string {
  return messages[language][key];
}

export function getFingerLabel(language: DisplayLanguage, fingerId: FingerId, fallback: string): string {
  if (language === "en") {
    return fallback;
  }

  return fingerLabels[language][fingerId];
}

export function getFingerButtonLabel(language: DisplayLanguage, fingerId: FingerId): string {
  return fingerButtonLabels[language][fingerId];
}
