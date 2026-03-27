<template>
  <div class="fab-group">
    <button class="fab" @click="$emit('recenter')">📍</button>
    <button class="fab fab-primary" @click="$emit('research')">재검색</button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'recenter'): void
  (e: 'research'): void
}>()
</script>

<style scoped>
.fab-group {
  position: absolute;
  right: 16px;
  bottom: 240px;
  z-index: 35;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fab {
  min-width: 52px;
  min-height: 52px;
  border: 0;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.14);
  font-weight: 700;
}

.fab-primary {
  padding: 0 16px;
  color: white;
  background: #2563eb;
}
</style>