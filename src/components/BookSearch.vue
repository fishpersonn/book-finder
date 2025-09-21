<template>
  <div class="book-search">
    <!-- 主要搜索區域 -->
    <div class="search-main">
      <q-input
        ref="searchInputRef"
        v-model="localSearchQuery"
        class="search-input"
        placeholder="搜尋書名、作者、ISBN 或關鍵字..."
        outlined
        clearable
        bg-color="white"
        @keyup.enter="handleSearch"
        @clear="clearSearch"
        @focus="showSuggestions = true"
        @blur="hideSuggestionsDelayed"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="primary" />
        </template>

        <template v-slot:append>
          <q-btn
            color="primary"
            icon="search"
            label="搜索"
            unelevated
            @click="handleSearch"
            :loading="isSearching"
            :disable="!localSearchQuery?.trim()"
            class="search-btn"
          />
        </template>
      </q-input>

      <!-- 搜索建議下拉選單 -->
      <q-card
        v-show="showSuggestions && (recentSearches.length > 0 || searchSuggestions.length > 0)"
        class="search-suggestions"
        flat
        bordered
      >
        <!-- 搜索歷史 -->
        <div v-if="recentSearches.length > 0" class="suggestion-section">
          <div class="suggestion-header">
            <q-icon name="history" color="grey-6" size="18px" />
            <span class="text-grey-7">最近搜索</span>
            <q-space />
            <q-btn flat dense size="sm" color="grey-6" icon="clear_all" @click="clearSearchHistory">
              <q-tooltip>清除歷史</q-tooltip>
            </q-btn>
          </div>

          <q-list dense>
            <q-item
              v-for="(search, index) in recentSearches.slice(0, 5)"
              :key="index"
              clickable
              @click="selectSuggestion(search)"
            >
              <q-item-section avatar>
                <q-icon name="history" color="grey-5" size="16px" />
              </q-item-section>
              <q-item-section>
                <span class="text-grey-8">{{ search }}</span>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  dense
                  size="xs"
                  icon="close"
                  color="grey-5"
                  @click.stop="removeFromHistory(search)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 搜索建議 -->
        <div v-if="searchSuggestions.length > 0" class="suggestion-section">
          <div class="suggestion-header">
            <q-icon name="lightbulb" color="amber" size="18px" />
            <span class="text-grey-7">建議搜索</span>
          </div>

          <q-list dense>
            <q-item
              v-for="(suggestion, index) in searchSuggestions"
              :key="index"
              clickable
              @click="selectSuggestion(suggestion)"
            >
              <q-item-section avatar>
                <q-icon name="search" color="primary" size="16px" />
              </q-item-section>
              <q-item-section>
                <span>{{ suggestion }}</span>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card>
    </div>

    <!-- 進階搜索和篩選 -->
    <div class="search-filters" :class="{ 'filters-expanded': showAdvanced }">
      <!-- 篩選選項切換 -->
      <div class="filter-toggle">
        <q-btn
          flat
          :label="showAdvanced ? '隱藏篩選' : '進階篩選'"
          :icon="showAdvanced ? 'expand_less' : 'tune'"
          color="primary"
          size="sm"
          @click="showAdvanced = !showAdvanced"
        />

        <!-- 快速篩選標籤 -->
        <div class="quick-filters">
          <q-chip
            v-for="category in popularCategories"
            :key="category.value"
            :selected="selectedCategory === category.value"
            clickable
            color="primary"
            size="sm"
            @click="selectCategory(category.value)"
          >
            {{ category.label }}
          </q-chip>
        </div>
      </div>

      <!-- 進階篩選面板 -->
      <q-slide-transition>
        <div v-show="showAdvanced" class="advanced-filters">
          <q-card flat class="q-pa-md">
            <div class="row q-gutter-md">
              <!-- 排序方式 -->
              <div class="col-12 col-md-3">
                <q-select
                  v-model="sortBy"
                  :options="sortOptions"
                  label="排序方式"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <!-- 書籍類型 -->
              <div class="col-12 col-md-3">
                <q-select
                  v-model="bookType"
                  :options="bookTypeOptions"
                  label="書籍類型"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <!-- 價格篩選 -->
              <div class="col-12 col-md-3">
                <q-select
                  v-model="priceFilter"
                  :options="priceOptions"
                  label="價格篩選"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <!-- 語言 -->
              <div class="col-12 col-md-3">
                <q-select
                  v-model="language"
                  :options="languageOptions"
                  label="語言"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>

            <!-- 評分篩選 -->
            <div class="row q-mt-md">
              <div class="col-12 col-md-6">
                <q-range
                  v-model="ratingRange"
                  :min="0"
                  :max="5"
                  :step="0.5"
                  label
                  label-always
                  color="amber"
                  class="q-mt-md"
                />
                <div class="text-caption text-grey-7 q-mt-xs">
                  評分範圍: {{ ratingRange.min }} - {{ ratingRange.max }} 星
                </div>
              </div>

              <!-- 出版年份 -->
              <div class="col-12 col-md-6">
                <q-range
                  v-model="yearRange"
                  :min="1900"
                  :max="currentYear"
                  label
                  label-always
                  color="primary"
                  class="q-mt-md"
                />
                <div class="text-caption text-grey-7 q-mt-xs">
                  出版年份: {{ yearRange.min }} - {{ yearRange.max }}
                </div>
              </div>
            </div>

            <!-- 篩選操作按鈕 -->
            <div class="row q-mt-lg">
              <q-space />
              <q-btn flat color="grey-7" label="重置篩選" @click="resetFilters" />
              <q-btn
                color="primary"
                label="套用篩選"
                unelevated
                class="q-ml-sm"
                @click="applyFilters"
              />
            </div>
          </q-card>
        </div>
      </q-slide-transition>
    </div>

    <!-- 搜索統計 -->
    <div v-if="searchResults.length > 0 || hasSearched" class="search-stats">
      <div class="stats-info">
        <span v-if="isSearching" class="text-grey-7">
          <q-spinner-dots size="16px" class="q-mr-xs" />
          搜索中...
        </span>
        <span v-else-if="searchResults.length > 0" class="text-grey-7">
          找到 {{ totalItems.toLocaleString() }} 本書籍
          <span v-if="searchQuery">"{{ searchQuery }}"</span>
          的結果
          <span class="text-caption">({{ (searchTime / 1000).toFixed(2) }} 秒)</span>
        </span>
        <span v-else-if="hasSearched" class="text-grey-7"> 沒有找到符合條件的書籍 </span>
      </div>

      <!-- 當前篩選標籤 -->
      <div v-if="activeFilters.length > 0" class="active-filters">
        <q-chip
          v-for="filter in activeFilters"
          :key="filter.key"
          removable
          color="primary"
          text-color="white"
          size="sm"
          @remove="removeFilter(filter.key)"
        >
          {{ filter.label }}: {{ filter.value }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useBookStore } from '../stores/bookStore'
