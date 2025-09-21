<template>
  <div class="home-page">
    <!-- 頁面頂部導航 -->
    <q-header elevated class="bg-gradient text-white" height-hint="64">
      <q-toolbar class="container">
        <q-toolbar-title class="flex items-center">
          <q-icon name="auto_stories" size="32px" class="q-mr-sm" />
          <span class="text-h5 text-weight-light">BookFinder</span>
        </q-toolbar-title>

        <div class="header-actions">
          <!-- 主題切換 -->
          <q-btn flat round :icon="isDark ? 'light_mode' : 'dark_mode'" @click="toggleTheme">
            <q-tooltip>{{ isDark ? '切換到亮色主題' : '切換到暗色主題' }}</q-tooltip>
          </q-btn>

          <!-- 收藏列表 -->
          <q-btn flat round icon="favorite" @click="showFavoritesDialog = true">
            <q-badge v-if="favoriteBooks.length > 0" color="red" floating>
              {{ favoriteBooks.length }}
            </q-badge>
            <q-tooltip>我的收藏 ({{ favoriteBooks.length }})</q-tooltip>
          </q-btn>

          <!-- 閱讀清單 -->
          <q-btn flat round icon="playlist_add_check" @click="showReadingListDialog = true">
            <q-badge v-if="readingList.length > 0" color="blue" floating>
              {{ readingList.length }}
            </q-badge>
            <q-tooltip>閱讀清單 ({{ readingList.length }})</q-tooltip>
          </q-btn>

          <!-- 統計資料 -->
          <q-btn flat round icon="analytics" @click="showStatsDialog = true">
            <q-tooltip>使用統計</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 主要內容區域 -->
    <div class="main-content">
      <!-- Hero 區塊 -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">探索無限的知識世界</h1>
              <p class="hero-subtitle">
                搜尋、發現、收藏你的下一本好書。
                <br />
                讓閱讀成為你最好的投資！
              </p>
            </div>

            <!-- 主搜索區域 -->
            <div class="search-section">
              <BookSearch @search="handleSearch" @filter-change="handleFilterChange" />
            </div>

            <!-- 快速統計 -->
            <div class="quick-stats">
              <div class="stat-item">
                <q-icon name="search" color="white" size="20px" />
                <span>{{ searchStats.totalSearches }}</span>
                <small>次搜索</small>
              </div>
              <div class="stat-item">
                <q-icon name="favorite" color="red" size="20px" />
                <span>{{ favoriteBooks.length }}</span>
                <small>收藏書籍</small>
              </div>
              <div class="stat-item">
                <q-icon name="menu_book" color="amber" size="20px" />
                <span>{{ readingList.length }}</span>
                <small>待讀清單</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 搜索結果或推薦書籍 -->
      <section class="content-section">
        <div class="container">
          <!-- 使用 SearchResults 組件 -->
          <SearchResults @book-click="openBookDetail" @browse-featured="handleBrowseFeatured" />
        </div>
      </section>
    </div>

    <!-- 書籍詳情對話框 -->
    <q-dialog v-model="showBookDetail" :maximized="$q.screen.xs">
      <BookDetailDialog
        v-if="selectedBook"
        :book="selectedBook"
        @close="showBookDetail = false"
        @favorite="handleBookFavorite"
        @add-to-reading-list="handleAddToReadingList"
      />
    </q-dialog>

    <!-- 收藏列表對話框 -->
    <q-dialog v-model="showFavoritesDialog">
      <FavoritesDialog
        :books="favoriteBooks"
        @close="showFavoritesDialog = false"
        @book-click="openBookDetail"
        @remove-favorite="handleRemoveFavorite"
      />
    </q-dialog>

    <!-- 閱讀清單對話框 -->
    <q-dialog v-model="showReadingListDialog">
      <ReadingListDialog
        :books="readingList"
        @close="showReadingListDialog = false"
        @book-click="openBookDetail"
        @remove-from-list="handleRemoveFromReadingList"
      />
    </q-dialog>

    <!-- 統計資料對話框 -->
    <q-dialog v-model="showStatsDialog">
      <StatsDialog :stats="searchStats" @close="showStatsDialog = false" />
    </q-dialog>

    <!-- 返回頂部按鈕 -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        v-show="showScrollTop"
        fab
        icon="keyboard_arrow_up"
        color="primary"
        @click="scrollToTop"
        class="animate-bounce"
      />
    </q-page-sticky>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBookStore } from '../stores/bookStore'
