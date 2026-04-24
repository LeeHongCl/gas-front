<template>
  <nav class="bottom-tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
      @click="goTo(tab.path)"
    >
      <span class="tab-icon" v-html="tab.icon" />
      <span class="tab-label">{{ tab.label }}</span>
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
  {
    path: '/app',
    label: '홈',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3l9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 21V12h6v9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 10v11h14V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    path: '/app/nearby',
    label: '주변',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
    </svg>`,
  },
  {
    path: '/app/route',
    label: '경로',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="19" r="2" stroke="currentColor" stroke-width="2"/>
      <circle cx="18" cy="5" r="2" stroke="currentColor" stroke-width="2"/>
      <path d="M6 17V9a6 6 0 016-6h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 7v8a6 6 0 01-6 6h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    path: '/app/favorites',
    label: '즐겨찾기',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    path: '/app/my-info',
    label: '내 정보',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
]

function isActive(path: string) {
  if (path === '/app') return currentPath.value === '/app'
  return currentPath.value.startsWith(path)
}

function goTo(path: string) {
  if (currentPath.value === path) return
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
  grid-template-columns: repeat(5, 1fr);
  padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(229, 231, 235, 0.7);
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.tab-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border: 0;
  background: transparent;
  padding: 8px 2px 4px;
  color: var(--color-gray-400);
  cursor: pointer;
  transition: color var(--transition-base);
  border-radius: 12px;
  margin: 0 2px;
}

.tab-item.active {
  color: var(--color-primary);
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-base);
}

.tab-item.active .tab-icon {
  transform: translateY(-1px);
}

/* 활성 탭 아이콘 fill */
.tab-item.active .tab-icon :deep(path),
.tab-item.active .tab-icon :deep(circle) {
  stroke: var(--color-primary);
}

.tab-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: -0.2px;
  white-space: nowrap;
}

/* 활성 인디케이터 */
.tab-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--color-primary);
}
</style>
