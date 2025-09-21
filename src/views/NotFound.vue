<template>
  <div class="not-found-page">
    <div class="error-container">
      <!-- 錯誤圖示 -->
      <div class="error-icon">
        <q-icon name="sentiment_dissatisfied" size="120px" color="grey-4" />
      </div>

      <!-- 錯誤訊息 -->
      <div class="error-content">
        <h1 class="error-title">404</h1>
        <h2 class="error-subtitle">頁面未找到</h2>
        <p class="error-description">
          抱歉，您要尋找的頁面不存在。<br />
          可能是網址輸入錯誤，或該頁面已被移除。
        </p>

        <!-- 操作按鈕 -->
        <div class="error-actions">
          <q-btn
            color="primary"
            label="回到首頁"
            icon="home"
            @click="goHome"
            unelevated
            size="lg"
          />

          <q-btn
            flat
            color="grey-8"
            label="返回上一頁"
            icon="arrow_back"
            @click="goBack"
            class="q-ml-md"
          />
        </div>

        <!-- 建議連結 -->
        <div class="suggested-links">
          <p class="text-grey-6">或者試試這些頁面：</p>
          <div class="link-buttons">
            <q-btn flat color="primary" label="搜尋書籍" icon="search" @click="$router.push('/')" />
            <q-btn
              flat
              color="primary"
              label="我的收藏"
              icon="favorite"
              @click="$router.push('/favorites')"
            />
            <q-btn
              flat
              color="primary"
              label="閱讀清單"
              icon="playlist_add"
              @click="$router.push('/reading-list')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 裝飾性書籍圖示 -->
    <div class="decoration-books">
      <q-icon
        v-for="i in 5"
        :key="i"
        name="menu_book"
        :size="`${20 + Math.random() * 30}px`"
        :color="`grey-${3 + Math.floor(Math.random() * 3)}`"
        :style="{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: `rotate(${Math.random() * 360}deg)`,
          opacity: 0.3,
        }"
      />
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'NotFoundPage',
  setup() {
    const router = useRouter()

    const goHome = () => {
      router.push('/')
    }

    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/')
      }
    }

    return {
      goHome,
      goBack,
    }
  },
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f4fd 100%);
  position: relative;
  overflow: hidden;
  padding: 40px 20px;
}

.error-container {
  text-align: center;
  max-width: 600px;
  z-index: 1;
  position: relative;
}

.error-icon {
  margin-bottom: 32px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-content {
  background: white;
  padding: 48px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 96px;
  font-weight: 800;
  color: #4f46e5;
  margin: 0 0 16px 0;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(79, 70, 229, 0.1);
}

.error-subtitle {
  font-size: 32px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.error-actions {
  margin-bottom: 40px;
}

.suggested-links {
  border-top: 1px solid #e5e7eb;
  padding-top: 32px;
}

.suggested-links p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.link-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.decoration-books {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .not-found-page {
    padding: 20px 16px;
  }

  .error-content {
    padding: 32px 24px;
  }

  .error-title {
    font-size: 72px;
  }

  .error-subtitle {
    font-size: 24px;
  }

  .error-description {
    font-size: 14px;
  }

  .error-actions {
    flex-direction: column;
    gap: 12px;
  }

  .error-actions .q-btn {
    margin: 0 !important;
  }

  .link-buttons {
    flex-direction: column;
    align-items: center;
  }

  .link-buttons .q-btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .error-title {
    font-size: 60px;
  }

  .error-subtitle {
    font-size: 20px;
  }
}
</style>
