// src/stores/bookStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  searchBooks,
  getBookById,
  getFeaturedBooks,
  searchBooksByAuthor,
  searchBooksByCategory,
} from '../services/bookApi'

export const useBookStore = defineStore('book', () => {
  // ===== 狀態 (State) =====

  // 搜尋相關狀態
  const searchQuery = ref('')
  const searchResults = ref([])
  const searchHistory = ref([])
  const currentSearchParams = ref({})

  // 分頁狀態
  const currentPage = ref(0)
  const totalItems = ref(0)
  const hasMoreResults = ref(false)

  // UI 狀態
  const isLoading = ref(false)
  const isSearching = ref(false)
  const error = ref(null)

  // 書籍詳情
  const selectedBook = ref(null)
  const isLoadingBookDetail = ref(false)

  // 推薦書籍
  const featuredBooks = ref([])
  const isFeaturedLoading = ref(false)

  // 過濾和排序
  const selectedCategory = ref('')
  const sortBy = ref('relevance')
  const priceFilter = ref('all') // all, free, paid

  // 使用者收藏 (使用 localStorage 模擬)
  const favorites = ref([])
  const readingList = ref([])

  // 統計數據
  const searchCount = ref(0)
  const lastSearchTime = ref(null)

  // ===== Getters (Computed) =====

  const filteredSearchResults = computed(() => {
    let results = searchResults.value

    // 價格篩選
    if (priceFilter.value === 'free') {
      results = results.filter(
        (book) => book.saleInfo?.isEbook && book.saleInfo?.saleability === 'FREE',
      )
    } else if (priceFilter.value === 'paid') {
      results = results.filter(
        (book) => book.saleInfo?.price && book.saleInfo?.saleability === 'FOR_SALE',
      )
    }

    return results
  })

  const hasSearchResults = computed(() => searchResults.value.length > 0)

  const searchResultsCount = computed(() => filteredSearchResults.value.length)

  const recentSearches = computed(() => searchHistory.value.slice(-10).reverse())

  const favoriteBooks = computed(() => favorites.value)

  const isBookFavorited = computed(
    () => (bookId) => favorites.value.some((book) => book.id === bookId),
  )

  const searchStats = computed(() => ({
    totalSearches: searchCount.value,
    lastSearch: lastSearchTime.value,
    favoriteCount: favorites.value.length,
    readingListCount: readingList.value.length,
  }))

  // ===== Actions =====

  /**
   * 執行書籍搜尋
   */
  const performSearch = async (query, options = {}) => {
    try {
      if (!query?.trim()) {
        throw new Error('請輸入搜尋關鍵字')
      }

      isSearching.value = true
      error.value = null

      const searchParams = {
        maxResults: 100,
        startIndex: 0,
        orderBy: sortBy.value,
        ...options,
      }

      console.log('🔍 開始搜尋:', query, searchParams)

      const result = await searchBooks(query.trim(), searchParams)

      // 更新搜尋結果
      searchResults.value = result.books
      totalItems.value = result.totalItems
      hasMoreResults.value = result.hasMore
      currentPage.value = 0

      // 更新搜尋狀態
      searchQuery.value = query.trim()
      currentSearchParams.value = { query: query.trim(), ...searchParams }

      // 加入搜尋歷史
      addToSearchHistory(query.trim())

      // 更新統計
      searchCount.value++
      lastSearchTime.value = new Date().toISOString()

      console.log('✅ 搜尋完成:', result.books.length, '本書籍')
    } catch (err) {
      console.error('❌ 搜尋失敗:', err.message)
      error.value = err.message
      searchResults.value = []
      totalItems.value = 0
      hasMoreResults.value = false
    } finally {
      isSearching.value = false
    }
  }

  /**
   * 載入更多搜尋結果 (分頁)
   */
  const loadMoreResults = async () => {
    if (!hasMoreResults.value || isSearching.value) return

    try {
      isSearching.value = true

      const nextStartIndex = (currentPage.value + 1) * currentSearchParams.value.maxResults
      const searchParams = {
        ...currentSearchParams.value,
        startIndex: nextStartIndex,
      }

      const result = await searchBooks(currentSearchParams.value.query, searchParams)

      // 附加到現有結果
      searchResults.value = [...searchResults.value, ...result.books]
      hasMoreResults.value = result.hasMore
      currentPage.value++

      console.log('📖 載入更多結果:', result.books.length, '本')
    } catch (err) {
      console.error('❌ 載入更多結果失敗:', err.message)
      error.value = err.message
    } finally {
      isSearching.value = false
    }
  }

  /**
   * 獲取書籍詳細資料
   */
  const fetchBookDetail = async (bookId) => {
    try {
      if (!bookId) throw new Error('書籍 ID 不能為空')

      isLoadingBookDetail.value = true
      error.value = null

      const book = await getBookById(bookId)
      selectedBook.value = book

      console.log('📚 載入書籍詳情:', book.title)
    } catch (err) {
      console.error('❌ 載入書籍詳情失敗:', err.message)
      error.value = err.message
      selectedBook.value = null
    } finally {
      isLoadingBookDetail.value = false
    }
  }

  /**
   * 載入推薦書籍
   */
  const loadFeaturedBooks = async (category = '') => {
    try {
      isFeaturedLoading.value = true
      error.value = null

      const result = await getFeaturedBooks(category)
      featuredBooks.value = result.books

      console.log('⭐ 載入推薦書籍:', result.books.length, '本')
    } catch (err) {
      console.error('❌ 載入推薦書籍失敗:', err.message)
      error.value = err.message
      featuredBooks.value = []
    } finally {
      isFeaturedLoading.value = false
    }
  }

  /**
   * 根據作者搜尋
   */
  const searchByAuthor = async (author) => {
    try {
      isLoading.value = true
      const result = await searchBooksByAuthor(author)
      searchResults.value = result.books
      totalItems.value = result.totalItems
      console.log('👨‍💼 作者搜尋結果:', result.books.length, '本')
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 根據分類搜尋
   */
  const searchByCategory = async (category) => {
    try {
      selectedCategory.value = category
      isLoading.value = true
      const result = await searchBooksByCategory(category)
      searchResults.value = result.books
      totalItems.value = result.totalItems
      console.log('📂 分類搜尋結果:', result.books.length, '本')
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 添加到搜尋歷史
   */
  const addToSearchHistory = (query) => {
    if (!searchHistory.value.includes(query)) {
      searchHistory.value.push(query)
      // 限制歷史記錄數量
      if (searchHistory.value.length > 50) {
        searchHistory.value = searchHistory.value.slice(-50)
      }
      saveToLocalStorage('searchHistory', searchHistory.value)
    }
  }

  /**
   * 清除搜尋歷史
   */
  const clearSearchHistory = () => {
    searchHistory.value = []
    removeFromLocalStorage('searchHistory')
  }

  /**
   * 添加到收藏
   */
  const addToFavorites = (book) => {
    if (!isBookFavorited.value(book.id)) {
      favorites.value.push(book)
      saveToLocalStorage('favorites', favorites.value)
      console.log('❤️ 已加入收藏:', book.title)
    }
  }

  /**
   * 從收藏移除
   */
  const removeFromFavorites = (bookId) => {
    const index = favorites.value.findIndex((book) => book.id === bookId)
    if (index > -1) {
      const removedBook = favorites.value.splice(index, 1)[0]
      saveToLocalStorage('favorites', favorites.value)
      console.log('💔 已從收藏移除:', removedBook.title)
    }
  }

  /**
   * 切換收藏狀態
   */
  const toggleFavorite = (book) => {
    if (isBookFavorited.value(book.id)) {
      removeFromFavorites(book.id)
    } else {
      addToFavorites(book)
    }
  }

  /**
   * 添加到閱讀清單
   */
  const addToReadingList = (book) => {
    if (!readingList.value.find((b) => b.id === book.id)) {
      readingList.value.push({
        ...book,
        addedAt: new Date().toISOString(),
      })
      saveToLocalStorage('readingList', readingList.value)
      console.log('📚 已加入閱讀清單:', book.title)
    }
  }

  /**
   * 從閱讀清單移除
   */
  const removeFromReadingList = (bookId) => {
    const index = readingList.value.findIndex((book) => book.id === bookId)
    if (index > -1) {
      readingList.value.splice(index, 1)
      saveToLocalStorage('readingList', readingList.value)
    }
  }

  /**
   * 清除搜尋結果
   */
  const clearSearchResults = () => {
    searchResults.value = []
    totalItems.value = 0
    hasMoreResults.value = false
    currentPage.value = 0
    searchQuery.value = ''
    error.value = null
  }

  /**
   * 重設所有狀態
   */
  const resetStore = () => {
    clearSearchResults()
    selectedBook.value = null
    featuredBooks.value = []
    error.value = null
    isLoading.value = false
    isSearching.value = false
  }

  // ===== LocalStorage 工具函數 =====

  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(`bookFinder_${key}`, JSON.stringify(data))
    } catch (err) {
      console.warn('無法儲存到 localStorage:', err.message)
    }
  }

  const loadFromLocalStorage = (key) => {
    try {
      const data = localStorage.getItem(`bookFinder_${key}`)
      return data ? JSON.parse(data) : null
    } catch (err) {
      console.warn('無法從 localStorage 載入:', err.message)
      return null
    }
  }

  const removeFromLocalStorage = (key) => {
    try {
      localStorage.removeItem(`bookFinder_${key}`)
    } catch (err) {
      console.warn('無法從 localStorage 移除:', err.message)
    }
  }

  // ===== 初始化 =====

  /**
   * 初始化 Store
   */
  const initializeStore = () => {
    // 從 localStorage 載入資料
    const savedFavorites = loadFromLocalStorage('favorites')
    if (savedFavorites) favorites.value = savedFavorites

    const savedReadingList = loadFromLocalStorage('readingList')
    if (savedReadingList) readingList.value = savedReadingList

    const savedSearchHistory = loadFromLocalStorage('searchHistory')
    if (savedSearchHistory) searchHistory.value = savedSearchHistory

    const savedStats = loadFromLocalStorage('stats')
    if (savedStats) {
      searchCount.value = savedStats.searchCount || 0
      lastSearchTime.value = savedStats.lastSearchTime
    }

    console.log('🚀 BookStore 初始化完成')
  }

  // 回傳所有狀態和方法
  return {
    // 狀態
    searchQuery,
    searchResults,
    searchHistory,
    currentPage,
    totalItems,
    hasMoreResults,
    isLoading,
    isSearching,
    error,
    selectedBook,
    isLoadingBookDetail,
    featuredBooks,
    isFeaturedLoading,
    selectedCategory,
    sortBy,
    priceFilter,
    favorites,
    readingList,
    searchCount,
    lastSearchTime,

    // Getters
    filteredSearchResults,
    hasSearchResults,
    searchResultsCount,
    recentSearches,
    favoriteBooks,
    isBookFavorited,
    searchStats,

    // Actions
    performSearch,
    loadMoreResults,
    fetchBookDetail,
    loadFeaturedBooks,
    searchByAuthor,
    searchByCategory,
    addToSearchHistory,
    clearSearchHistory,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    addToReadingList,
    removeFromReadingList,
    clearSearchResults,
    resetStore,
    initializeStore,
  }
})
