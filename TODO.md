# TODO

- [x] Impulse Chord 引導練習 — `src/app/pages/unit4/impulse-chord-practice-page/`，已實機測試確認可用
  - 定案：只服務已持有實機的使用者，練習中產生的 Chord 要真的存在使用者裝置上；不做軟體模擬（模擬已有官方 try.charachorder.com 涵蓋，無需重複）
  - 判斷方式：不自行實作同時按下/放開的組合鍵偵測邏輯，改為監聽輸入框 `input` 事件、比對 value 內容是否符合 GTM 印出的標記文字（如 `>I<mpulse output: `、`>I<mpulse input: `、複合和弦待續的結尾 `|`）來判斷目前所在步驟
  - 架構：獨立於 `exercise-page.component.ts` 既有的通用 step runner（那套是「比對固定正解」模型，跟 Impulse Chord「使用者自訂 output/input 並即時回顯」的性質不合），另做一個小型專用 FSM：`idle → output 輸入中 → output 已確定 → input 嘗試中（可重試）→ input 已確定 → 完成`，並支援 Esc 中途取消回到 `idle`
  - Enter 副作用：`keydown` 對 Enter 統一 `preventDefault()`，避免觸發表單送出/換行；步驟推進不依賴是否有攔到 Enter 的 keydown，而是純粹看 value 內容變化（實機測試確認 Enter 不會有副作用，無需再驗證是否送出 Enter 鍵盤事件）
- [x] Chord Modifier 練習 — `src/app/pages/unit4/chord-modifier-page/`、練習資料在 `src/app/data/exercises.ts` 的 `CHORD_MODIFIER_EXERCISES`，五種（Capitalization／Present Tense／Plural／Past Tense／Comparative）皆已實機測試通過
  - 實機測試 Capitalization 時發現並修正兩個 `exercise-page.component.ts` 的 `onChordKeydown` 判定問題：
    1. 原本用 `toLowerCase()` 做不分大小寫比對，導致沒按 Shift、單純觸發 `run` 也會被判定通過 Capitalization 這種「大小寫本身就是判定重點」的練習；已改為完全比對（大小寫需一致）
    2. 原本用 `slice(-outputText.length)` 做固定長度的尾端視窗來累積按鍵緩衝區；改為讓緩衝區單純依實際按鍵 push／依 Backspace pop（不截斷），並用 `.trim()` 吸收 CharaChorder 在單字後自動送出的空白鍵（方便連續觸發下一個字的 chord）。理由：比對邏輯應該直接反映「使用者／裝置自己用 Backspace 修正錯誤」的真實情境，而非依賴一個固定視窗剛好會自我修正的巧合特性；此寫法與 `../alnitak` 的 `src/app/stores/chord-practice.store.ts`（`nextBuffer.join('').trim() === queue[0].outputText`）作法一致
  - 文案／視覺微調（實機測試後續）：
    - `chordModifierStep()` 的 step label 分隔符從全 `+`（`N + R + U + Capitalization`）改為 chord 本身用 `+`、和 Modifier 之間用 `→`（`N + R + U → Capitalization`），呼應說明文字「先完成 chord、再 arpeggiate 點 Modifier」的順序性，而非同時按下
    - `resolveChordIllustration()` 的 highlight 顏色：Modifier 開關改標記為 `characterKeyPositionCode`（沿用既有 press／hold 兩色語彙，press＝橘色 `fill-capella-500`），使其在圖上以 press／橘色凸顯，chord 本身的按鍵維持一律 hold／藍色（因為 chord 內沒有誰是主鍵），沒有新增顏色或元件
  - 架構：沿用既有 `exercise-page.component.ts` 的通用 step runner 與 `'chord'` step 判定邏輯（比對最終輸出文字，不管實際按鍵/時序），不用另做專用 FSM——這點與 Impulse Chord 不同；`ExerciseStep` 新增 `chordModifier` 欄位，判定邏輯本身完全不用改
  - Modifier 對應開關（使用者提供，四款機種 CC1/CC2/CCU/Master Forge 皆相同，已用 `tangent-cc-lib` 對 `DEFAULT_DEVICE_LAYOUT`／`M4G_DEFAULT_DEVICE_LAYOUT` 兩者驗證 position code 一致）：Capitalization = 左/右 Shift、Present Tense = 左 AT（Ambidextrous Throwover）鍵、Plural = 右 AT 鍵、Past Tense = 左 Numeric Layer 鍵、Comparative = 右 Numeric Layer 鍵
  - Highlight diagram：`key-position.utils.ts` 的 `resolveChordIllustration(chars, modifier?)` 新增 `modifier` 參數，解析出對應 position code 疊加進 chord 的 highlight——Capitalization／Past Tense／Comparative 用 `getModifierKeyPositionCodeMap`／`getLayerShiftPositionCodeMap` + `decodePositionCode` 判斷左右手，Present Tense／Plural 直接沿用既有的 `resolveNonKeyActionPosition('AmbidextrousThrowoverLeft' / 'Right')`
  - 練習範例字（皆為出廠預設 starter chord，已用 CCOS Meta API 解出實際按鍵組合）：Capitalization `run（N+R+U）→ Run`、Present Tense `work（O+R+W）→ working`、Plural `book（B+K+O）→ books`、Past Tense `help（E+H+L）→ helped`、Comparative `small（A+M+S）→ smaller`
  - 時序文案：使用者回饋 same-time 觸發在實機上不好用，練習說明與 lesson 文案都改成推薦 arpeggiate（先完成 chord，緊接著點 modifier 開關）的寫法，不再並列同時觸發
  - ~~殘留小疑慮：文字變換規則 CSV 取自 `CharaChorder/CCOS-firmware` 的 `main` 分支（無對應 3.0.x/3.1.x 韌體的 tag），無法百分之百對應實機當下韌體版本~~ → 五種 Modifier 皆已實機測試確認輸出正確，無落差，疑慮解除
