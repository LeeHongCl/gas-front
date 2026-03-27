<template>
  <div class="app-shell">
    <main class="app-content">
      <router-view />
    </main>
    <BottomTabBar />
  </div>
</template>

<script setup lang="ts">
import BottomTabBar from '@/components/BottomTabBar.vue'
</script>

<style scoped>
.app-shell {
  min-height: 100dvh;
  background: #f5f7fb;
}

.app-content {
  min-height: calc(100dvh - 82px);
  padding-bottom: 90px;
}
</style>