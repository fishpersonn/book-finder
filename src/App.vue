<template>
  <q-app>
    <router-view />
  </q-app>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
/* 全域樣式 */
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}

/* 暗色主題支援 */
body.body--dark .bg-gradient {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
}
</style>
