// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog, Loading } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

// Import Quasar css
import 'quasar/dist/quasar.css'

// Import custom styles
import './assets/styles/main.css'

import App from './App.vue'
import router from './router'

// 創建 Vue 應用實例
const app = createApp(App)

// 使用 Pinia 狀態管理
app.use(createPinia())

// 使用 Vue Router
app.use(router)

// 配置 Quasar
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading,
  },
  config: {
    notify: {
      position: 'bottom',
      timeout: 3000,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }],
    },
    loading: {
      spinnerColor: 'primary',
      backgroundColor: 'rgba(0,0,0,0.8)',
    },
  },
})

// 全域錯誤處理
app.config.errorHandler = (err, instance, info) => {
  console.error('全域錯誤:', err, info)

  // 在生產環境中，可以將錯誤發送到監控服務
  if (import.meta.env.PROD) {
    // 發送錯誤到監控服務
    // sendErrorToMonitoring(err, info)
  }
}

// 全域組件註冊（如果需要）
// app.component('GlobalComponent', GlobalComponent)

// 掛載應用
app.mount('#app')

import { useBookStore } from './stores/bookStore'

// 在應用掛載後初始化 BookStore
const bookStore = useBookStore()
bookStore.initializeStore()

// 在開發環境中添加一些除錯資訊
if (import.meta.env.DEV) {
  console.log('🚀 BookFinder 應用已啟動')
  console.log('📚 Vue版本:', app.version)
  console.log('🎨 Quasar 主題:', Quasar.theme)
  console.log('📖 BookStore 已初始化')
}

// PWA 支持（如果需要）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('SW registered: ', registration)
    })
    .catch((registrationError) => {
      console.log('SW registration failed: ', registrationError)
    })
}
