<template>
  <q-card
    class="book-card cursor-pointer"
    :class="{ 'book-card--favorited': isFavorited }"
    @click="$emit('click', book)"
    flat
    bordered
  >
    <!-- 書籍封面 -->
    <div class="book-cover-container">
      <q-img
        :src="book.thumbnail"
        :alt="book.title"
        class="book-cover"
        spinner-color="primary"
        no-spinner
        @error="onImageError"
      >
        <!-- 載入失敗時的預設圖片 -->
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-grey-2">
            <q-icon name="menu_book" size="40px" color="grey-5" />
          </div>
        </template>

        <!-- 載入中的動畫 -->
        <template v-slot:loading>
          <div class="absolute-full flex flex-center bg-grey-1">
            <q-spinner-cube color="primary" size="30px" />
          </div>
        </template>
      </q-img>

      <!-- 評分標籤 -->
      <div v-if="book.averageRating > 0" class="rating-badge">
        <q-icon name="star" color="amber" size="14px" />
        <span class="text-weight-medium">{{ book.averageRating.toFixed(1) }}</span>
      </div>

      <!-- 收藏按鈕 -->
      <q-btn
        :icon="isFavorited ? 'favorite' : 'favorite_border'"
        :color="isFavorited ? 'red' : 'grey-6'"
        class="favorite-btn"
        size="sm"
        round
        unelevated
        @click.stop="toggleFavorite"
      >
        <q-tooltip class="bg-dark">
          {{ isFavorited ? '從收藏移除' : '加入收藏' }}
        </q-tooltip>
      </q-btn>

      <!-- 價格標籤 -->
      <div v-if="book.price" class="price-badge">
        {{ formatPrice(book.price) }}
      </div>

      <!-- 免費電子書標籤 -->
      <div v-else-if="book.saleability === 'FREE'" class="free-badge">免費</div>
    </div>

    <!-- 書籍資訊 -->
    <q-card-section class="book-info">
      <!-- 標題 -->
      <div class="book-title text-weight-medium ellipsis-2-lines">
        {{ book.title }}
      </div>

      <!-- 副標題 -->
      <div v-if="book.subtitle" class="book-subtitle text-grey-7 ellipsis q-mt-xs">
        {{ book.subtitle }}
      </div>

      <!-- 作者 -->
      <div class="book-authors text-grey-8 q-mt-sm">
        <q-icon name="person" size="16px" class="q-mr-xs" />
        <span class="ellipsis">{{ formatAuthors(book.authors) }}</span>
      </div>

      <!-- 出版資訊 -->
      <div class="book-meta text-grey-6 text-caption q-mt-sm">
        <div v-if="book.publisher" class="ellipsis">
          <q-icon name="business" size="14px" class="q-mr-xs" />
          {{ book.publisher }}
        </div>
        <div v-if="book.publishedDate" class="q-mt-xs">
          <q-icon name="calendar_today" size="14px" class="q-mr-xs" />
          {{ formatDate(book.publishedDate) }}
        </div>
      </div>

      <!-- 描述預覽 -->
      <div
        v-if="book.description"
        class="book-description text-grey-7 text-caption q-mt-sm ellipsis-3-lines"
      >
        {{ stripHtml(book.description) }}
      </div>

      <!-- 標籤 -->
      <div class="book-tags q-mt-sm">
        <q-chip
          v-for="category in limitedCategories"
          :key="category"
          size="sm"
          color="primary"
          text-color="white"
          dense
          class="q-mr-xs q-mb-xs"
        >
          {{ category }}
        </q-chip>

        <!-- 頁數標籤 -->
        <q-chip
          v-if="book.pageCount > 0"
          size="sm"
          color="grey-4"
          text-color="grey-8"
          dense
          icon="chrome_reader_mode"
          class="q-mr-xs q-mb-xs"
        >
          {{ book.pageCount }} 頁
        </q-chip>

        <!-- 電子書標籤 -->
        <q-chip
          v-if="book.isEbook"
          size="sm"
          color="green-4"
          text-color="white"
          dense
          icon="tablet"
          class="q-mr-xs q-mb-xs"
        >
          電子書
        </q-chip>
      </div>
    </q-card-section>

    <!-- 底部操作按鈕 -->
    <q-card-actions class="book-actions">
      <q-btn
        color="primary"
        flat
        dense
        icon="visibility"
        label="預覽"
        class="text-caption"
        @click.stop="openPreview"
      />

      <q-btn
        color="secondary"
        flat
        dense
        icon="add_to_photos"
        label="加入清單"
        class="text-caption"
        @click.stop="addToReadingList"
      />

      <q-space />

      <!-- 更多選項 -->
      <q-btn flat dense round icon="more_vert" @click.stop="showMoreOptions = !showMoreOptions">
        <q-menu v-model="showMoreOptions">
          <q-list dense>
            <q-item clickable @click="shareBook">
              <q-item-section avatar>
                <q-icon name="share" />
              </q-item-section>
              <q-item-section>分享書籍</q-item-section>
            </q-item>

            <q-item clickable @click="viewOnGoogle">
              <q-item-section avatar>
                <q-icon name="open_in_new" />
              </q-item-section>
              <q-item-section>在 Google 圖書查看</q-item-section>
            </q-item>

            <q-item v-if="book.previewLink" clickable @click="openPreview">
              <q-item-section avatar>
                <q-icon name="preview" />
              </q-item-section>
              <q-item-section>線上預覽</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
