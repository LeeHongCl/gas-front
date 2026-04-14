<template>
  <nav class="bottom-tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: currentPath === tab.path }"
      @click="goTo(tab.path)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="currentPath === tab.path" class="active-dot" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentPath = computed(() => route.path)

const tabs = [
  { path: '/app',         icon: '🗺️',  label: '홈' },
  { path: '/app/nearby',  icon: '📍',  label: '주변' },
  { path: '/app/route',   icon: '🛣️',  label: '경로' },
  { path: '/app/my-info', icon: '👤',  label: '내 정보' },
]

function goTo(path: string) {
  if (route.path === path) return
  router.push(path)
}
</script>

<style scoped>
.bottom-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(229, 231, 235, 0.8);
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.tab-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 0;
  background: transparent;
  padding: 8px 4px 4px;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.tab-item.active {
  color: #2563eb;
}

.tab-icon {
  font-size: 22px;
  line-height: 1;
  transition: transform 0.15s ease;
}

.tab-item.active .tab-icon {
  transform: translateY(-2px);
}

.tab-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.active-dot {
  position: absolute;
  bottom: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #2563eb;
}
</style>
