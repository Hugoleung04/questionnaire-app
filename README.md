# 我們現在怎麼感受愛

一個可以放上 GitHub Pages 嘅 30 題問卷網站。答案會存在瀏覽器，亦都可以選擇同步到你自己嘅 GitHub repo（每個提交一個 JSON 檔）。

設計原則同原本 Google 表單一樣：**先寫而家嘅答案，填表途中唔會顯示上次答案**，避免照抄。

## 功能

- 30 題原文已放入，分 5 頁
- 第 12 題支援多選 +「其他」
- 自動暫存草稿
- 本機歷史紀錄、匯出／匯入 JSON
- 可選：用 GitHub Contents API 將每次提交備份到 `answers/` 資料夾

## 本機開啟

用瀏覽器直接打開 `index.html` 通常得。如果 GitHub 同步測試失敗（有啲瀏覽器限制 `file://`），用簡單伺服器：

```bash
cd questionnaire-app
python3 -m http.server 8080
```

然後開 `http://localhost:8080`。

## 放到 GitHub（靜態網站 + 儲存答案）

1. 喺 GitHub 開一個 **private** repo（私人答案唔好放 public）。
2. 將呢個資料夾全部檔案 push 上去。
3. Repo → **Settings** → **Pages** → Source 選 `main`（或 `docs`），等佢出網址。
4. 想把答案都存入同一個 repo：
   - GitHub → Settings → Developer settings → [Personal access tokens](https://github.com/settings/tokens)
   - 建議用 **Fine-grained token**
   - Repository access 只選呢個 repo
   - Permissions：`Contents: Read and write`
   - 喺網站「設定」填：用戶名、repo 名、token、資料夾（預設 `answers`）
   - 撳「測試 GitHub 連線」，之後每次提交都會新增一個 JSON

Token 只存在你部裝置嘅 `localStorage`，呢個靜態網站本身冇後端。

## 檔案結構

```
index.html      頁面
styles.css      樣式
questions.js    30 條問題
app.js          填表、暫存、歷史、GitHub 同步
README.md
```

改問題只需要編輯 `questions.js`。

## 私隱

- 唔好用公開 repo 存答案
- Token 唔好傳俾其他人、唔好 commmit 入 repo
- 想換裝置：用「匯出全部本機紀錄」，另一邊「匯入 JSON」；或者開 GitHub 同步