import { BOOK_CATEGORIES, SORT_OPTIONS } from '../services/bookApi'
import { useQuasar } from 'quasar'
import { useDebounceFn } from '@vueuse/core'

export default {
  name: 'BookSearch',
  emits: ['search', 'filter-change'],
  setup(props, { emit }) {
    const bookStore = useBookStore()
    const $q = useQuasar()

    // 響應式狀態
    const searchInputRef = ref(null)
    const localSearchQuery = ref('')
    const showSuggestions = ref(false)
    const showAdvanced = ref(false)
    const hasSearched = ref(false)
    const searchTime = ref(0)
    let hideTimeout = null

    // 篩選狀態
    const selectedCategory = ref('')
    const sortBy = ref('relevance')
    const bookType = ref('all')
    const priceFilter = ref('all')
    const language = ref('zh-TW')
    const ratingRange = ref({ min: 0, max: 5 })
    const yearRange = ref({ min: 1900, max: new Date().getFullYear() })

    // 從 store 取得狀態
    const { searchResults, totalItems, isSearching, recentSearches, searchQuery } = bookStore

    // 計算屬性
    const currentYear = computed(() => new Date().getFullYear())

    const searchSuggestions = computed(() => {
      if (!localSearchQuery.value || localSearchQuery.value.length < 2) return []

      // 基於當前輸入生成建議
      const suggestions = [
        `${localSearchQuery.value} 入門`,
        `${localSearchQuery.value} 進階`,
        `${localSearchQuery.value} 實戰`,
        `${localSearchQuery.value} 教學`,
      ]

      return suggestions
    })

    const activeFilters = computed(() => {
      const filters = []

      if (selectedCategory.value) {
        const category = popularCategories.find((c) => c.value === selectedCategory.value)
        filters.push({
          key: 'category',
          label: '分類',
          value: category?.label || selectedCategory.value,
        })
      }

      if (sortBy.value !== 'relevance') {
        const sort = sortOptions.find((s) => s.value === sortBy.value)
        filters.push({
          key: 'sort',
          label: '排序',
          value: sort?.label || sortBy.value,
        })
      }

      if (bookType.value !== 'all') {
        const type = bookTypeOptions.find((t) => t.value === bookType.value)
        filters.push({
          key: 'bookType',
          label: '類型',
          value: type?.label || bookType.value,
        })
      }

      if (priceFilter.value !== 'all') {
        const price = priceOptions.find((p) => p.value === priceFilter.value)
        filters.push({
          key: 'price',
          label: '價格',
          value: price?.label || priceFilter.value,
        })
      }

      if (ratingRange.value.min > 0 || ratingRange.value.max < 5) {
        filters.push({
          key: 'rating',
          label: '評分',
          value: `${ratingRange.value.min}-${ratingRange.value.max} 星`,
        })
      }

      return filters
    })

    // 選項配置
    const popularCategories = BOOK_CATEGORIES.slice(0, 8)

    const sortOptions = [
      { label: '相關性', value: 'relevance' },
      { label: '最新發布', value: 'newest' },
      { label: '評分最高', value: 'rating' },
      { label: '價格低到高', value: 'price_asc' },
      { label: '價格高到低', value: 'price_desc' },
    ]

    const bookTypeOptions = [
      { label: '全部類型', value: 'all' },
      { label: '電子書', value: 'ebooks' },
      { label: '實體書', value: 'books' },
      { label: '免費電子書', value: 'free-ebooks' },
      { label: '付費電子書', value: 'paid-ebooks' },
    ]

    const priceOptions = [
      { label: '全部價格', value: 'all' },
      { label: '免費', value: 'free' },
      { label: '付費', value: 'paid' },
      { label: '低於 $10', value: 'under10' },
      { label: '低於 $20', value: 'under20' },
    ]

    const languageOptions = [
      { label: '繁體中文', value: 'zh-TW' },
      { label: '簡體中文', value: 'zh-CN' },
      { label: '英文', value: 'en' },
      { label: '日文', value: 'ja' },
      { label: '韓文', value: 'ko' },
      { label: '全部語言', value: '' },
    ]

    // 防抖搜索
    const debouncedSearch = useDebounceFn(async (query, options = {}) => {
      if (!query.trim()) return

      const startTime = Date.now()
      hasSearched.value = true

      try {
        await bookStore.performSearch(query, options)
        searchTime.value = Date.now() - startTime
        emit('search', { query, options, results: bookStore.searchResults })
      } catch (error) {
        $q.notify({
          message: `搜索失敗: ${error.message}`,
          type: 'negative',
          position: 'bottom',
        })
      }
    }, 300)

    // 方法
    const handleSearch = async () => {
      if (!localSearchQuery.value?.trim()) {
        $q.notify({
          message: '請輸入搜索關鍵字',
          type: 'warning',
          position: 'bottom',
        })
        return
      }

      showSuggestions.value = false

      const searchOptions = buildSearchOptions()
      await debouncedSearch(localSearchQuery.value.trim(), searchOptions)
    }

    const buildSearchOptions = () => {
      const options = {
        maxResults: 40,
        orderBy: sortBy.value === 'relevance' ? 'relevance' : 'newest',
      }

      if (bookType.value !== 'all') {
        options.filter = bookType.value
      }

      if (language.value) {
        options.langRestrict = language.value
      }

      return options
    }

    const selectSuggestion = (suggestion) => {
      localSearchQuery.value = suggestion
      showSuggestions.value = false
      handleSearch()
    }

    const selectCategory = async (category) => {
      selectedCategory.value = selectedCategory.value === category ? '' : category

      if (selectedCategory.value) {
        const searchOptions = buildSearchOptions()
        await debouncedSearch(selectedCategory.value, searchOptions)
      }

      emit('filter-change', { category: selectedCategory.value })
    }

    const clearSearch = () => {
      localSearchQuery.value = ''
      bookStore.clearSearchResults()
      hasSearched.value = false
      showSuggestions.value = false
    }

    const clearSearchHistory = () => {
      bookStore.clearSearchHistory()
      $q.notify({
        message: '搜索歷史已清除',
        type: 'positive',
        position: 'bottom',
      })
    }

    const removeFromHistory = (search) => {
      // 實作從歷史中移除特定搜索
      const index = bookStore.searchHistory.indexOf(search)
      if (index > -1) {
        bookStore.searchHistory.splice(index, 1)
      }
    }

    const hideSuggestionsDelayed = () => {
      hideTimeout = setTimeout(() => {
        showSuggestions.value = false
      }, 200)
    }

    const resetFilters = () => {
      selectedCategory.value = ''
      sortBy.value = 'relevance'
      bookType.value = 'all'
      priceFilter.value = 'all'
      language.value = 'zh-TW'
      ratingRange.value = { min: 0, max: 5 }
      yearRange.value = { min: 1900, max: currentYear.value }

      $q.notify({
        message: '篩選條件已重置',
        type: 'info',
        position: 'bottom',
      })
    }

    const applyFilters = async () => {
      if (localSearchQuery.value?.trim()) {
        const searchOptions = buildSearchOptions()
        await debouncedSearch(localSearchQuery.value.trim(), searchOptions)
      }

      showAdvanced.value = false
      emit('filter-change', {
        category: selectedCategory.value,
        sortBy: sortBy.value,
        bookType: bookType.value,
        priceFilter: priceFilter.value,
        language: language.value,
        ratingRange: ratingRange.value,
        yearRange: yearRange.value,
      })
    }

    const removeFilter = (filterKey) => {
      switch (filterKey) {
        case 'category':
          selectedCategory.value = ''
          break
        case 'sort':
          sortBy.value = 'relevance'
          break
        case 'bookType':
          bookType.value = 'all'
          break
        case 'price':
          priceFilter.value = 'all'
          break
        case 'rating':
          ratingRange.value = { min: 0, max: 5 }
          break
        default:
          break
      }

      applyFilters()
    }

    const focusSearchInput = () => {
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }

    // 監聽器
    watch(
      () => bookStore.searchQuery,
      (newQuery) => {
        if (newQuery !== localSearchQuery.value) {
          localSearchQuery.value = newQuery
        }
      },
    )

    // 清除定時器
    watch(showSuggestions, (show) => {
      if (show && hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }
    })

    // 生命周期
    onMounted(() => {
      // 自動聚焦搜索框
      focusSearchInput()
    })

    return {
      // 響應式狀態
      searchInputRef,
      localSearchQuery,
      showSuggestions,
      showAdvanced,
      hasSearched,
      searchTime,

      // 篩選狀態
      selectedCategory,
      sortBy,
      bookType,
      priceFilter,
      language,
      ratingRange,
      yearRange,

      // Store 狀態
      searchResults,
      totalItems,
      isSearching,
      recentSearches,
      searchQuery,

      // 計算屬性
      currentYear,
      searchSuggestions,
      activeFilters,

      // 選項配置
      popularCategories,
      sortOptions: SORT_OPTIONS,
      bookTypeOptions,
      priceOptions,
      languageOptions,

      // 方法
      handleSearch,
      selectSuggestion,
      selectCategory,
      clearSearch,
      clearSearchHistory,
      removeFromHistory,
      hideSuggestionsDelayed,
      resetFilters,
      applyFilters,
      removeFilter,
      focusSearchInput,
    }
  },
}
</script>

