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
  | "practice.stepHintLabel"
  | "practice.stepHint.countdown"
  | "practice.stepHint.active"
  | "practice.stepHint.incorrect"
  | "practice.stepHint.complete"
  | "practice.stepHint.empty"
  | "practice.a11y.status.countdown"
  | "practice.a11y.status.active"
  | "practice.a11y.status.complete"
  | "practice.a11y.status.empty"
  | "practice.a11y.target"
  | "words.title"
  | "words.subtitle"
  | "words.collectionLabel"
  | "words.collectionTitle"
  | "words.addHint"
  | "words.manageHint"
  | "words.jumpToActive"
  | "words.placeholder"
  | "words.newWord"
  | "words.add"
  | "words.addRules"
  | "words.searchLabel"
  | "words.searchPlaceholder"
  | "words.clearSearch"
  | "words.sortAlpha"
  | "words.sortNewest"
  | "words.sortOldest"
  | "words.selectWord"
  | "words.selectVisible"
  | "words.deselectVisible"
  | "words.clearSelection"
  | "words.moreActions"
  | "words.inputPreview"
  | "words.inputDuplicate"
  | "words.inputInvalidPreview"
  | "words.selectedCount"
  | "words.bulkHint"
  | "words.bulkRemoveFromPractice"
  | "words.bulkRestore"
  | "words.bulkDelete"
  | "words.bulkDeleteConfirm"
  | "words.edit"
  | "words.save"
  | "words.cancel"
  | "words.delete"
  | "words.moveUp"
  | "words.moveDown"
  | "words.moveToTop"
  | "words.moveToBottom"
  | "words.reorderSaved"
  | "words.builtinTitle"
  | "words.builtinHint"
  | "words.activeTitle"
  | "words.activeHint"
  | "words.sourceBuiltin"
  | "words.sourceCustom"
  | "words.builtinEdited"
  | "words.stateActive"
  | "words.stateHidden"
  | "words.stateLocalOnly"
  | "words.hiddenBuiltinTitle"
  | "words.hiddenBuiltinEmpty"
  | "words.restore"
  | "words.resetBuiltin"
  | "words.customTitle"
  | "words.customHint"
  | "words.inactiveCustomTitle"
  | "words.inactiveCustomHint"
  | "words.inactiveCustomEmpty"
  | "words.removeFromPractice"
  | "words.empty"
  | "words.noMatches"
  | "words.searchEmptyAction"
  | "words.emptyCustomAction"
  | "words.hiddenBuiltinAction"
  | "words.hiddenCustomAction"
  | "words.emptyCustomCta"
  | "words.hiddenBuiltinCta"
  | "words.hiddenCustomCta"
  | "words.stats.available"
  | "words.stats.builtin"
  | "words.stats.custom"
  | "words.stats.hidden"
  | "words.stats.hiddenTotal"
  | "words.minimizeSection"
  | "words.expandSection"
  | "words.minimizedSummary"
  | "words.builtinMinimizedSummary"
  | "words.customMinimizedSummary"
  | "words.hiddenBuiltinMinimizedSummary"
  | "words.hiddenCustomMinimizedSummary"
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
  | "settings.immediateGroup"
  | "settings.nextSessionGroup"
  | "settings.audioToolsGroup"
  | "settings.appliesNow"
  | "settings.appliesOnApply"
  | "settings.pendingSummaryLabel"
  | "settings.valueOn"
  | "settings.valueOff"
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
  | "results.coachingStrength"
  | "results.coachingFocus"
  | "results.feedbackSlowest"
  | "results.feedbackMostMistakes"
  | "results.feedbackCleanWords"
  | "results.feedbackNoMistakes"
  | "results.empty"
  | "results.mistakes"
  | "results.time"
  | "results.startNew"
  | "results.retryFocused"
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
    "practice.stepHintLabel": "Next step",
    "practice.stepHint.countdown": "Watch the highlighted letter, then start typing as soon as the countdown ends.",
    "practice.stepHint.active": "Type the highlighted letter. Use Pronounce or the guides if you need help.",
    "practice.stepHint.incorrect": "Ignore the last key and press the highlighted letter to get back on track.",
    "practice.stepHint.complete": "Open Results to review this round, or restart to practice again right away.",
    "practice.stepHint.empty": "Open Words to add a custom word, or adjust Words per session in Settings.",
    "practice.a11y.status.countdown": "Typing will start in {count}.",
    "practice.a11y.status.active": "Typing is active.",
    "practice.a11y.status.complete": "Session complete. Results are ready.",
    "practice.a11y.status.empty": "No practice words are available.",
    "practice.a11y.target": "Current target letter {char}. Use key {key} with {finger}.",
    "words.title": "Custom vocabulary",
    "words.subtitle": "Add your own practice words",
    "words.collectionLabel": "Word collection",
    "words.collectionTitle": "Shape a word list that matches what you want to practice.",
    "words.addHint": "Add words for spelling drills, job vocabulary, or pronunciation practice.",
    "words.manageHint": "Search, reorder, edit, hide, and restore words from one place.",
    "words.jumpToActive": "Go to practice order",
    "words.placeholder": "Enter an English word",
    "words.newWord": "New word",
    "words.add": "Add word",
    "words.addRules": "Letters A-Z are kept. Spaces, numbers, and symbols are removed before saving.",
    "words.searchLabel": "Find words",
    "words.searchPlaceholder": "Search your word lists",
    "words.clearSearch": "Clear search",
    "words.sortAlpha": "Sort A-Z",
    "words.sortNewest": "Newest first",
    "words.sortOldest": "Oldest first",
    "words.selectWord": "Select word",
    "words.selectVisible": "Select visible",
    "words.deselectVisible": "Deselect visible",
    "words.clearSelection": "Clear selection",
    "words.moreActions": "More actions",
    "words.inputPreview": "Will save as: {word}",
    "words.inputDuplicate": "Already exists in {source}: {word}",
    "words.inputInvalidPreview": "This entry becomes empty after removing non-letters.",
    "words.selectedCount": "{count} selected",
    "words.bulkHint": "Select words below to unlock bulk actions for this section.",
    "words.bulkRemoveFromPractice": "Remove selected",
    "words.bulkRestore": "Restore selected",
    "words.bulkDelete": "Delete permanently",
    "words.bulkDeleteConfirm": "Delete the selected words permanently from this browser?",
    "words.edit": "Edit",
    "words.save": "Save",
    "words.cancel": "Cancel",
    "words.delete": "Delete",
    "words.moveUp": "Move up",
    "words.moveDown": "Move down",
    "words.moveToTop": "Move to top",
    "words.moveToBottom": "Move to bottom",
    "words.reorderSaved": "Practice order saved.",
    "words.builtinTitle": "Built-in words",
    "words.builtinHint": "Built-in word changes are stored only in this browser.",
    "words.activeTitle": "Practice order",
    "words.activeHint": "Reorder all active words here, including built-in and custom words together.",
    "words.sourceBuiltin": "Built-in",
    "words.sourceCustom": "Custom",
    "words.builtinEdited": "Edited locally",
    "words.stateActive": "Active",
    "words.stateHidden": "Hidden",
    "words.stateLocalOnly": "Saved locally",
    "words.hiddenBuiltinTitle": "Hidden built-in words",
    "words.hiddenBuiltinEmpty": "No hidden built-in words.",
    "words.restore": "Restore",
    "words.resetBuiltin": "Reset built-in words",
    "words.customTitle": "Custom words",
    "words.customHint": "These custom words are saved locally and currently active in practice.",
    "words.inactiveCustomTitle": "Hidden custom words",
    "words.inactiveCustomHint": "These custom words are still saved in this browser, but they are hidden from the practice order.",
    "words.inactiveCustomEmpty": "No hidden custom words.",
    "words.removeFromPractice": "Remove from practice",
    "words.empty": "No custom words yet.",
    "words.noMatches": "No words match that search.",
    "words.searchEmptyAction": "Try a shorter search or clear the filter to see every word again.",
    "words.emptyCustomAction": "Add a custom word above to build your own practice list.",
    "words.hiddenBuiltinAction": "Remove a built-in word from practice to keep it here for quick restore.",
    "words.hiddenCustomAction": "Remove a custom word from practice to hide it here without deleting it.",
    "words.emptyCustomCta": "Add your first custom word",
    "words.hiddenBuiltinCta": "Go to built-in words",
    "words.hiddenCustomCta": "Go to custom words",
    "words.stats.available": "Ready to practice",
    "words.stats.builtin": "Built-in active",
    "words.stats.custom": "Custom added",
    "words.stats.hidden": "Built-in hidden",
    "words.stats.hiddenTotal": "Hidden total",
    "words.minimizeSection": "Minimize",
    "words.expandSection": "Expand",
    "words.minimizedSummary": "Section minimized. Expand to manage the full list.",
    "words.builtinMinimizedSummary": "{activeCount} active built-in words, {hiddenCount} hidden",
    "words.customMinimizedSummary": "{activeCount} active custom words, {hiddenCount} hidden",
    "words.hiddenBuiltinMinimizedSummary": "{count} hidden built-in words",
    "words.hiddenCustomMinimizedSummary": "{count} hidden custom words",
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
    "settings.immediateGroup": "Applies now",
    "settings.nextSessionGroup": "Starts next session",
    "settings.audioToolsGroup": "Audio tools",
    "settings.appliesNow": "Updates immediately",
    "settings.appliesOnApply": "Waits for Apply",
    "settings.pendingSummaryLabel": "Pending changes",
    "settings.valueOn": "On",
    "settings.valueOff": "Off",
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
    "results.coachingStrength": "What went well",
    "results.coachingFocus": "What to focus on next",
    "results.feedbackSlowest": "Slowest word: {word} ({time} ms)",
    "results.feedbackMostMistakes": "Most mistakes: {word} ({mistakes})",
    "results.feedbackCleanWords": "Clean words: {count} of {total}",
    "results.feedbackNoMistakes": "No mistakes this session. Push for more speed next round.",
    "results.empty": "No completed words yet.",
    "results.mistakes": "mistakes",
    "results.time": "time",
    "results.startNew": "Start new session",
    "results.retryFocused": "Retry focus words",
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
    "practice.stepHintLabel": "次にすること",
    "practice.stepHint.countdown": "ハイライトされた文字を確認して、カウントダウンが終わったらすぐ入力を始めてください。",
    "practice.stepHint.active": "ハイライトされた文字を入力してください。必要なら発音やガイドを使えます。",
    "practice.stepHint.incorrect": "直前のキーは気にせず、ハイライトされた文字を押して入力に戻りましょう。",
    "practice.stepHint.complete": "結果を見て振り返るか、すぐにセッションをやり直してください。",
    "practice.stepHint.empty": "単語タブでカスタム単語を追加するか、設定でセッション単語数を調整してください。",
    "practice.a11y.status.countdown": "{count} 秒後に入力を開始できます。",
    "practice.a11y.status.active": "入力を受け付けています。",
    "practice.a11y.status.complete": "セッション完了です。結果を確認できます。",
    "practice.a11y.status.empty": "練習できる単語がありません。",
    "practice.a11y.target": "現在のターゲット文字は {char}。押すキーは {key}、推奨する指は {finger} です。",
    "words.title": "カスタム単語",
    "words.subtitle": "練習したい単語を追加できます",
    "words.collectionLabel": "単語コレクション",
    "words.collectionTitle": "練習したい内容に合わせて単語リストを整えましょう。",
    "words.addHint": "つづり、仕事で使う語彙、発音練習用の単語を追加できます。",
    "words.manageHint": "検索、並び替え、編集、非表示、復元をこの画面でまとめて行えます。",
    "words.jumpToActive": "練習順へ移動",
    "words.placeholder": "英単語を入力",
    "words.newWord": "新しい単語",
    "words.add": "追加",
    "words.addRules": "保存時には A-Z の英字だけを使います。空白、数字、記号は取り除かれます。",
    "words.searchLabel": "単語を探す",
    "words.searchPlaceholder": "単語リストを検索",
    "words.clearSearch": "検索をクリア",
    "words.sortAlpha": "A-Z で並べ替え",
    "words.sortNewest": "新しい順",
    "words.sortOldest": "古い順",
    "words.selectWord": "単語を選択",
    "words.selectVisible": "表示中を選択",
    "words.deselectVisible": "表示中の選択を外す",
    "words.clearSelection": "選択を解除",
    "words.moreActions": "その他の操作",
    "words.inputPreview": "保存される単語: {word}",
    "words.inputDuplicate": "{source} に同じ単語があります: {word}",
    "words.inputInvalidPreview": "英字以外を取り除くと空になるため、追加できません。",
    "words.selectedCount": "{count} 件選択中",
    "words.bulkHint": "このセクションで一括操作を使うには、下の単語を選択してください。",
    "words.bulkRemoveFromPractice": "選択した項目を練習順から外す",
    "words.bulkRestore": "選択した項目を復元",
    "words.bulkDelete": "選択した項目を完全に削除",
    "words.bulkDeleteConfirm": "選択した単語をこのブラウザから完全に削除しますか？",
    "words.edit": "編集",
    "words.save": "保存",
    "words.cancel": "キャンセル",
    "words.delete": "削除",
    "words.moveUp": "上へ移動",
    "words.moveDown": "下へ移動",
    "words.moveToTop": "一番上へ移動",
    "words.moveToBottom": "一番下へ移動",
    "words.reorderSaved": "練習順を保存しました。",
    "words.builtinTitle": "標準単語",
    "words.builtinHint": "標準単語の変更はこのブラウザにだけ保存されます。",
    "words.activeTitle": "練習順",
    "words.activeHint": "ここでは標準単語とカスタム単語をまとめて並び替えできます。",
    "words.sourceBuiltin": "標準",
    "words.sourceCustom": "カスタム",
    "words.builtinEdited": "このブラウザで編集済み",
    "words.stateActive": "有効",
    "words.stateHidden": "非表示",
    "words.stateLocalOnly": "ローカル保存",
    "words.hiddenBuiltinTitle": "非表示の標準単語",
    "words.hiddenBuiltinEmpty": "非表示の標準単語はありません。",
    "words.restore": "元に戻す",
    "words.resetBuiltin": "標準単語をリセット",
    "words.customTitle": "カスタム単語",
    "words.customHint": "ここにあるカスタム単語はローカルに保存され、現在の練習順に入っています。",
    "words.inactiveCustomTitle": "非表示のカスタム単語",
    "words.inactiveCustomHint": "これらのカスタム単語はこのブラウザに保存されたまま、練習順から非表示になっています。",
    "words.inactiveCustomEmpty": "非表示のカスタム単語はありません。",
    "words.removeFromPractice": "練習順から外す",
    "words.empty": "カスタム単語はまだありません。",
    "words.noMatches": "検索条件に一致する単語はありません。",
    "words.searchEmptyAction": "検索語を短くするか、検索をクリアしてすべての単語をもう一度表示してください。",
    "words.emptyCustomAction": "上の入力欄からカスタム単語を追加すると、自分用の練習リストを作れます。",
    "words.hiddenBuiltinAction": "標準単語を練習順から外すと、ここからすぐに復元できます。",
    "words.hiddenCustomAction": "カスタム単語を練習順から外すと、削除せずにここへ隠しておけます。",
    "words.emptyCustomCta": "最初のカスタム単語を追加",
    "words.hiddenBuiltinCta": "標準単語へ移動",
    "words.hiddenCustomCta": "カスタム単語へ移動",
    "words.stats.available": "練習に使える単語",
    "words.stats.builtin": "有効な標準単語",
    "words.stats.custom": "追加した単語",
    "words.stats.hidden": "非表示の標準単語",
    "words.stats.hiddenTotal": "非表示の合計",
    "words.minimizeSection": "小さく表示",
    "words.expandSection": "広げて表示",
    "words.minimizedSummary": "このセクションは小さく表示されています。広げると一覧を管理できます。",
    "words.builtinMinimizedSummary": "有効な標準単語 {activeCount} 件、非表示 {hiddenCount} 件",
    "words.customMinimizedSummary": "有効なカスタム単語 {activeCount} 件、非表示 {hiddenCount} 件",
    "words.hiddenBuiltinMinimizedSummary": "非表示の標準単語 {count} 件",
    "words.hiddenCustomMinimizedSummary": "非表示のカスタム単語 {count} 件",
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
    "settings.immediateGroup": "すぐ反映",
    "settings.nextSessionGroup": "次のセッションで反映",
    "settings.audioToolsGroup": "音声ツール",
    "settings.appliesNow": "今すぐ更新されます",
    "settings.appliesOnApply": "適用後に反映されます",
    "settings.pendingSummaryLabel": "未適用の変更",
    "settings.valueOn": "オン",
    "settings.valueOff": "オフ",
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
    "results.coachingStrength": "よかった点",
    "results.coachingFocus": "次に意識すること",
    "results.feedbackSlowest": "最も時間がかかった単語: {word} ({time} ms)",
    "results.feedbackMostMistakes": "最もミスが多かった単語: {word} ({mistakes})",
    "results.feedbackCleanWords": "ミスなしで終えた単語: {count} / {total}",
    "results.feedbackNoMistakes": "今回のセッションはノーミスです。次はスピードを伸ばせます。",
    "results.empty": "完了した単語はまだありません。",
    "results.mistakes": "ミス",
    "results.time": "時間",
    "results.startNew": "新しいセッションを開始",
    "results.retryFocused": "苦手語をもう一度練習",
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
    "practice.stepHintLabel": "つぎに すること",
    "practice.stepHint.countdown": "ハイライトされた もじを みて、カウントダウンが おわったら すぐに にゅうりょくを はじめてください。",
    "practice.stepHint.active": "ハイライトされた もじを にゅうりょくしてください。ひつようなら はつおんや ガイドを つかえます。",
    "practice.stepHint.incorrect": "さっきの キーは きにせず、ハイライトされた もじを おして もどりましょう。",
    "practice.stepHint.complete": "けっかを みて ふりかえるか、すぐに セッションを やりなおしてください。",
    "practice.stepHint.empty": "たんごタブで カスタムたんごを ついかするか、せっていで セッションの たんごすうを ちょうせいしてください。",
    "practice.a11y.status.countdown": "{count} びょうごに にゅうりょくを かいしできます。",
    "practice.a11y.status.active": "にゅうりょくを うけつけています。",
    "practice.a11y.status.complete": "セッションかんりょうです。けっかを かくにんできます。",
    "practice.a11y.status.empty": "れんしゅうできる たんごが ありません。",
    "practice.a11y.target": "いまの ターゲットもじは {char}。おすキーは {key}、おすすめの ゆびは {finger} です。",
    "words.title": "カスタムたんご",
    "words.subtitle": "れんしゅうしたい たんごを ついかできます",
    "words.collectionLabel": "たんご コレクション",
    "words.collectionTitle": "れんしゅうしたい ないように あわせて たんごリストを ととのえましょう。",
    "words.addHint": "つづり れんしゅうや しごとの ことば、はつおん れんしゅうの たんごを ついかできます。",
    "words.manageHint": "けんさく、ならびかえ、へんしゅう、ひひょうじ、ふっかつを ここで できます。",
    "words.jumpToActive": "れんしゅう じゅんへ いどう",
    "words.placeholder": "えいたんごを にゅうりょく",
    "words.newWord": "あたらしい たんご",
    "words.add": "ついか",
    "words.addRules": "ほぞんするときは A-Z の えいじだけを つかいます。スペース、すうじ、きごうは とりのぞかれます。",
    "words.searchLabel": "たんごを さがす",
    "words.searchPlaceholder": "たんごリストを けんさく",
    "words.clearSearch": "けんさくを クリア",
    "words.sortAlpha": "A-Z で ならびかえ",
    "words.sortNewest": "あたらしい じゅん",
    "words.sortOldest": "ふるい じゅん",
    "words.selectWord": "たんごを えらぶ",
    "words.selectVisible": "ひょうじちゅうを えらぶ",
    "words.deselectVisible": "ひょうじちゅうの えらびを はずす",
    "words.clearSelection": "えらんだ ものを はずす",
    "words.moreActions": "そのほかの そうさ",
    "words.inputPreview": "ほぞんされる たんご: {word}",
    "words.inputDuplicate": "{source} に おなじ たんごが あります: {word}",
    "words.inputInvalidPreview": "えいじいがいを とりのぞくと からになるため、ついかできません。",
    "words.selectedCount": "{count} けん えらんでいます",
    "words.bulkHint": "この セクションで まとめて そうさするには、したの たんごを えらんでください。",
    "words.bulkRemoveFromPractice": "えらんだ ものを れんしゅうじゅんから はずす",
    "words.bulkRestore": "えらんだ ものを もどす",
    "words.bulkDelete": "えらんだ ものを かんぜんに さくじょ",
    "words.bulkDeleteConfirm": "えらんだ たんごを このブラウザから かんぜんに さくじょ しますか？",
    "words.edit": "へんしゅう",
    "words.save": "ほぞん",
    "words.cancel": "キャンセル",
    "words.delete": "さくじょ",
    "words.moveUp": "うえへ いどう",
    "words.moveDown": "したへ いどう",
    "words.moveToTop": "いちばん うえへ いどう",
    "words.moveToBottom": "いちばん したへ いどう",
    "words.reorderSaved": "れんしゅうじゅんを ほぞんしました。",
    "words.builtinTitle": "はじめからある たんご",
    "words.builtinHint": "はじめからある たんごの へんこうは このブラウザだけに ほぞんされます。",
    "words.activeTitle": "れんしゅう じゅん",
    "words.activeHint": "ここで はじめからある たんごと カスタムたんごを いっしょに ならびかえできます。",
    "words.sourceBuiltin": "はじめからある",
    "words.sourceCustom": "カスタム",
    "words.builtinEdited": "このブラウザで へんこうずみ",
    "words.stateActive": "つかう",
    "words.stateHidden": "ひひょうじ",
    "words.stateLocalOnly": "ローカルほぞん",
    "words.hiddenBuiltinTitle": "ひょうじしていない はじめからある たんご",
    "words.hiddenBuiltinEmpty": "ひょうじしていない はじめからある たんごは ありません。",
    "words.restore": "もとに もどす",
    "words.resetBuiltin": "はじめからある たんごを リセット",
    "words.customTitle": "カスタムたんご",
    "words.customHint": "ここにある カスタムたんごは ローカルに ほぞんされ、いま れんしゅうじゅんに はいっています。",
    "words.inactiveCustomTitle": "ひょうじしていない カスタムたんご",
    "words.inactiveCustomHint": "これらの カスタムたんごは このブラウザに ほぞんされたまま、れんしゅうじゅんから ひょうじされていません。",
    "words.inactiveCustomEmpty": "ひょうじしていない カスタムたんごは ありません。",
    "words.removeFromPractice": "れんしゅうじゅんから はずす",
    "words.empty": "カスタムたんごは まだ ありません。",
    "words.noMatches": "けんさくに あう たんごは ありません。",
    "words.searchEmptyAction": "けんさくごを みじかくするか、けんさくを クリアして すべての たんごを もういちど ひょうじしてください。",
    "words.emptyCustomAction": "うえの にゅうりょくらんから カスタムたんごを ついかすると、じぶんようの れんしゅうリストを つくれます。",
    "words.hiddenBuiltinAction": "はじめからある たんごを れんしゅうじゅんから はずすと、ここから すぐに もどせます。",
    "words.hiddenCustomAction": "カスタムたんごを れんしゅうじゅんから はずすと、さくじょせずに ここへ かくしておけます。",
    "words.emptyCustomCta": "さいしょの カスタムたんごを ついか",
    "words.hiddenBuiltinCta": "はじめからある たんごへ いどう",
    "words.hiddenCustomCta": "カスタムたんごへ いどう",
    "words.stats.available": "れんしゅうできる たんご",
    "words.stats.builtin": "つかえる はじめからある たんご",
    "words.stats.custom": "ついかした たんご",
    "words.stats.hidden": "ひょうじしていない たんご",
    "words.stats.hiddenTotal": "ひょうじしていない ごうけい",
    "words.minimizeSection": "ちいさく ひょうじ",
    "words.expandSection": "ひろげて ひょうじ",
    "words.minimizedSummary": "この セクションは ちいさく ひょうじされています。ひろげると いちらんを かんりできます。",
    "words.builtinMinimizedSummary": "つかえる はじめからある たんご {activeCount} けん、ひひょうじ {hiddenCount} けん",
    "words.customMinimizedSummary": "つかえる カスタムたんご {activeCount} けん、ひひょうじ {hiddenCount} けん",
    "words.hiddenBuiltinMinimizedSummary": "ひひょうじの はじめからある たんご {count} けん",
    "words.hiddenCustomMinimizedSummary": "ひひょうじの カスタムたんご {count} けん",
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
    "settings.immediateGroup": "すぐ はんえい",
    "settings.nextSessionGroup": "つぎの セッションで はんえい",
    "settings.audioToolsGroup": "おんせい ツール",
    "settings.appliesNow": "いま すぐ こうしんされます",
    "settings.appliesOnApply": "てきようごに はんえいされます",
    "settings.pendingSummaryLabel": "みてきようの へんこう",
    "settings.valueOn": "オン",
    "settings.valueOff": "オフ",
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
    "results.coachingStrength": "よかった てん",
    "results.coachingFocus": "つぎに いしきすること",
    "results.feedbackSlowest": "もっとも じかんが かかった たんご: {word} ({time} ms)",
    "results.feedbackMostMistakes": "もっとも ミスが おおかった たんご: {word} ({mistakes})",
    "results.feedbackCleanWords": "ミスなしで おえた たんご: {count} / {total}",
    "results.feedbackNoMistakes": "こんかいの セッションは ノーミスです。つぎは スピードを のばせます。",
    "results.empty": "かんりょうした たんごは まだ ありません。",
    "results.mistakes": "ミス",
    "results.time": "じかん",
    "results.startNew": "あたらしい セッションを かいし",
    "results.retryFocused": "にがてな たんごを もういちど れんしゅう",
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