import { useQuasar } from 'quasar'
import { useScroll } from '@vueuse/core'

// 組件引入
import BookSearch from '../components/BookSearch.vue'
import SearchResults from './SearchResults.vue'
// import BookCard from '../components/BookCard.vue'
// import BookDetailDialog from '../components/BookDetailDialog.vue'
// import FavoritesDialog from '../components/FavoritesDialog.vue'
// import ReadingListDialog from '../components/ReadingListDialog.vue'
// import StatsDialog from '../components/StatsDialog.vue'

export default {
  name: 'HomePage',
  components: {
    BookSearch,
    SearchResults,

    // BookDetailDialog,
    // FavoritesDialog,
    // ReadingListDialog,
    // StatsDialog
  },
  setup() {
    const bookStore = useBookStore()
    const $q = useQuasar()
    const { y: scrollY } = useScroll(window)

    // 響應式狀態
    const isDark = ref($q.dark.isActive)
    const showBookDetail = ref(false)
    const showFavoritesDialog = ref(false)
    const showReadingListDialog = ref(false)
    const showStatsDialog = ref(false)
    const selectedBook = ref(null)
    const activeCategory = ref('programming')
    const currentSort = ref('relevance')

    // 從 store 取得狀態
    const {
      searchResults,
      hasSearchResults,
      searchResultsCount,
      totalItems,
      hasMoreResults,
      isSearching,
      featuredBooks,
      isFeaturedLoading,
      favoriteBooks,
      readingList,
      searchStats,
    } = bookStore

    // 滾動控制
    const showScrollTop = computed(() => scrollY.value > 300)

    // 配置數據
    const featuredCategories = [
      { label: '程式設計', value: 'programming', icon: 'code' },
      { label: '商業管理', value: 'business', icon: 'business' },
      { label: '自我成長', value: 'self-help', icon: 'psychology' },
      { label: '科學技術', value: 'science', icon: 'science' },
      { label: '文學小說', value: 'fiction', icon: 'book' },
      { label: '歷史傳記', value: 'history', icon: 'history_edu' },
      { label: '藝術設計', value: 'art', icon: 'palette' },
      { label: '健康生活', value: 'health', icon: 'favorite' },
    ]

    const sortOptions = [
      { label: '相關性', value: 'relevance' },
      { label: '最新發布', value: 'newest' },
      { label: '評分最高', value: 'rating' },
      { label: '最受歡迎', value: 'popular' },
    ]

    const popularSearches = [
      'JavaScript',
      'Python',
      'Vue.js',
      'React',
      '人工智能',
      '機器學習',
      '區塊鏈',
      '投資理財',
      '心理學',
      '哲學',
      '歷史',
      '科學',
    ]

    // 方法
    const toggleTheme = () => {
      $q.dark.toggle()
      isDark.value = $q.dark.isActive

      $q.notify({
        message: `已切換到${isDark.value ? '暗色' : '亮色'}主題`,
        icon: isDark.value ? 'dark_mode' : 'light_mode',
        color: 'info',
        position: 'bottom',
      })
    }

    const handleSearch = (searchData) => {
      console.log('搜索執行:', searchData)

      $q.notify({
        message: `找到 ${searchData.results?.length || 0} 本相關書籍`,
        icon: 'search',
        color: 'positive',
        position: 'bottom',
      })
    }

    const handleFilterChange = (filterData) => {
      console.log('篩選變更:', filterData)
    }

    const openBookDetail = (book) => {
      selectedBook.value = book
      showBookDetail.value = true
      bookStore.fetchBookDetail(book.id)
    }

    const handleBookFavorite = (book, isFavorited) => {
      const message = isFavorited ? `《${book.title}》已加入收藏` : `《${book.title}》已從收藏移除`

      $q.notify({
        message,
        icon: isFavorited ? 'favorite' : 'favorite_border',
        color: isFavorited ? 'red' : 'grey',
        position: 'bottom',
      })
    }

    const handleBookPreview = (book) => {
      console.log('預覽書籍:', book.title)

      $q.notify({
        message: `正在開啟《${book.title}》的預覽`,
        icon: 'preview',
        color: 'info',
        position: 'bottom',
      })
    }

    const handleBookShare = (book) => {
      console.log('分享書籍:', book.title)

      $q.notify({
        message: `《${book.title}》已分享`,
        icon: 'share',
        color: 'positive',
        position: 'bottom',
      })
    }

    const handleAddToReadingList = (book) => {
      bookStore.addToReadingList(book)

      $q.notify({
        message: `《${book.title}》已加入閱讀清單`,
        icon: 'playlist_add',
        color: 'positive',
        position: 'bottom',
      })
    }

    const handleRemoveFavorite = (book) => {
      bookStore.removeFromFavorites(book.id)
    }

    const handleRemoveFromReadingList = (book) => {
      bookStore.removeFromReadingList(book.id)
    }

    const loadMoreBooks = async () => {
      try {
        await bookStore.loadMoreResults()

        $q.notify({
          message: '已載入更多書籍',
          icon: 'add_circle',
          color: 'positive',
          position: 'bottom',
        })
      } catch (error) {
        $q.notify({
          message: `載入失敗: ${error.message}`,
          icon: 'error',
          color: 'negative',
          position: 'bottom',
        })
      }
    }

    const changeSortOrder = async (sortValue) => {
      currentSort.value = sortValue

      // 重新執行當前搜索
      if (bookStore.searchQuery) {
        const options = { orderBy: sortValue }
        await bookStore.performSearch(bookStore.searchQuery, options)
      }

      $q.notify({
        message: `排序方式已更改為: ${sortOptions.find((s) => s.value === sortValue)?.label}`,
        icon: 'sort',
        color: 'info',
        position: 'bottom',
      })
    }

    const clearResults = () => {
      bookStore.clearSearchResults()

      $q.notify({
        message: '搜索結果已清除',
        icon: 'clear',
        color: 'info',
        position: 'bottom',
      })
    }

    const loadCategoryBooks = async (category) => {
      try {
        await bookStore.loadFeaturedBooks(
          featuredCategories.find((c) => c.value === category)?.label || category,
        )

        console.log(`載入分類書籍: ${category}`)
      } catch (error) {
        console.error('載入分類書籍失敗:', error)

        $q.notify({
          message: '載入推薦書籍失敗',
          icon: 'error',
          color: 'negative',
          position: 'bottom',
        })
      }
    }

    const refreshCategoryBooks = async (category) => {
      await loadCategoryBooks(category)

      $q.notify({
        message: '推薦書籍已更新',
        icon: 'refresh',
        color: 'positive',
        position: 'bottom',
      })
    }

    const performSuggestedSearch = async (suggestion) => {
      try {
        await bookStore.performSearch(suggestion)

        $q.notify({
          message: `搜索 "${suggestion}" 完成`,
          icon: 'search',
          color: 'positive',
          position: 'bottom',
        })
      } catch {
        $q.notify({
          message: '搜索失敗',
          icon: 'error',
          color: 'negative',
          position: 'bottom',
        })
      }
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }

    // 生命周期
    onMounted(async () => {
      // 初始化 store
      bookStore.initializeStore()

      // 載入預設推薦書籍
      await loadCategoryBooks(activeCategory.value)

      // 歡迎訊息
      $q.notify({
        message: '歡迎來到 BookFinder！',
        icon: 'auto_stories',
        color: 'positive',
        position: 'bottom',
        timeout: 3000,
      })
    })

    onUnmounted(() => {
      // 清理工作
    })

    return {
      // 響應式狀態
      isDark,
      showBookDetail,
      showFavoritesDialog,
      showReadingListDialog,
      showStatsDialog,
      selectedBook,
      activeCategory,
      currentSort,
      showScrollTop,

      // Store 狀態
      searchResults,
      hasSearchResults,
      searchResultsCount,
      totalItems,
      hasMoreResults,
      isSearching,
      featuredBooks,
      isFeaturedLoading,
      favoriteBooks,
      readingList,
      searchStats,

      // 配置數據
      featuredCategories,
      sortOptions,
      popularSearches,

      // 方法
      toggleTheme,
      handleSearch,
      handleFilterChange,
      openBookDetail,
      handleBookFavorite,
      handleBookPreview,
      handleBookShare,
      handleAddToReadingList,
      handleRemoveFavorite,
      handleRemoveFromReadingList,
      loadMoreBooks,
      changeSortOrder,
      clearResults,
      loadCategoryBooks,
      refreshCategoryBooks,
      performSuggestedSearch,
      scrollToTop,
    }
  },
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.q-header {
  .bg-gradient {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.main-content {
  padding-top: 64px; // Header 高度補償
}

.hero-section {
  padding: 80px 0 60px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
    position: relative;
    z-index: 1;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 300;
    margin-bottom: 20px;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  .hero-subtitle {
    font-size: 1.4rem;
    opacity: 0.9;
    margin-bottom: 40px;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }

  .search-section {
    margin-bottom: 40px;
  }

  .quick-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 40px;

    @media (max-width: 768px) {
      gap: 20px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      span {
        font-size: 1.8rem;
        font-weight: 600;
        color: white;
      }

      small {
        opacity: 0.8;
        font-size: 0.9rem;
      }
    }
  }
}

.content-section {
  padding: 60px 0;
  background: #f8fafc;
  min-height: 60vh;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      margin: 0;
    }

    .section-actions {
      display: flex;
      gap: 12px;

      @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-start;
      }
    }
  }

  .books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .load-more-section {
    text-align: center;
    margin-top: 60px;
  }

  .category-tabs {
    margin-bottom: 40px;

    :deep(.q-tabs) {
      .q-tab {
        font-weight: 500;
        text-transform: none;

        @media (max-width: 768px) {
          padding: 8px 12px;
          font-size: 0.9rem;
        }
      }
    }
  }

  .loading-section {
    text-align: center;
    padding: 80px 20px;
  }

  .empty-state {
    text-align: center;
    padding: 80px 20px;

    h3 {
      font-size: 1.5rem;
      margin: 20px 0 10px;
    }

    p {
      font-size: 1.1rem;
      margin-bottom: 40px;
    }

    .suggested-searches {
      max-width: 600px;
      margin: 0 auto;

      h4 {
        margin-bottom: 20px;
        font-size: 1.2rem;
      }
    }
  }
}

// 動畫效果
.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

// 載入動畫
.books-grid {
  .book-card {
    animation: fadeInUp 0.6s ease-out;
    animation-fill-mode: both;

    @for $i from 1 through 20 {
      &:nth-child(#{$i}) {
        animation-delay: #{($i - 1) * 0.1}s;
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 響應式調整
@media (max-width: 1024px) {
  .hero-section {
    padding: 60px 0 40px;
  }

  .content-section {
    padding: 40px 0;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 0 30px;

    .hero-title {
      font-size: 2.2rem;
    }

    .hero-subtitle {
      font-size: 1.1rem;
    }

    .quick-stats {
      margin-top: 30px;

      .stat-item span {
        font-size: 1.5rem;
      }
    }
  }

  .content-section {
    padding: 30px 0;

    .section-header .section-title {
      font-size: 1.6rem;
    }
  }
}

// 暗色主題支援
body.body--dark {
  .home-page {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  }

  .content-section {
    background: #1a202c;
    color: #e2e8f0;

    .section-title {
      color: #e2e8f0;
    }
  }

  .empty-state {
    h3,
    p {
      color: #a0aec0;
    }
  }
}
</style>