<style lang="scss" scoped>
.book-search {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.search-main {
  position: relative;

  .search-input {
    .search-btn {
      border-radius: 0 8px 8px 0;
      margin: -1px;
      padding: 12px 20px;
    }
  }

  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    max-height: 400px;
    overflow-y: auto;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

    .suggestion-section {
      border-bottom: 1px solid #e0e0e0;

      &:last-child {
        border-bottom: none;
      }

      .suggestion-header {
        padding: 12px 16px 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fafafa;
        font-size: 13px;
        font-weight: 500;
      }
    }
  }
}

.search-filters {
  margin-top: 16px;

  .filter-toggle {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;

    .quick-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .advanced-filters {
    margin-top: 16px;

    .q-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
  }

  &.filters-expanded {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    padding: 8px;
  }
}

.search-stats {
  margin-top: 20px;
  padding: 16px 0;
  border-top: 1px solid #e0e0e0;

  .stats-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .active-filters {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .search-main {
    .search-input {
      :deep(.q-field__append) {
        .search-btn {
          padding: 8px 12px;

          .q-btn__content {
            font-size: 12px;
          }
        }
      }
    }

    .search-suggestions {
      .suggestion-header {
        padding: 10px 12px 6px;
        font-size: 12px;
      }

      .q-item {
        min-height: 40px;
        padding: 8px 12px;
      }
    }
  }

  .search-filters {
    .filter-toggle {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .quick-filters {
        width: 100%;
      }
    }

    .advanced-filters {
      .row {
        .col-12.col-md-3,
        .col-12.col-md-6 {
          width: 100%;
          max-width: 100%;
        }
      }
    }
  }

  .search-stats {
    .stats-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
}

// 動畫效果
.search-suggestions {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quick-filters {
  .q-chip {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

.active-filters {
  .q-chip {
    animation: fadeInUp 0.3s ease-out;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
