<template>
  <div class="card" :class="{ selected: selected }" @click="handleClick">
    <div class="header">
      <h3>{{ station.name }}</h3>
      <span class="brand">{{ station.brand }}</span>
    </div>

    <div class="meta" v-if="distanceText || durationText">
      <span v-if="distanceText">{{ distanceText }}</span>
      <span v-if="durationText">{{ durationText }}</span>
    </div>

    <div class="info">
      <p>{{ station.address }}</p>
      <p>휘발유: {{ station.gasolinePrice }}원</p>
      <p>경유: {{ station.dieselPrice }}원</p>
    </div>

    <div class="tags">
      <span v-if="station.isSelf">셀프</span>
      <span v-if="station.hasCarWash">세차</span>
      <span v-if="station.hasStore">편의점</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GasStation } from '@/types/gasStation'

defineProps<{
  station: GasStation
  selected?: boolean
  distanceText?: string
  durationText?: string
}>()

const emit = defineEmits<{
  (e: 'select'): void
}>()

function handleClick() {
  emit('select')
}
</script>

<style scoped>
.card {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s, border-left 0.2s;
}

.card:hover {
  background-color: #f9fafb;
}

.card.selected {
  background-color: #eef6ff;
  border-left: 4px solid #3b82f6;
}

.header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.header h3 {
  margin: 0;
  font-size: 15px;
}

.brand {
  font-size: 12px;
  color: gray;
}

.meta {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}

.meta span {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background-color: #dbeafe;
  color: #1d4ed8;
}

.info {
  font-size: 13px;
  margin-top: 8px;
}

.info p {
  margin: 4px 0;
}

.tags {
  margin-top: 6px;
  display: flex;
  gap: 6px;
}

.tags span {
  font-size: 11px;
  background: #e5e7eb;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>