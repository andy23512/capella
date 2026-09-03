# TODO

- [x] Impulse Chord 引導練習 — `src/app/pages/unit4/impulse-chord-practice-page/`，已實機測試確認可用
  - 定案：只服務已持有實機的使用者，練習中產生的 Chord 要真的存在使用者裝置上；不做軟體模擬（模擬已有官方 try.charachorder.com 涵蓋，無需重複）
  - 判斷方式：不自行實作同時按下/放開的組合鍵偵測邏輯，改為監聽輸入框 `input` 事件、比對 value 內容是否符合 GTM 印出的標記文字（如 `>I<mpulse output: `、`>I<mpulse input: `、複合和弦待續的結尾 `|`）來判斷目前所在步驟
  - 架構：獨立於 `exercise-page.component.ts` 既有的通用 step runner（那套是「比對固定正解」模型，跟 Impulse Chord「使用者自訂 output/input 並即時回顯」的性質不合），另做一個小型專用 FSM：`idle → output 輸入中 → output 已確定 → input 嘗試中（可重試）→ input 已確定 → 完成`，並支援 Esc 中途取消回到 `idle`
  - Enter 副作用：`keydown` 對 Enter 統一 `preventDefault()`，避免觸發表單送出/換行；步驟推進不依賴是否有攔到 Enter 的 keydown，而是純粹看 value 內容變化（實機測試確認 Enter 不會有副作用，無需再驗證是否送出 Enter 鍵盤事件）
- [x] Chord Modifier 練習 — `src/app/pages/unit4/chord-modifier-page/`、練習資料在 `src/app/data/exercises.ts` 的 `CHORD_MODIFIER_EXERCISES`，**尚未實機測試**
  - 架構：沿用既有 `exercise-page.component.ts` 的通用 step runner 與 `'chord'` step 判定邏輯（比對最終輸出文字，不管實際按鍵/時序），不用另做專用 FSM——這點與 Impulse Chord 不同；`ExerciseStep` 新增 `chordModifier` 欄位，判定邏輯本身完全不用改
  - Modifier 對應開關（使用者提供，四款機種 CC1/CC2/CCU/Master Forge 皆相同，已用 `tangent-cc-lib` 對 `DEFAULT_DEVICE_LAYOUT`／`M4G_DEFAULT_DEVICE_LAYOUT` 兩者驗證 position code 一致）：Capitalization = 左/右 Shift、Present Tense = 左 AT（Ambidextrous Throwover）鍵、Plural = 右 AT 鍵、Past Tense = 左 Numeric Layer 鍵、Comparative = 右 Numeric Layer 鍵
  - Highlight diagram：`key-position.utils.ts` 的 `resolveChordIllustration(chars, modifier?)` 新增 `modifier` 參數，解析出對應 position code 疊加進 chord 的 highlight——Capitalization／Past Tense／Comparative 用 `getModifierKeyPositionCodeMap`／`getLayerShiftPositionCodeMap` + `decodePositionCode` 判斷左右手，Present Tense／Plural 直接沿用既有的 `resolveNonKeyActionPosition('AmbidextrousThrowoverLeft' / 'Right')`
  - 練習範例字（皆為出廠預設 starter chord，已用 CCOS Meta API 解出實際按鍵組合）：Capitalization `run（N+R+U）→ Run`、Present Tense `work（O+R+W）→ working`、Plural `book（B+K+O）→ books`、Past Tense `help（E+H+L）→ helped`、Comparative `small（A+M+S）→ smaller`
  - 時序文案：使用者回饋 same-time 觸發在實機上不好用，練習說明與 lesson 文案都改成推薦 arpeggiate（先完成 chord，緊接著點 modifier 開關）的寫法，不再並列同時觸發
  - 殘留小疑慮：文字變換規則 CSV 取自 `CharaChorder/CCOS-firmware` 的 `main` 分支（無對應 3.0.x/3.1.x 韌體的 tag），無法百分之百對應實機當下韌體版本；選用範例字都只吃各表最基本的預設規則、非例外清單項目，風險低，待實機測試若有落差再排查
- [ ] Arpeggiate Punctuation 練習
- [ ] Compound Chord 引導練習
- [ ] Dynamic Chord Library 教學（較複雜，暫不做練習，只補設定方式的說明）
- [ ] 補上單元測試（目前 `nx test` 有設定但一支 `.spec.ts` 都沒有），優先針對輸入/狀態判斷邏輯（如 `<app-switch>` 方向判定、chording 練習的按鍵緩衝區邏輯）
- [ ] 檢查所有 Unit（`src/app/data/units.ts`）的 Other resources 是否有需要補充的連結
