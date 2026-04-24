<template>
  <article class="card" @click="$emit('select', station)">
    <div class="card-top">
      <div class="card-info">
        <div class="name-row">
          <span class="brand-badge" :style="brandStyle">{{ station.brand }}</span>
        </div>
        <h3 class="title">{{ station.name }}</h3>
        <p class="meta">{{ truncateAddress(station.address) }}</p>
      </div>
      <div class="right-col">
        <span class="distance">{{ formatDistance(station.distance) }}</span>
        <button
          class="fav-btn"
          :class="{ active: station.favorite }"
          aria-label="즐겨찾기"
          @click.stop
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              :fill="station.favorite ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="price-row">
      <div class="price-box gasoline">
        <span class="label">휘발유</span>
        <strong class="price">{{ station.gasolinePrice.toLocaleString() }}<em>원/L</em></strong>
      </div>
      <div class="price-box diesel">
        <span class="label">경유</span>
        <strong class="price">{{ station.dieselPrice.toLocaleString() }}<em>원/L</em></strong>
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

const props = defineProps<{ station: GasStation }>()

defineEmits<{ (e: 'select', station: GasStation): void }>()

const hasTags = computed(
  () => props.station.isSelf || props.station.hasCarWash || props.station.hasStore,
)

const BRAND_COLORS: Record<string, { bg: string; color: string }> = {
  SK: { bg: '#fff0e6', color: '#ea580c' },
  GS: { bg: '#fef9c3', color: '#ca8a04' },
  현대: { bg: '#eff6ff', color: '#1d4ed8' },
  S오일: { bg: '#fef2f2', color: '#dc2626' },
  알뜰: { bg: '#f0fdf4', color: '#16a34a' },
}

const brandStyle = computed(() => {
  const key = Object.keys(BRAND_COLORS).find((k) => props.station.brand.includes(k))
  const colors = (key ? BRAND_COLORS[key] : null) ?? { bg: '#f3f4f6', color: '#6b7280' }
  return { background: colors.bg, color: colors.color }
})

function formatDistance(distance?: number) {
  if (distance == null) return '-'
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}

function truncateAddress(address: string) {
  if (!address) return ''
  return address.split(' ').slice(0, 3).join(' ')
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  border: 1px solid transparent;
}

.card:active {
  transform: scale(0.985);
  box-shadow: 0 1px 4px rgba(17, 24, 39, 0.06);
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

.name-row {
  margin-bottom: 6px;
}

.brand-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-gray-900);
}

.meta {
  margin: 4px 0 0;
  color: var(--color-gray-400);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.right-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.distance {
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 800;
}

.fav-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--color-gray-200);
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-300);
  transition: all var(--transition-fast);
}

.fav-btn.active {
  color: #e11d48;
  border-color: #fce7f3;
  background: #fff1f2;
}

.fav-btn:active {
  transform: scale(0.9);
}

.price-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}

.price-box {
  border-radius: var(--radius-md);
  padding: 10px 12px;
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
  font-weight: 700;
  color: var(--color-gray-500);
}

.price {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-gray-900);
}

.price em {
  font-size: 10px;
  font-weight: 600;
  font-style: normal;
  color: var(--color-gray-400);
  margin-left: 1px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.tag {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
}

.tag.self {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
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
