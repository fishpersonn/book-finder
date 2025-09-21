<template>
  <div class="search-results">
    <!-- 載入狀態 -->
    <div v-if="isSearching" class="loading-state">
      <q-inner-loading showing>
        <q-spinner-dots size="50px" color="primary" />
        <div class="text-h6 q-mt-md">搜索中...</div>
      </q-inner-loading>
    </div>

    <!-- 搜索結果 -->
    <div v-else-if="searchResults.length > 0" class="results-container">
      <!-- 結果統計 -->
      <div class="results-header">
        <div class="results-stats">
          <h5 class="results-title">搜索結果</h5>
          <p class="results-count text-grey-7">
            找到 {{ totalItems.toLocaleString() }} 本相關書籍
            <span v-if="searchQuery" class="search-query">"{{ searchQuery }}"</span>
          </p>
        </div>

        <!-- 視圖切換 -->
        <div class="view-controls">
          <q-btn-toggle
            v-model="viewMode"
            :options="[
              { label: 'grid', value: 'grid', icon: 'grid_view' },
              { label: 'list', value: 'list', icon: 'view_list' },
            ]"
            color="primary"
            text-color="grey-8"
            toggle-color="primary"
            toggle-text-color="white"
            unelevated
            dense
          />
        </div>
      </div>

      <!-- 網格視圖 -->
      <div v-if="viewMode === 'grid'" class="results-grid">
        <BookCard
          v-for="book in searchResults"
          :key="book.id"
          :book="book"
          @click="handleBookClick"
          @favorite="handleFavorite"
          @preview="handlePreview"
          @share="handleShare"
          class="result-item"
        />
      </div>

      <!-- 列表視圖 -->
      <div v-else class="results-list">
        <div
          v-for="book in searchResults"
          :key="book.id"
          class="book-list-item"
          @click="handleBookClick(book)"
        >
          <div class="book-list-content">
            <!-- 書籍封面 -->
            <div class="book-thumbnail">
              <q-img
                :src="book.thumbnail"
                :alt="book.title"
                ratio="3/4"
                class="thumbnail-image"
                spinner-color="primary"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-2">
                    <q-icon name="menu_book" size="30px" color="grey-5" />
                  </div>
                </template>
              </q-img>
            </div>

            <!-- 書籍資訊 -->
            <div class="book-info">
              <h6 class="book-title">{{ book.title }}</h6>
              <p v-if="book.subtitle" class="book-subtitle text-grey-7">{{ book.subtitle }}</p>

              <div class="book-meta">
                <div class="book-authors">
                  <q-icon name="person" size="16px" class="q-mr-xs" />
                  {{ formatAuthors(book.authors) }}
                </div>
                <div v-if="book.publisher" class="book-publisher">
                  <q-icon name="business" size="16px" class="q-mr-xs" />
                  {{ book.publisher }}
                </div>
                <div v-if="book.publishedDate" class="book-date">
                  <q-icon name="calendar_today" size="16px" class="q-mr-xs" />
                  {{ formatDate(book.publishedDate) }}
                </div>
              </div>

              <div v-if="book.description" class="book-description">
                {{ truncateDescription(book.description) }}
              </div>

              <!-- 評分和標籤 -->
              <div class="book-badges">
                <q-chip
                  v-if="book.averageRating > 0"
                  color="amber"
                  text-color="white"
                  size="sm"
                  icon="star"
                >
                  {{ book.averageRating.toFixed(1) }}
                </q-chip>

                <q-chip
                  v-if="book.pageCount > 0"
                  color="grey-4"
                  text-color="grey-8"
                  size="sm"
                  icon="chrome_reader_mode"
                >
                  {{ book.pageCount }} 頁
                </q-chip>

                <q-chip
                  v-if="book.isEbook"
                  color="green-4"
                  text-color="white"
                  size="sm"
                  icon="tablet"
                >
                  電子書
                </q-chip>

                <q-chip
                  v-for="category in limitedCategories(book.categories)"
                  :key="category"
                  color="primary"
                  text-color="white"
                  size="sm"
                >
                  {{ category }}
                </q-chip>
              </div>
            </div>

            <!-- 操作按鈕 -->
            <div class="book-actions">
              <q-btn
                flat
                round
                :icon="isBookFavorited(book.id) ? 'favorite' : 'favorite_border'"
                :color="isBookFavorited(book.id) ? 'red' : 'grey-6'"
                @click.stop="handleFavorite(book)"
              >
                <q-tooltip>{{ isBookFavorited(book.id) ? '從收藏移除' : '加入收藏' }}</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                icon="playlist_add"
                color="secondary"
                @click.stop="handleAddToReadingList(book)"
              >
                <q-tooltip>加入閱讀清單</q-tooltip>
              </q-btn>

              <q-btn flat round icon="visibility" color="primary" @click.stop="handlePreview(book)">
                <q-tooltip>預覽</q-tooltip>
              </q-btn>

              <q-btn flat round icon="share" color="grey-7" @click.stop="handleShare(book)">
                <q-tooltip>分享</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- 載入更多按鈕 -->
      <div v-if="hasMoreResults" class="load-more-container">
        <q-btn
          color="primary"
          label="載入更多"
          icon="expand_more"
          :loading="isLoadingMore"
          @click="handleLoadMore"
          unelevated
          size="lg"
        />
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else-if="hasSearched && !isSearching" class="empty-state">
      <div class="empty-content">
        <q-icon name="search_off" size="80px" color="grey-4" />
        <h4 class="text-grey-6 q-mt-md">沒有找到相關書籍</h4>
        <p class="text-grey-5">
          試試其他關鍵字，或者
          <q-btn flat color="primary" label="瀏覽推薦書籍" @click="$emit('browse-featured')" />
        </p>
      </div>
    </div>

    <!-- 初始狀態 -->
    <div v-else class="initial-state">
      <div class="initial-content">
        <q-icon name="search" size="80px" color="grey-4" />
        <h4 class="text-grey-6 q-mt-md">開始搜索您喜愛的書籍</h4>
        <p class="text-grey-5">輸入書名、作者或關鍵字來搜索</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useBookStore } from '../stores/bookStore'
