# Google Search Console SEO 設置指南

本指南將幫助您在 Google Search Console 中設置 SEO 並監控錨點連結。

---

## 📋 目錄

1. [網站驗證](#網站驗證)
2. [提交 Sitemap](#提交-sitemap)
3. [檢查索引狀態](#檢查索引狀態)
4. [監控錨點連結](#監控錨點連結)
5. [查看 SEO 報告](#查看-seo-報告)
6. [常見問題](#常見問題)

---

## 🔐 網站驗證

### 步驟 1：登入 Google Search Console

1. 前往 [Google Search Console](https://search.google.com/search-console)
2. 使用您的 Google 帳號登入

### 步驟 2：新增資源（網站）

1. 點擊左上角的「新增資源」
2. 選擇「網址前置字元」方式
3. 輸入您的網站網址：`https://www.didicreative.com`
4. 點擊「繼續」

### 步驟 3：驗證所有權

Google 提供多種驗證方式，推薦使用以下方法：

#### 方法 A：HTML 標籤驗證（推薦）

1. Google 會提供一段類似這樣的 HTML 標籤：
   ```html
   <meta name="google-site-verification" content="您的驗證碼" />
   ```
2. 將此標籤添加到 `index.html` 的 `<head>` 區塊中
3. 上傳修改後的檔案到伺服器
4. 回到 Google Search Console 點擊「驗證」

#### 方法 B：HTML 檔案上傳

1. 下載 Google 提供的 HTML 驗證檔案
2. 將檔案上傳到網站根目錄（與 `index.html` 同層）
3. 確保可以透過 `https://www.didicreative.com/驗證檔名.html` 訪問
4. 回到 Google Search Console 點擊「驗證」

#### 方法 C：DNS 記錄驗證

1. 在 Google Search Console 中選擇「DNS 記錄」方式
2. 按照指示在您的網域 DNS 設定中添加 TXT 記錄
3. 等待 DNS 傳播（可能需要幾小時）
4. 回到 Google Search Console 點擊「驗證」

---

## 🗺️ 提交 Sitemap

### 步驟 1：確認 Sitemap 檔案位置

確保 `sitemap.xml` 已上傳到網站根目錄，可以透過以下網址訪問：
```
https://www.didicreative.com/sitemap.xml
```

### 步驟 2：在 Google Search Console 中提交

1. 登入 Google Search Console
2. 在左側選單中點擊「Sitemap」
3. 在「新增 Sitemap」欄位中輸入：`sitemap.xml`
4. 點擊「提交」
5. 等待 Google 處理（通常需要幾分鐘到幾小時）

### 步驟 3：檢查 Sitemap 狀態

- **成功**：會顯示「成功」狀態，並顯示已發現的網址數量
- **錯誤**：會顯示錯誤訊息，請根據提示修正

---

## 🔍 檢查索引狀態

### 使用「網址檢查」工具

1. 在 Google Search Console 頂部搜尋欄中輸入您的網址
2. 點擊「檢查網址」
3. 查看結果：
   - **已建立索引**：網頁已被 Google 收錄
   - **未建立索引**：需要提交索引請求或修正問題

### 查看「涵蓋範圍」報告

1. 在左側選單點擊「涵蓋範圍」
2. 查看索引狀態：
   - **有效**：已成功建立索引的網頁
   - **警告**：已建立索引但可能有問題
   - **錯誤**：無法建立索引的網頁
   - **已排除**：被排除在索引外的網頁

---

## 🔗 監控錨點連結

### Google Search Console 中的連結報告

1. 在左側選單點擊「連結」
2. 查看以下資訊：

#### 內部連結
- 顯示網站內部的連結結構
- 可以看到哪些頁面/錨點被連結最多
- 錨點連結（如 `#brand-strategy`, `#team`, `#plans`）會顯示在內部連結中

#### 外部連結
- 顯示其他網站連結到您網站的連結
- 可以看到使用的錨文字（anchor text）

### 使用 Google Analytics 追蹤錨點點擊

雖然 Google Search Console 可以檢測錨點連結的存在，但要追蹤用戶點擊行為，建議使用 Google Analytics：

1. 確保已安裝 Google Analytics（您的網站已安裝：`G-HKB95ZBP5M`）
2. 在 Google Analytics 中查看「行為」→「網站內容」→「所有網頁」
3. 可以看到包含錨點的 URL（如 `/index.html#brand-strategy`）

---

## 📊 查看 SEO 報告

### 1. 成效報告

- **點擊次數**：用戶從搜尋結果點擊進入您網站的次數
- **曝光次數**：您的網站在搜尋結果中出現的次數
- **平均排名**：您的網站在搜尋結果中的平均位置
- **點擊率 (CTR)**：點擊次數 ÷ 曝光次數

### 2. 增強功能

- **結構化資料**：檢查 Schema.org 標記是否正確
- **行動裝置可用性**：檢查行動版網站的可用性問題
- **核心網頁體驗**：查看網站速度和使用者體驗指標

### 3. 安全性與手動操作

- **安全性問題**：檢查是否有安全性警告
- **手動操作**：查看是否有手動處罰

---

## ❓ 常見問題

### Q1: 為什麼我的網站還沒有被索引？

**可能原因：**
- 網站剛建立，Google 尚未爬取
- robots.txt 阻止了爬蟲
- 網站有技術問題（404 錯誤、伺服器錯誤等）

**解決方法：**
- 確認 `robots.txt` 允許爬取
- 使用「網址檢查」工具提交索引請求
- 檢查「涵蓋範圍」報告中的錯誤訊息

### Q2: 錨點連結（#）會被 Google 索引嗎？

**答案：**
- Google 可以識別和追蹤錨點連結
- 但通常不會為每個錨點建立獨立的索引頁面
- 錨點主要用於內部導航和用戶體驗
- 在「連結」報告中可以看到錨點連結的使用情況

### Q3: 如何提高網站在搜尋結果中的排名？

**建議：**
1. 確保網站內容優質且相關
2. 優化頁面載入速度
3. 確保行動裝置友善
4. 建立高品質的外部連結
5. 持續更新內容
6. 使用結構化資料（Schema.org）

### Q4: Sitemap 提交後多久會生效？

**時間：**
- 通常幾分鐘到幾小時內會被處理
- 但實際索引可能需要幾天到幾週
- 新網站可能需要更長時間

### Q5: 如何知道哪些關鍵字帶來流量？

**方法：**
1. 在 Google Search Console 中查看「成效」報告
2. 點擊「查詢」標籤
3. 可以看到帶來點擊的搜尋關鍵字
4. 可以查看每個關鍵字的點擊率、排名等數據

---

## 📝 定期維護建議

### 每週檢查：
- 查看「成效」報告，了解搜尋表現
- 檢查「涵蓋範圍」報告，修正任何錯誤

### 每月檢查：
- 查看「連結」報告，了解內部連結結構
- 檢查「增強功能」，確保結構化資料正常
- 查看「安全性與手動操作」

### 每季檢查：
- 分析關鍵字排名變化
- 優化表現不佳的頁面
- 更新 Sitemap（如有新內容）

---

## 🔗 相關資源

- [Google Search Console 說明文件](https://support.google.com/webmasters)
- [Google 搜尋引擎最佳化 (SEO) 入門指南](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Sitemap 協議說明](https://www.sitemaps.org/protocol.html)

---

## 📞 需要協助？

如果您在設置過程中遇到問題，可以：
1. 查看 Google Search Console 的說明文件
2. 檢查網站技術問題（伺服器日誌、錯誤訊息等）
3. 聯繫網站開發人員

---

**最後更新：2024-12-19**
