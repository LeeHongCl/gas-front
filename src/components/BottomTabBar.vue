<template>
  <nav class="tabbar">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab-item"
      :class="{ active: isActive(tab.to) }"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()

const tabs = [
  { to: '/app', label: '홈', icon: '🏠' },
  { to: '/app/nearby', label: '주변', icon: '📍' },
  { to: '/app/favorites', label: '즐겨찾기', icon: '⭐' },
  { to: '/app/settings', label: '설정', icon: '⚙️' },
]

function isActive(path: string) {
  if (path === '/app') {
    return route.path === '/app'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #e5e7eb;
  backdrop-filter: blur(16px);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 56px;
  border-radius: 16px;
  color: #6b7280;
}

.tab-item.active {
  background: #eef4ff;
  color: #2563eb;
  font-weight: 700;
}

.tab-icon {
  font-size: 18px;
}

.tab-label {
  font-size: 12px;
}
</style>