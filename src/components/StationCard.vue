<template>
  <article class="card" @click="$emit('select', station)">
    <div class="card-top">
      <div>
        <h3 class="title">{{ station.name }}</h3>
        <p class="meta">{{ station.brand }} · {{ station.address }}</p>
      </div>
      <div class="distance">{{ formatDistance(station.distance) }}</div>
    </div>

    <div class="price-row">
      <div class="price-box">
        <span class="label">휘발유</span>
        <strong>{{ station.gasolinePrice.toLocaleString() }}원</strong>
      </div>
      <div class="price-box">
        <span class="label">경유</span>
        <strong>{{ station.dieselPrice.toLocaleString() }}원</strong>
      </div>
    </div>

    <div class="tag-row">
      <span v-if="station.isSelf" class="tag">셀프</span>
      <span v-if="station.hasCarWash" class="tag">세차</span>
      <span v-if="station.hasStore" class="tag">편의점</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { GasStation } from '@/types/gasStation'

defineProps<{
  station: GasStation
}>()

defineEmits<{
  (e: 'select', station: GasStation): void
}>()

function formatDistance(distance?: number) {
  if (distance == null) return '-'
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 22px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
}

.meta {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.distance {
  white-space: nowrap;
  color: #2563eb;
  font-size: 13px;
  font-weight: 800;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}

.price-box {
  background: #f8fafc;
  border-radius: 16px;
  padding: 12px;
}

.label {
  display: block;
  margin-bottom: 4px;
  color: #6b7280;
  font-size: 12px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.tag {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}
</style>