<template>
  <header class="app-header">
    <button v-if="showBack" class="back-btn" @click="router.back()">←</button>
    <div>
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
  padding: calc(16px + env(safe-area-inset-top)) 16px 0;
}

.back-btn {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 14px;
  background: white;
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.08);
  font-size: 18px;
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
}

.app-header p {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}
</style>