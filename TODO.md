# TODO

- [x] Impulse Chord 引導練習 — `src/app/pages/unit4/impulse-chord-practice-page/`，已實機測試確認可用
  - 定案：只服務已持有實機的使用者，練習中產生的 Chord 要真的存在使用者裝置上；不做軟體模擬（模擬已有官方 try.charachorder.com 涵蓋，無需重複）
  - 判斷方式：不自行實作同時按下/放開的組合鍵偵測邏輯，改為監聽輸入框 `input` 事件、比對 value 內容是否符合 GTM 印出的標記文字（如 `>I<mpulse output: `、`>I<mpulse input: `、複合和弦待續的結尾 `|`）來判斷目前所在步驟
  - 架構：獨立於 `exercise-page.component.ts` 既有的通用 step runner（那套是「比對固定正解」模型，跟 Impulse Chord「使用者自訂 output/input 並即時回顯」的性質不合），另做一個小型專用 FSM：`idle → output 輸入中 → output 已確定 → input 嘗試中（可重試）→ input 已確定 → 完成`，並支援 Esc 中途取消回到 `idle`
  - Enter 副作用：`keydown` 對 Enter 統一 `preventDefault()`，避免觸發表單送出/換行；步驟推進不依賴是否有攔到 Enter 的 keydown，而是純粹看 value 內容變化（實機測試確認 Enter 不會有副作用，無需再驗證是否送出 Enter 鍵盤事件）
- [ ] Chord Modifier 練習
  - 定案：Modifier 開關在本站涵蓋的四款機種（CC1/CC2/CCU/Master Forge）上是同一顆，並無機種差異（差異只存在於範圍外的 Lite/X），因此理論上可以畫 highlight diagram；實際開關位置待查文件或請使用者於實機確認後再補圖，圖示可視為後補項目、非實作前置條件
  - 架構：沿用既有 `exercise-page.component.ts` 的通用 step runner 與 `'chord'` step 判定邏輯（比對最終輸出文字，不管實際按鍵/時序），不用另做專用 FSM——這點與 Impulse Chord 不同
  - Arpeggiate 時序問題的解法：每個 step 的說明文字要「先」把 chord + modifier 兩個動作一起交代清楚（例如「chord 'run'，完成後立刻點 Present Tense 開關」），因為 step runner 本來就是先顯示說明、使用者才動作，不是等偵測到 chord 完成才反應式提示 modifier，所以不會有「太晚」的問題；判定仍只看最終輸出文字（如 modifier 套用後的 "running"）是否吻合
  - 待辦：實作前需先查 docs.charachorder.com 確認 (1) 四款機種預設已訓練好的 default chord 清單（避免練習還要求使用者先自行訓練 chord）(2) 各 Modifier 對應的實際開關位置（用於後補 diagram）
- [ ] Arpeggiate Punctuation 練習
- [ ] Compound Chord 引導練習
- [ ] Dynamic Chord Library 教學（較複雜，暫不做練習，只補設定方式的說明）
- [ ] 補上單元測試（目前 `nx test` 有設定但一支 `.spec.ts` 都沒有），優先針對輸入/狀態判斷邏輯（如 `<app-switch>` 方向判定、chording 練習的按鍵緩衝區邏輯）
- [ ] 檢查所有 Unit（`src/app/data/units.ts`）的 Other resources 是否有需要補充的連結
