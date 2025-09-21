# 📚 BookFinder - 精美書籍搜索網站

一個使用 Vue 3 + Quasar + Pinia 打造的現代化書籍搜索網站。

## ✨ 特色功能

- 🔍 **智能搜索** - 支持書名、作者、ISBN 搜索
- 📱 **響應式設計** - 完美適配手機、平板、桌面
- ❤️ **收藏功能** - 收藏你喜愛的書籍
- 📋 **閱讀清單** - 管理待讀書籍
- 🎨 **美觀界面** - 現代化設計風格
- 🌙 **暗色主題** - 支持明暗主題切換
- 📊 **使用統計** - 追蹤搜索和收藏數據

## 🚀 快速開始

### 1. 克隆專案

```bash
git clone https://github.com/yourusername/book-finder.git
cd book-finder
```

### 2. 安裝依賴

```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

### 3. 創建必要的目錄結構

```
book-finder/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── main.css
│   │       └── quasar-variables.sass
│   ├── components/
│   │   ├── BookCard.vue
│   │   └── BookSearch.vue
│   ├── services/
│   │   └── bookApi.js
│   ├── stores/
│   │   └── bookStore.js
│   ├── views/
│   │   └── Home.vue
│   ├── router/
│   │   └── index.js
│   ├── App.vue
│   └── main.js
├── package.json
├── vite.config.js
└── README.md
```

### 4. 創建 index.html

在 `public/index.html` 中創建：

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BookFinder - 探索無限的知識世界</title>
    <meta name="description" content="一個精美的書籍搜索網站，幫助你發現和收藏好書" />
    <link rel="icon" href="/favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### 5. 創建 Quasar 變量文件

在 `src/assets/styles/quasar-variables.sass` 中創建：

```sass
$primary   : #667eea
$secondary : #764ba2
$accent    : #9C27B0

$dark      : #1d1d1d
$dark-page : #121212

$positive  : #21BA45
$negative  : #C10015
$info      : #31CCEC
$warning   : #F2C037
```

### 6. 啟動開發服務器

```bash
npm run dev
```

瀏覽器會自動打開 http://localhost:3000

## 📂 專案結構

```
src/
├── components/          # 可復用組件
│   ├── BookCard.vue    # 書籍卡片組件
│   └── BookSearch.vue  # 搜索組件
├── services/           # API 服務
│   └── bookApi.js     # Google Books API 服務
├── stores/            # Pinia 狀態管理
│   └── bookStore.js   # 書籍狀態管理
├── views/             # 頁面組件
│   └── Home.vue       # 主頁面
├── router/            # 路由配置
│   └── index.js       # Vue Router 配置
├── assets/            # 靜態資源
│   └── styles/        # 樣式文件
└── App.vue            # 根組件
```

## 🛠️ 可用命令

```bash
# 開發模式
npm run dev

# 建構生產版本
npm run build

# 預覽生產版本
npm run preview

# 代碼檢查
npm run lint

# 代碼格式化
npm run format
```

## 📋 核心文件說明

### 1. 必須創建的組件文件

#### `src/components/BookCard.vue`

```vue
<!-- 已在前面提供完整代碼 -->
```

#### `src/components/BookSearch.vue`

```vue
<!-- 已在前面提供完整代碼 -->
```

#### `src/views/Home.vue`

```vue
<!-- 已在前面提供完整代碼 -->
```

#### `src/services/bookApi.js`

```javascript
// 已在前面提供完整代碼
```

#### `src/stores/bookStore.js`

```javascript
// 已在前面提供完整代碼
```

### 2. 環境配置

創建 `.env` 文件（可選）：

```bash
# Google Books API Key (可選，提高請求限制)
VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here

# 應用配置
VITE_APP_TITLE=BookFinder
VITE_APP_DESCRIPTION=精美書籍搜索網站
```

## 🔧 故障排除

### 常見問題

1. **Quasar 樣式沒有載入**
   - 確保已安裝 `@quasar/vite-plugin`
   - 檢查 `vite.config.js` 中的 Quasar 插件配置

2. **API 請求失敗**
   - 檢查網路連接
   - Google Books API 有請求限制，可以申請 API Key

3. **組件引用錯誤**
   - 確保所有組件檔案都已創建
   - 檢查 import 路徑是否正確

### 調試技巧

```javascript
// 在 main.js 中啟用 Vue 調試
if (import.meta.env.DEV) {
  app.config.devtools = true
  app.config.debug = true
}
```

## 🚀 部署

### 建構專案

```bash
npm run build
```

### 部署到 Netlify

1. 連接你的 Git 倉庫
2. 設置建構命令：`npm run build`
3. 設置發布目錄：`dist`

### 部署到 Vercel

1. 安裝 Vercel CLI：`npm i -g vercel`
2. 在專案目錄執行：`vercel`
3. 跟隨提示完成部署

### 部署到 GitHub Pages

```bash
npm run build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:yourusername/book-finder.git master:gh-pages
```

## 🎨 自定義主題

修改 `src/assets/styles/quasar-variables.sass`：

```sass
// 自定義顏色
$primary   : #your-color
$secondary : #your-color
$accent    : #your-color

// 自定義字體
$typography-font-family : 'Your Font', sans-serif
```

## 📚 技術棧

- **Vue 3** - 漸進式 JavaScript 框架
- **Quasar** - Vue.js 跨平台 UI 框架
- **Pinia** - Vue 狀態管理庫
- **Vue Router** - Vue.js 官方路由器
- **Axios** - HTTP 客戶端
- **VueUse** - Vue Composition API 工具集
- **Vite** - 下一代前端工具鏈

## 🤝 貢獻

歡迎貢獻代碼！請遵循以下步驟：

1. Fork 這個倉庫
2. 創建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打開一個 Pull Request

## 📄 開源協議

這個專案使用 MIT 協議 - 查看 [LICENSE](LICENSE) 文件了解詳情

## 🙏 致謝

- [Google Books API](https://developers.google.com/books) - 書籍資料來源
- [Quasar Framework](https://quasar.dev/) - 優秀的 Vue UI 框架
- [Vue.js](https://vuejs.org/) - 漸進式 JavaScript 框架

⭐ 如果這個專案對你有幫助，請給它一個 star！