import { useQuasar } from 'quasar'
import BookCard from '../components/BookCard.vue'

export default {
  name: 'SearchResults',
  components: {
    BookCard,
  },
  emits: ['book-click', 'browse-featured'],
  setup(props, { emit }) {
    const bookStore = useBookStore()
    const $q = useQuasar()

    // 響應式狀態
    const viewMode = ref('grid')
    const isLoadingMore = ref(false)

    // 從 store 獲取狀態
    const searchResults = computed(() => bookStore.searchResults)
    const totalItems = computed(() => bookStore.totalItems)
    const isSearching = computed(() => bookStore.isSearching)
    const searchQuery = computed(() => bookStore.searchQuery)
    const hasMoreResults = computed(() => bookStore.hasMoreResults)
    const hasSearched = computed(() => bookStore.searchQuery !== '')

    // 方法
    const formatAuthors = (authors) => {
      if (!authors || authors.length === 0) return '未知作者'
      if (authors.length === 1) return authors[0]
      if (authors.length === 2) return authors.join(' & ')
      return `${authors[0]} 等 ${authors.length} 人`
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.getFullYear().toString()
      } catch {
        return dateString.split('-')[0] || ''
      }
    }

    const truncateDescription = (description, maxLength = 200) => {
      if (!description) return ''
      const cleanText = description.replace(/<[^>]*>/g, '')
      return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText
    }

    const limitedCategories = (categories) => {
      return categories ? categories.slice(0, 2) : []
    }

    const isBookFavorited = (bookId) => {
      return bookStore.isBookFavorited(bookId)
    }

    const handleBookClick = (book) => {
      emit('book-click', book)
    }

    const handleFavorite = (book) => {
      bookStore.toggleFavorite(book)

      $q.notify({
        message: isBookFavorited(book.id)
          ? `已將《${book.title}》加入收藏`
          : `已將《${book.title}》從收藏移除`,
        icon: isBookFavorited(book.id) ? 'favorite' : 'favorite_border',
        color: isBookFavorited(book.id) ? 'positive' : 'info',
        position: 'bottom',
        timeout: 2000,
      })
    }

    const handleAddToReadingList = (book) => {
      bookStore.addToReadingList(book)

      $q.notify({
        message: `已將《${book.title}》加入閱讀清單`,
        icon: 'playlist_add',
        color: 'positive',
        position: 'bottom',
        timeout: 2000,
      })
    }

    const handlePreview = (book) => {
      if (book.previewLink) {
        window.open(book.previewLink, '_blank', 'noopener,noreferrer')
      } else {
        $q.notify({
          message: '此書籍暫無預覽功能',
          icon: 'warning',
          color: 'warning',
          position: 'bottom',
        })
      }
    }

    const handleShare = async (book) => {
      const shareData = {
        title: book.title,
        text: `推薦這本書：《${book.title}》by ${formatAuthors(book.authors)}`,
        url: book.infoLink || window.location.href,
      }

      if (navigator.share) {
        try {
          await navigator.share(shareData)
        } catch (err) {
          console.log('分享取消或失敗:', err)
        }
      } else {
        try {
          await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
          $q.notify({
            message: '書籍連結已複製到剪貼簿',
            icon: 'content_copy',
            color: 'positive',
            position: 'bottom',
          })
        } catch {
          $q.notify({
            message: '無法複製連結',
            icon: 'error',
            color: 'negative',
            position: 'bottom',
          })
        }
      }
    }

    const handleLoadMore = async () => {
      if (isLoadingMore.value || !hasMoreResults.value) return

      isLoadingMore.value = true
      try {
        await bookStore.loadMoreResults()
      } catch {
        $q.notify({
          message: '載入更多結果失敗',
          type: 'negative',
          position: 'bottom',
        })
      } finally {
        isLoadingMore.value = false
      }
    }

    return {
      // 響應式狀態
      viewMode,
      isLoadingMore,

      // 計算屬性
      searchResults,
      totalItems,
      isSearching,
      searchQuery,
      hasMoreResults,
      hasSearched,

      // 方法
      formatAuthors,
      formatDate,
      truncateDescription,
      limitedCategories,
      isBookFavorited,
      handleBookClick,
      handleFavorite,
      handleAddToReadingList,
      handlePreview,
      handleShare,
      handleLoadMore,
    }
  },
}
</script>

