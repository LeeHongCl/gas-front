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
  min-height: 100dvh;
  background: #f9fafb;
}

.app-main {
  min-height: 100dvh;
  padding-bottom: 82px;
}
</style>