import { ref, computed } from 'vue'
import { useBookStore } from '../stores/bookStore'
import { useQuasar } from 'quasar'

export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    compact: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click', 'favorite', 'preview', 'share'],
  setup(props, { emit }) {
    const bookStore = useBookStore()
    const $q = useQuasar()

    // 響應式狀態
    const showMoreOptions = ref(false)
    const imageError = ref(false)

    // 計算屬性
    const isFavorited = computed(() => bookStore.isBookFavorited(props.book.id))

    const limitedCategories = computed(() => props.book.categories?.slice(0, 2) || [])

    // 方法
    const toggleFavorite = () => {
      bookStore.toggleFavorite(props.book)
      emit('favorite', props.book, !isFavorited.value)

      $q.notify({
        message: isFavorited.value
          ? `已將《${props.book.title}》加入收藏`
          : `已將《${props.book.title}》從收藏移除`,
        icon: isFavorited.value ? 'favorite' : 'favorite_border',
        color: isFavorited.value ? 'positive' : 'info',
        position: 'bottom',
        timeout: 2000,
      })
    }

    const addToReadingList = () => {
      bookStore.addToReadingList(props.book)

      $q.notify({
        message: `已將《${props.book.title}》加入閱讀清單`,
        icon: 'playlist_add',
        color: 'positive',
        position: 'bottom',
        timeout: 2000,
      })
    }

    const openPreview = () => {
      if (props.book.previewLink) {
        window.open(props.book.previewLink, '_blank', 'noopener,noreferrer')
        emit('preview', props.book)
      } else {
        $q.notify({
          message: '此書籍暫無預覽功能',
          icon: 'warning',
          color: 'warning',
          position: 'bottom',
        })
      }
    }

    const viewOnGoogle = () => {
      const url = props.book.infoLink || `https://books.google.com/books?id=${props.book.id}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    const shareBook = async () => {
      const shareData = {
        title: props.book.title,
        text: `推薦這本書：《${props.book.title}》by ${formatAuthors(props.book.authors)}`,
        url: props.book.infoLink || window.location.href,
      }

      if (navigator.share) {
        try {
          await navigator.share(shareData)
          emit('share', props.book)
        } catch (err) {
          console.log('分享取消或失敗:', err)
        }
      } else {
        // 備用方案：複製到剪貼簿
        try {
          await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
          $q.notify({
            message: '書籍連結已複製到剪貼簿',
            icon: 'content_copy',
            color: 'positive',
            position: 'bottom',
          })
          emit('share', props.book)
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

    const onImageError = () => {
      imageError.value = true
    }

    // 工具函數
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

    const formatPrice = (price) => {
      if (!price || !price.amount) return ''

      const currency =
        price.currencyCode === 'USD'
          ? '$'
          : price.currencyCode === 'TWD'
            ? 'NT$'
            : price.currencyCode

      return `${currency}${price.amount}`
    }

    const stripHtml = (html) => {
      if (!html) return ''
      return html.replace(/<[^>]*>/g, '').trim()
    }

    return {
      // 響應式狀態
      showMoreOptions,
      imageError,

      // 計算屬性
      isFavorited,
      limitedCategories,

      // 方法
      toggleFavorite,
      addToReadingList,
      openPreview,
      viewOnGoogle,
      shareBook,
      onImageError,
      formatAuthors,
      formatDate,
      formatPrice,
      stripHtml,
    }
  },
}
</script>

<style lang="scss" scoped>
.book-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  background: white;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &--favorited {
    border: 2px solid #f44336;

    .favorite-btn {
      background: rgba(244, 67, 54, 0.1);
    }
  }
}

.book-cover-container {
  position: relative;

  .book-cover {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  .rating-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }

  .favorite-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
  }

  .price-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: #4caf50;
    color: white;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .free-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: #ff9800;
    color: white;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }
}

.book-info {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  .book-title {
    font-size: 16px;
    line-height: 1.4;
    color: #2d3748;
    margin-bottom: 4px;
  }

  .book-subtitle {
    font-size: 14px;
    line-height: 1.3;
    margin-bottom: 8px;
  }

  .book-authors {
    font-size: 14px;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .book-meta {
    margin-bottom: 8px;

    > div {
      display: flex;
      align-items: center;
      margin-bottom: 2px;
    }
  }

  .book-description {
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 12px;
    flex-grow: 1;
  }

  .book-tags {
    margin-top: auto;
  }
}

.book-actions {
  padding: 8px 16px 12px;
  background: rgba(0, 0, 0, 0.02);

  .q-btn {
    min-width: auto;
  }
}

// 多行省略號工具類
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2; // 添加標準屬性
  overflow: hidden;
}

.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3; // 添加標準屬性
  overflow: hidden;
}

// 響應式設計
@media (max-width: 768px) {
  .book-cover-container .book-cover {
    height: 200px;
  }

  .book-info {
    padding: 12px;

    .book-title {
      font-size: 15px;
    }
  }

  .book-actions {
    padding: 6px 12px 10px;

    .q-btn {
      font-size: 11px;
      padding: 4px 8px;
    }
  }
}
</style>
