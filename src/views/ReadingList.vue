<template>
  <div class="reading-list-page">
    <div class="page-header">
      <h1 class="page-title">我的閱讀清單</h1>
      <p class="page-subtitle">管理您想要閱讀的書籍</p>
    </div>

    <div class="reading-list-content">
      <!-- 空狀態 -->
      <div v-if="readingList.length === 0" class="empty-state">
        <q-icon name="playlist_add" size="64px" color="grey-4" />
        <h3 class="text-grey-6">閱讀清單是空的</h3>
        <p class="text-grey-5">開始搜尋並加入您想要閱讀的書籍吧！</p>
        <q-btn color="primary" label="開始搜尋書籍" @click="$router.push('/')" unelevated />
      </div>

      <!-- 書籍清單 -->
      <div v-else class="books-grid">
        <div v-for="book in readingList" :key="book.id" class="book-item">
          <q-card class="book-card">
            <q-img :src="book.thumbnail" :alt="book.title" class="book-cover" ratio="3/4">
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-2">
                  <q-icon name="menu_book" size="40px" color="grey-5" />
                </div>
              </template>
            </q-img>

            <q-card-section>
              <div class="book-title text-weight-medium">{{ book.title }}</div>
              <div class="book-authors text-grey-7">{{ formatAuthors(book.authors) }}</div>
            </q-card-section>

            <q-card-actions>
              <q-btn flat color="primary" label="查看詳情" @click="viewBookDetails(book)" />
              <q-space />
              <q-btn flat color="negative" icon="remove" @click="removeFromReadingList(book)">
                <q-tooltip>從清單移除</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useBookStore } from '../stores/bookStore'
// 移除未使用的 useRouter 匯入
// import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export default {
  name: 'ReadingListPage',
  setup() {
    const bookStore = useBookStore()
    // 移除未使用的 router 變數
    // const router = useRouter()
    const $q = useQuasar()

    const readingList = computed(() => bookStore.readingList || [])

    const formatAuthors = (authors) => {
      if (!authors || authors.length === 0) return '未知作者'
      if (authors.length === 1) return authors[0]
      if (authors.length === 2) return authors.join(' & ')
      return `${authors[0]} 等 ${authors.length} 人`
    }

    const viewBookDetails = (book) => {
      // 這裡可以導航到書籍詳情頁面
      console.log('查看書籍詳情:', book)
    }

    const removeFromReadingList = (book) => {
      bookStore.removeFromReadingList(book.id)
      $q.notify({
        message: `已將《${book.title}》從閱讀清單移除`,
        icon: 'playlist_remove',
        color: 'info',
        position: 'bottom',
        timeout: 2000,
      })
    }

    return {
      readingList,
      formatAuthors,
      viewBookDetails,
      removeFromReadingList,
    }
  },
}
</script>

<style scoped>
.reading-list-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
}

.empty-state h3 {
  margin: 24px 0 12px 0;
  font-size: 20px;
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.book-card {
  transition: transform 0.2s ease;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-cover {
  height: 300px;
}

.book-title {
  font-size: 16px;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2; /* 添加標準屬性 */
  overflow: hidden;
}

.book-authors {
  font-size: 14px;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .reading-list-page {
    padding: 16px;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>
