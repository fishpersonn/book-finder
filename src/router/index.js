// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'BookFinder - 探索無限的知識世界',
    },
  },
  {
    path: '/search',
    name: 'Search',
    component: Home, // 暫時使用同一個組件
    meta: {
      title: 'BookFinder - 搜索結果',
    },
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/Favorites.vue'),
    meta: {
      title: 'BookFinder - 我的收藏',
    },
  },
  {
    path: '/reading-list',
    name: 'ReadingList',
    component: () => import('../views/ReadingList.vue'),
    meta: {
      title: 'BookFinder - 閱讀清單',
    },
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: () => import('../views/BookDetail.vue'),
    meta: {
      title: 'BookFinder - 書籍詳情',
    },
  },
  {
    // 404 頁面
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: 'BookFinder - 頁面未找到',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由守衛 - 設置頁面標題
router.beforeEach((to, from, next) => {
  // 設置頁面標題
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 頁面切換時滾動到頂部
  if (to.path !== from.path) {
    window.scrollTo(0, 0)
  }

  next()
})

export default router