- [x] ~~Arpeggiate Punctuation 練習~~ → 整個 Chapter 已移除（`unit-4/arpeggiate-punctuation`），原因見下
  - 曾經實作過一版（Trailing／Sentence-Ending 兩個練習，`because` chord + 符號 arpeggiate），架構與 highlight 作法都比照 Chord Modifier；程式邏輯本身用瀏覽器模擬按鍵驗證過沒問題，但拿去實機測試時重現不了
  - 原因：這個行為在使用者的裝置上（新版韌體）並不是內建 chord library 就有的東西，需要另外用 CCOS 手動設定/匯入對應的 arpeggiate 字典項目才會生效——跟 Chord Modifier 那五種是「所有支援機種出廠就有」的性質不同，不能直接假設是開箱即用的功能
  - 佐證：`CCOS-firmware` 的 `e2e/tests/arpeggiates/custom_period.yml` 測試本身就是先用 `addChords` 自訂了 `ARPEGGIATE + .` 這個對應（`output: [JOIN, ., CAPITALIZE, JOIN]`），代表這是在測試 token 執行引擎本身，而不是在驗證某個出廠預設值——這點在規劃階段沒有意識到，等實機測不出來才確認
  - 已還原的東西：`src/app/pages/unit4/arpeggiate-punctuation-page/` 整個目錄、`app.routes.ts`／`units.ts` 的對應 chapter／route、`exercises.ts` 的 `ARPEGGIATE_PUNCTUATION_EXERCISES`、`ExerciseStep.arpeggiateChar`／`resolveChordIllustration()` 的 `arpeggiateChar` 參數；Unit 4 的 introduction／summary 文案與 Chord Modifier 頁面「covered in more depth next chapter」的預告句也一併拿掉
  - 之後如果要重新做，需要先確認：這個功能到底要不要教（畢竟需要額外設定，不是每個使用者都會做），或者調整成「教怎麼用 CCOS 設定 arpeggiate 字典」的說明型章節，而非練習型
