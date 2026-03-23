<template>
  <div class="sort-bar">
    <button
      class="sort-btn"
      :class="{ active: modelValue === 'distance' }"
      @click="emit('update:modelValue', 'distance')"
    >
      거리순
    </button>

    <button
      class="sort-btn"
      :class="{ active: modelValue === 'gasolinePrice' }"
      @click="emit('update:modelValue', 'gasolinePrice')"
    >
      휘발유가순
    </button>

    <button
      class="sort-btn"
      :class="{ active: modelValue === 'dieselPrice' }"
      @click="emit('update:modelValue', 'dieselPrice')"
    >
      경유가순
    </button>
  </div>
</template>

<script setup lang="ts">
import type { StationSortType } from '@/types/sort'

defineProps<{
  modelValue: StationSortType
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: StationSortType): void
}>()
</script>

<style scoped>
.sort-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
}

.sort-btn {
  border: none;
  background-color: #f3f4f6;
  color: #374151;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
}

.sort-btn.active {
  background-color: #2563eb;
  color: #ffffff;
}
</style>