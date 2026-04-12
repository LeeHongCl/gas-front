<template>
  <nav class="bottom-tab-bar">
    <button
      class="tab-item"
      :class="{ active: currentPath === '/app' }"
      @click="goTo('/app')"
    >
      <span>홈</span>
    </button>

    <button
      class="tab-item"
      :class="{ active: currentPath === '/app/nearby' }"
      @click="goTo('/app/nearby')"
    >
      <span>주변</span>
    </button>

    <button
      class="tab-item"
      :class="{ active: currentPath === '/app/route' }"
      @click="goTo('/app/route')"
    >
      <span>경로</span>
    </button>

    <button
      class="tab-item"
      :class="{ active: currentPath === '/app/my-info' }"
      @click="goTo('/app/my-info')"
    >
      <span>내 정보</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentPath = computed(() => route.path)

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
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
}

.tab-item {
  border: 0;
  background: transparent;
  padding: 10px 0;
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
}

.tab-item.active {
  color: #111827;
}
</style>