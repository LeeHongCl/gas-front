<template>
  <div class="brand-filter">
    <button
      v-for="brand in brands"
      :key="brand"
      class="brand-btn"
      :class="{ active: modelValue === brand }"
      @click="emit('update:modelValue', brand)"
    >
      {{ brand }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  brands: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style scoped>
.brand-filter {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
  overflow-x: auto;
}

.brand-btn {
  border: none;
  background-color: #f3f4f6;
  color: #374151;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.brand-btn.active {
  background-color: #111827;
  color: #ffffff;
}
</style>