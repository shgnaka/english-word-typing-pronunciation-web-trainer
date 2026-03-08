import { fingerButtonLabels, fingerLabels } from "./domain/keyboard";
import type { DisplayLanguage, FingerId } from "./domain/types";

type MessageKey =
  | "hero.title"
  | "hero.copy"
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
  | "practice.restart"
  | "practice.viewResults"
  | "practice.emptyTitle"
  | "practice.emptyCopy"
  | "words.title"
  | "words.subtitle"
  | "words.placeholder"
  | "words.newWord"
  | "words.add"
  | "words.empty"
  | "words.error.invalid"
  | "words.error.duplicate"
  | "settings.title"
  | "settings.subtitle"
  | "settings.language"
  | "settings.wordsPerSession"
  | "settings.shuffle"
  | "settings.speech"
  | "settings.keyboardHint"
  | "settings.fingerGuide"
  | "settings.sessionGroup"
  | "settings.assistGroup"
  | "settings.pending"
  | "settings.synced"
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
  | "results.empty"
  | "results.mistakes"
  | "results.time"
  | "results.startNew";

const messages: Record<DisplayLanguage, Record<MessageKey, string>> = {
  en: {
    "hero.title": "English typing with pronunciation and finger guidance.",
    "hero.copy": "Practice one word at a time, hear the pronunciation, and follow the next-key hint on a US QWERTY layout.",
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
    "practice.feedback.default": "Type on your keyboard to progress.",
    "practice.feedback.complete": "Session complete. Review your score or start another round.",
    "practice.restart": "Restart session",
    "practice.viewResults": "View results",
    "practice.emptyTitle": "Practice words are not available.",
    "practice.emptyCopy": "Add a custom word or increase the session word count to continue.",
    "words.title": "Custom vocabulary",
    "words.subtitle": "Add your own practice words",
    "words.placeholder": "Enter an English word",
    "words.newWord": "New word",
    "words.add": "Add word",
    "words.empty": "No custom words yet.",
    "words.error.invalid": "Enter letters only.",
    "words.error.duplicate": "That word already exists.",
    "settings.title": "Session settings",
    "settings.subtitle": "Control practice conditions",
    "settings.language": "Display language",
    "settings.wordsPerSession": "Words per session",
    "settings.shuffle": "Shuffle words",
    "settings.speech": "Enable pronunciation",
    "settings.keyboardHint": "Show key position",
    "settings.fingerGuide": "Show finger guide",
    "settings.sessionGroup": "Session setup",
    "settings.assistGroup": "Visual assistance",
    "settings.pending": "You have unapplied changes. Start a new session to use them.",
    "settings.synced": "Current session already matches these settings.",
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
    "results.empty": "No completed words yet.",
    "results.mistakes": "mistakes",
    "results.time": "time",
    "results.startNew": "Start new session"
  },
  ja: {
    "hero.title": "発音と指ガイド付きで英語タイピングを練習できます。",
    "hero.copy": "単語を1語ずつ練習し、発音を聞きながら、US QWERTY 配列の次キーガイドを確認できます。",
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
    "practice.feedback.default": "キーボードを打って進めてください。",
    "practice.feedback.complete": "セッション完了です。スコアを確認するか、新しく始めてください。",
    "practice.restart": "セッションをやり直す",
    "practice.viewResults": "結果を見る",
    "practice.emptyTitle": "練習できる単語がありません。",
    "practice.emptyCopy": "カスタム単語を追加するか、セッション単語数を見直してください。",
    "words.title": "カスタム単語",
    "words.subtitle": "練習したい単語を追加できます",
    "words.placeholder": "英単語を入力",
    "words.newWord": "新しい単語",
    "words.add": "追加",
    "words.empty": "カスタム単語はまだありません。",
    "words.error.invalid": "英字のみ入力してください。",
    "words.error.duplicate": "その単語はすでにあります。",
    "settings.title": "セッション設定",
    "settings.subtitle": "練習条件を調整できます",
    "settings.language": "表示言語",
    "settings.wordsPerSession": "1セッションの単語数",
    "settings.shuffle": "単語をシャッフル",
    "settings.speech": "発音を有効化",
    "settings.keyboardHint": "キー位置を表示",
    "settings.fingerGuide": "指ガイドを表示",
    "settings.sessionGroup": "セッション条件",
    "settings.assistGroup": "表示補助",
    "settings.pending": "未適用の変更があります。新しいセッションで反映されます。",
    "settings.synced": "現在のセッションはこの設定と一致しています。",
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
    "results.empty": "完了した単語はまだありません。",
    "results.mistakes": "ミス",
    "results.time": "時間",
    "results.startNew": "新しいセッションを開始"
  },
  "ja-hira": {
    "hero.title": "はつおんと ゆびガイドつきで えいごタイピングを れんしゅうできます。",
    "hero.copy": "たんごを 1ごずつ れんしゅうし、はつおんを ききながら、US QWERTY はいれつの つぎキー ガイドを かくにんできます。",
    "tabs.practice": "れんしゅう",
    "tabs.words": "たんご",
    "tabs.settings": "せってい",
    "tabs.results": "けっか",
    "practice.progress": "しんちょく",
    "practice.remaining": "のこり",
    "practice.sessionProgress": "セッション しんちょく",
    "practice.currentWord": "いまの たんご",
    "practice.noWords": "たんごが ありません",
    "practice.pronounce": "はつおん",
    "practice.countdown": "かいしまで",
    "practice.startNow": "いますぐ かいし",
    "practice.keyboardMap": "キーボード マップ",
    "practice.keyboardHelp": "ハイライトされた キーが つぎに おす いちです。",
    "practice.noKey": "キーなし",
    "practice.fingerGuideTitle": "ゆび ガイド",
    "practice.fingerGuideHelp": "うきあがっている ゆびボタンが、つぎに つかう おすすめの ゆびです。",
    "practice.noFinger": "ゆびなし",
    "practice.feedback.ready": "じゅんびしてください。Enter または いますぐ かいしで はじめられます。",
    "practice.feedback.incorrect": "キーが ちがいます。ハイライトされた もじを そのまま ねらってください。",
    "practice.feedback.incorrectWithKey": "あやまって おした キー: {key}。ハイライトされた もじを そのまま ねらってください。",
    "practice.feedback.default": "キーボードを うって すすめてください。",
    "practice.feedback.complete": "セッション かんりょうです。スコアを みるか、あたらしく はじめてください。",
    "practice.restart": "セッションを やりなおす",
    "practice.viewResults": "けっかを みる",
    "practice.emptyTitle": "れんしゅうできる たんごが ありません。",
    "practice.emptyCopy": "カスタムたんごを ついかするか、セッションの たんごすうを みなおしてください。",
    "words.title": "カスタム たんご",
    "words.subtitle": "れんしゅうしたい たんごを ついかできます",
    "words.placeholder": "えいたんごを にゅうりょく",
    "words.newWord": "あたらしい たんご",
    "words.add": "ついか",
    "words.empty": "かすたむ たんごは まだ ありません。",
    "words.error.invalid": "えいじのみ にゅうりょくしてください。",
    "words.error.duplicate": "その たんごは すでに あります。",
    "settings.title": "セッション せってい",
    "settings.subtitle": "れんしゅう じょうけんを ちょうせいできます",
    "settings.language": "ひょうじ げんご",
    "settings.wordsPerSession": "1せっしょんの たんごすう",
    "settings.shuffle": "たんごを シャッフル",
    "settings.speech": "はつおんを ゆうこうか",
    "settings.keyboardHint": "キーいちを ひょうじ",
    "settings.fingerGuide": "ゆびガイドを ひょうじ",
    "settings.sessionGroup": "セッション じょうけん",
    "settings.assistGroup": "ひょうじ ほじょ",
    "settings.pending": "みてきようの へんこうが あります。あたらしい セッションで はんえいされます。",
    "settings.synced": "いまの セッションは この せっていと いっちしています。",
    "settings.apply": "てきようして あたらしい セッションを かいし",
    "settings.discard": "へんこうを はき",
    "results.title": "セッション スコア",
    "results.subtitle": "タイピング けっかを かくにん",
    "results.complete": "セッション かんりょうです。おつかれさまでした。",
    "results.wpm": "WPM",
    "results.accuracy": "せいかくさ",
    "results.score": "スコア",
    "results.level": "レベル",
    "results.summary": "スコアは セッションぜんたいの はやさと せいかくさを まとめて ひょうかします。",
    "results.empty": "かんりょうした たんごは まだ ありません。",
    "results.mistakes": "みす",
    "results.time": "じかん",
    "results.startNew": "あたらしい セッションを かいし"
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
