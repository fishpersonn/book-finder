// src/services/bookApi.js
import axios from 'axios'

// Google Books API 基礎設定
const API_BASE_URL = 'https://www.googleapis.com/books/v1'
const DEFAULT_MAX_RESULTS = 40

// 創建 axios 實例
const bookApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器 - 添加載入狀態
bookApi.interceptors.request.use(
  (config) => {
    console.log('📡 發送 API 請求:', config.url)
    return config
  },
  (error) => {
    console.error('❌ 請求錯誤:', error)
    return Promise.reject(error)
  },
)

// 響應攔截器 - 處理錯誤
bookApi.interceptors.response.use(
  (response) => {
    console.log('✅ API 響應成功:', response.config.url)
    return response
  },
  (error) => {
    console.error('❌ API 響應錯誤:', error.message)

    // 處理不同類型的錯誤
    if (error.code === 'ECONNABORTED') {
      throw new Error('請求超時，請檢查網路連線')
    }

    if (error.response?.status === 403) {
      throw new Error('API 配額已用完，請稍後再試')
    }

    if (error.response?.status >= 500) {
      throw new Error('伺服器錯誤，請稍後再試')
    }

    throw new Error('網路錯誤，請檢查連線')
  },
)

/**
 * 搜尋書籍
 * @param {string} query - 搜尋關鍵字
 * @param {Object} options - 搜尋選項
 * @returns {Promise<Object>} 搜尋結果
 */
export const searchBooks = async (query, options = {}) => {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('請輸入搜尋關鍵字')
    }

    const {
      maxResults = DEFAULT_MAX_RESULTS,
      startIndex = 0,
      orderBy = 'relevance', // relevance, newest
      filter = 'ebooks', // partial, full, free-ebooks, paid-ebooks, ebooks
      langRestrict = 'zh-TW', // 語言限制
      printType = 'all', // all, books, magazines
    } = options

    const params = {
      q: encodeURIComponent(query.trim()),
      maxResults,
      startIndex,
      orderBy,
      filter,
      printType,
      langRestrict,
    }

    const response = await bookApi.get('/volumes', { params })

    return {
      books: formatBooksData(response.data.items || []),
      totalItems: response.data.totalItems || 0,
      hasMore: startIndex + maxResults < (response.data.totalItems || 0),
    }
  } catch (error) {
    console.error('🔍 搜尋書籍失敗:', error.message)
    throw error
  }
}

/**
 * 根據 ID 獲取書籍詳細資訊
 * @param {string} bookId - 書籍 ID
 * @returns {Promise<Object>} 書籍詳細資料
 */
export const getBookById = async (bookId) => {
  try {
    if (!bookId) {
      throw new Error('書籍 ID 不能為空')
    }

    const response = await bookApi.get(`/volumes/${bookId}`)
    return formatBookData(response.data)
  } catch (error) {
    console.error('📖 獲取書籍詳情失敗:', error.message)
    throw error
  }
}

/**
 * 獲取熱門/推薦書籍
 * @param {string} category - 書籍分類
 * @returns {Promise<Object>} 推薦書籍列表
 */
export const getFeaturedBooks = async (category = '程式設計') => {
  try {
    const categories = [
      '程式設計',
      '人工智能',
      'JavaScript',
      'Python',
      'Vue.js',
      '小說',
      '商業管理',
      '自我成長',
      '歷史',
      '科學',
    ]

    const randomCategory = categories[Math.floor(Math.random() * categories.length)]

    return await searchBooks(category || randomCategory, {
      maxResults: 12,
      orderBy: 'relevance',
    })
  } catch (error) {
    console.error('⭐ 獲取推薦書籍失敗:', error.message)
    throw error
  }
}

/**
 * 根據作者搜尋書籍
 * @param {string} author - 作者名稱
 * @returns {Promise<Object>} 作者的書籍列表
 */
export const searchBooksByAuthor = async (author) => {
  return await searchBooks(`inauthor:${author}`, {
    maxResults: 20,
    orderBy: 'newest',
  })
}

/**
 * 根據分類搜尋書籍
 * @param {string} category - 書籍分類
 * @returns {Promise<Object>} 分類書籍列表
 */
export const searchBooksByCategory = async (category) => {
  return await searchBooks(`subject:${category}`, {
    maxResults: 20,
    orderBy: 'newest',
  })
}

/**
 * 格式化書籍資料陣列
 * @param {Array} books - 原始書籍資料
 * @returns {Array} 格式化後的書籍資料
 */
const formatBooksData = (books) => {
  return books.map(formatBookData).filter((book) => book.title && book.id)
}

/**
 * 格式化單本書籍資料
 * @param {Object} book - 原始書籍資料
 * @returns {Object} 格式化後的書籍資料
 */
const formatBookData = (book) => {
  const volumeInfo = book.volumeInfo || {}
  const saleInfo = book.saleInfo || {}

  return {
    id: book.id,
    title: volumeInfo.title || '未知標題',
    subtitle: volumeInfo.subtitle || '',
    authors: volumeInfo.authors || ['未知作者'],
    publisher: volumeInfo.publisher || '未知出版社',
    publishedDate: volumeInfo.publishedDate || '',
    description: volumeInfo.description || '暫無描述',
    pageCount: volumeInfo.pageCount || 0,
    categories: volumeInfo.categories || ['其他'],
    averageRating: volumeInfo.averageRating || 0,
    ratingsCount: volumeInfo.ratingsCount || 0,
    language: volumeInfo.language || 'zh',

    // 圖片處理
    thumbnail: getThumbnailUrl(volumeInfo.imageLinks),
    smallThumbnail: getSmallThumbnailUrl(volumeInfo.imageLinks),

    // 價格和購買資訊
    saleability: saleInfo.saleability || 'NOT_FOR_SALE',
    isEbook: saleInfo.isEbook || false,
    price: saleInfo.retailPrice
      ? {
          amount: saleInfo.retailPrice.amount,
          currencyCode: saleInfo.retailPrice.currencyCode,
        }
      : null,

    // 預覽連結
    previewLink: volumeInfo.previewLink || '',
    infoLink: volumeInfo.infoLink || '',
    canonicalVolumeLink: volumeInfo.canonicalVolumeLink || '',

    // 添加時間戳記用於排序
    timestamp: Date.now(),
  }
}

/**
 * 獲取縮圖 URL (高解析度)
 */
const getThumbnailUrl = (imageLinks) => {
  if (!imageLinks) return '/placeholder-book.jpg'

  // 優先順序：large > medium > thumbnail > smallThumbnail
  return (
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail ||
    '/placeholder-book.jpg'
  )
}

/**
 * 獲取小縮圖 URL
 */
const getSmallThumbnailUrl = (imageLinks) => {
  if (!imageLinks) return '/placeholder-book-small.jpg'

  return imageLinks.smallThumbnail || imageLinks.thumbnail || '/placeholder-book-small.jpg'
}

// 書籍分類常數
export const BOOK_CATEGORIES = [
  { label: '全部', value: '' },
  { label: '程式設計', value: 'programming' },
  { label: '小說', value: 'fiction' },
  { label: '商業管理', value: 'business' },
  { label: '自我成長', value: 'self-help' },
  { label: '科學', value: 'science' },
  { label: '歷史', value: 'history' },
  { label: '藝術', value: 'art' },
  { label: '料理', value: 'cooking' },
  { label: '旅遊', value: 'travel' },
  { label: '健康', value: 'health' },
]

// 排序選項常數
export const SORT_OPTIONS = [
  { label: '相關性', value: 'relevance' },
  { label: '最新', value: 'newest' },
]
