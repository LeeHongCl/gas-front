<template>
  <header class="app-header">
    <button v-if="showBack" class="back-btn" aria-label="뒤로" @click="router.back()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="header-text">
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title: string
  subtitle?: string
  showBack?: boolean
}>()

const router = useRouter()
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: calc(20px + env(safe-area-inset-top)) 20px 8px;
}

.back-btn {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 14px;
  background: white;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-700);
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.back-btn:active {
  transform: scale(0.95);
}

.header-text h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.header-text p {
  margin: 4px 0 0;
  color: var(--color-gray-500);
  font-size: 14px;
}
</style>
