<template>
  <div class="app-layout">
    <main class="app-main">
      <RouterView :key="$route.path" />
    </main>

    <BottomTabBar />
  </div>
</template>

<script setup lang="ts">
import BottomTabBar from '@/components/BottomTabBar.vue'
</script>

<style scoped>
.app-layout {
  height: 100dvh;
  overflow: hidden;
  background: #f9fafb;
}

.app-main {
  height: 100%;
  padding-bottom: 78px;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