<style lang="scss" scoped>
.search-results {
  width: 100%;
  min-height: 400px;
}

.loading-state {
  position: relative;
  height: 300px;
  text-align: center;
}

.results-container {
  width: 100%;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.results-stats {
  flex: 1;
}

.results-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.results-count {
  margin: 0;
  font-size: 14px;
}

.search-query {
  font-weight: 600;
  color: #667eea;
}

.view-controls {
  flex-shrink: 0;
}

// 網格視圖
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.result-item {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

// 列表視圖
.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-list-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
}

.book-list-content {
  display: flex;
  padding: 20px;
  gap: 20px;
  align-items: flex-start;
}

.book-thumbnail {
  flex-shrink: 0;
  width: 80px;
}

.thumbnail-image {
  border-radius: 6px;
  overflow: hidden;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: #2d3748;
}

.book-subtitle {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.3;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #718096;

  > div {
    display: flex;
    align-items: center;
  }
}

.book-description {
  font-size: 14px;
  line-height: 1.5;
  color: #4a5568;
  margin-bottom: 12px;
}

.book-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.book-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

// 載入更多
.load-more-container {
  text-align: center;
  margin-top: 48px;
  padding: 24px 0;
}

// 空狀態和初始狀態
.empty-state,
.initial-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.empty-content,
.initial-content {
  max-width: 400px;
  padding: 40px 20px;
}

.empty-content h4,
.initial-content h4 {
  margin: 16px 0 12px 0;
  font-size: 20px;
}

.empty-content p,
.initial-content p {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

// 響應式設計
@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .book-list-content {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .book-thumbnail {
    width: 120px;
    align-self: center;
  }

  .book-actions {
    flex-direction: row;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .results-grid {
    grid-template-columns: 1fr;
  }

  .results-title {
    font-size: 20px;
  }
}
</style>