- [x] ~~Compound Chord 引導練習~~ → 隨 Unit 5 一併移除，見下
- [x] ~~Dynamic Chord Library 教學~~ → 隨 Unit 5 一併移除，見下
- [x] Unit 5: Advanced Chording 整個移除 — 使用者判斷這超出 Tutorial 範疇（`src/app/pages/unit5/` 整個目錄、`app.routes.ts`／`units.ts` 的 unit-5 與其兩個 Chapter），一併修正 Unit 4 summary 文案原本預告 Unit 5 的那句、`README.md` 的 Units 清單
- [ ] 補上單元測試（目前 `nx test` 有設定但一支 `.spec.ts` 都沒有），優先針對輸入/狀態判斷邏輯（如 `<app-switch>` 方向判定、chording 練習的按鍵緩衝區邏輯）
- [ ] 檢查所有 Unit（`src/app/data/units.ts`）的 Other resources 是否有需要補充的連結
- [ ] Capella 的按鍵標籤（key label）改直接引用 `tangent-cc-lib`，不要手動維護一份
  - 背景：`tangent-cc-lib` 已經有現成的 `NON_WSK_CODE_2_RAW_KEY_LABEL_MAP`、`NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP`、`SHIFT_KEY_LABEL`／`NUM_SHIFT_KEY_LABEL`／`FN_SHIFT_KEY_LABEL`／`FLAG_SHIFT_KEY_LABEL`／`ALT_GRAPH_KEY_LABEL`（`node_modules/tangent-cc-lib/dist/lib/data/key-label/key-labels.js`，經 `data/index.js` 正常 export），但 `src/app/utils/key-position.utils.ts` 的 `NAMED_KEY_LABEL`、`MOUSE_ACTION_LABEL`、`labelForHeldPosition`、`CHORD_MODIFIER_LABEL` 是手動 port 自 alnitak 的一份拷貝（見檔案內註解），沒有直接引用這個共用來源
  - 已確認的落差（Capella 現狀 vs tangent-cc-lib 正確值），並用 `tangent-cc-lib` 的 layout 解析函式跑過目前所有 exercise 的字元／按鍵，確認實際會不會顯示在畫面上：
    - **FN Shift**（會顯示）：`FUNCTION_KEYS_EXERCISES` 的 `F1–F12` 練習（F1–F10、F12，F11 因系統快捷鍵而跳過）會觸發 FN Shift 標籤——Capella 文字 `'FN'` vs `FN_SHIFT_KEY_LABEL` 應為 icon `'counter_3'`
    - **Chord Modifier 的 Present Tense／Plural（AT 鍵）**（會顯示）：`CHORD_MODIFIER_EXERCISES` 會觸發——Capella 文字 `'AT'` vs `NON_KEY_ACTION_NAME_2_RAW_KEY_LABEL_MAP.AmbidextrousThrowoverLeft/Right` 應為 icon `'switch_left'`／`'switch_right'`
    - AltGraph／Flag Shift（目前不會顯示）：用 US 配列 + `DEFAULT_DEVICE_LAYOUT` 跑過所有現有 exercise 的字元／按鍵（含 letters/number/symbols/named-key），沒有任何一個會觸發 AltGraph 或 Flag Shift 標籤，屬於目前 unreachable 的分支，先不列入優先修正範圍，等未來有對應 Lesson 再一併處理
    - Enter／Backspace／Tab／方向鍵／滑鼠動作等目前是一致的，暫無問題
  - 待處理的型別落差：`tangent-cc-lib` 的 `RawKeyLabel` 有 `String`／`Icon`／`Logo`（字型 logo）／`ActionCode`（數值代碼）四種 type，Capella 的 `PositionLabel` 只有 `text` + `icon?: boolean` 兩種，改用共用來源前要決定 `Logo`／`ActionCode` 這兩種怎麼處理（目前用到的範圍只有 `String`／`Icon`，可能不受影響，但要確認）
