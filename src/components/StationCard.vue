<template>
  <article class="card" @click="$emit('select', station)">
    <div class="card-top">
      <div class="card-info">
        <h3 class="title">{{ station.name }}</h3>
        <p class="meta">{{ station.brand }} · {{ truncateAddress(station.address) }}</p>
      </div>
      <div class="right-col">
        <span class="distance">{{ formatDistance(station.distance) }}</span>
      </div>
    </div>

    <div class="price-row">
      <div class="price-box gasoline">
        <span class="label">휘발유</span>
        <strong class="price">{{ station.gasolinePrice.toLocaleString() }}<em>원</em></strong>
      </div>
      <div class="price-box diesel">
        <span class="label">경유</span>
        <strong class="price">{{ station.dieselPrice.toLocaleString() }}<em>원</em></strong>
      </div>
    </div>

    <div v-if="hasTags" class="tag-row">
      <span v-if="station.isSelf" class="tag self">셀프</span>
      <span v-if="station.hasCarWash" class="tag wash">세차</span>
      <span v-if="station.hasStore" class="tag store">편의점</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GasStation } from '@/types/gasStation'

const props = defineProps<{
  station: GasStation
}>()

defineEmits<{
  (e: 'select', station: GasStation): void
}>()

const hasTags = computed(
  () => props.station.isSelf || props.station.hasCarWash || props.station.hasStore,
)

function formatDistance(distance?: number) {
  if (distance == null) return '-'
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}

function truncateAddress(address: string) {
  if (!address) return ''
  // 도로명/지번에서 앞 두 토큰만 (시/구 정도)
  return address.split(' ').slice(0, 3).join(' ')
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(17, 24, 39, 0.06);
  cursor: pointer;
  /* 터치 피드백 */
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  -webkit-tap-highlight-color: transparent;
  active: scale(0.98);
}

.card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(17, 24, 39, 0.08);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  /* 긴 이름 말줄임 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  margin: 5px 0 0;
  color: #9ca3af;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.right-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.distance {
  color: #2563eb;
  font-size: 13px;
  font-weight: 800;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}

.price-box {
  border-radius: 14px;
  padding: 11px 12px;
}

.price-box.gasoline {
  background: #eff6ff;
}

.price-box.diesel {
  background: #f0fdf4;
}

.label {
  display: block;
  margin-bottom: 3px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.price {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
}

.price em {
  font-size: 11px;
  font-weight: 600;
  font-style: normal;
  color: #6b7280;
  margin-left: 1px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.tag {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.tag.self {
  background: #eff6ff;
  color: #1d4ed8;
}

.tag.wash {
  background: #f0f9ff;
  color: #0369a1;
}

.tag.store {
  background: #fdf4ff;
  color: #7e22ce;
}
</style>
