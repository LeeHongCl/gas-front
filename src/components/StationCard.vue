<template>
  <article class="card" @click="$emit('select', station)">
    <!-- 1줄: 순위 + 브랜드 + 이름 -->
    <div class="row1">
      <span v-if="rank" class="rank-badge" :style="{ background: rankColor }">{{ rank }}</span>
      <span class="brand-badge" :style="brandStyle">{{ station.brand }}</span>
      <h3 class="title">{{ station.name }}</h3>
    </div>
    <!-- 2줄: 유종 가격 + 거리 -->
    <div class="row2">
      <span class="fuel-price">
        {{ fuelLabel }} <strong>{{ displayPrice.toLocaleString() }}</strong><em>원/L</em>
      </span>
      <span v-if="formatDistance(station.distance)" class="sep">·</span>
      <span v-if="formatDistance(station.distance)" class="distance">{{ formatDistance(station.distance) }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GasStation } from '@/types/gasStation'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  station: GasStation
  mode?: 'radius' | 'route'
  rank?: number
}>()

defineEmits<{ (e: 'select', station: GasStation): void }>()

const auth = useAuthStore()
const fuelType = computed(() => auth.profile.value.fuelType ?? 'GASOLINE')
const fuelLabel = computed(() => fuelType.value === 'DIESEL' ? '경유' : '휘발유')
const displayPrice = computed(() =>
  fuelType.value === 'DIESEL' ? props.station.dieselPrice : props.station.gasolinePrice
)

const RANK_COLORS = ['#2563eb', '#ea580c', '#16a34a']

const rankColor = computed(() =>
  props.rank ? (RANK_COLORS[props.rank - 1] ?? '#6b7280') : ''
)

const BRAND_COLORS: Record<string, { bg: string; color: string }> = {
  SK:   { bg: '#fff0e6', color: '#ea580c' },
  GS:   { bg: '#fef9c3', color: '#ca8a04' },
  현대:  { bg: '#eff6ff', color: '#1d4ed8' },
  S오일: { bg: '#fef2f2', color: '#dc2626' },
  알뜰:  { bg: '#f0fdf4', color: '#16a34a' },
}

const brandStyle = computed(() => {
  const key = Object.keys(BRAND_COLORS).find((k) => props.station.brand.includes(k))
  const colors = (key ? BRAND_COLORS[key] : null) ?? { bg: '#f3f4f6', color: '#6b7280' }
  return { background: colors.bg, color: colors.color }
})

function formatDistance(distance?: number) {
  if (distance == null) return ''
  if (props.mode === 'route') {
    return `우회거리 ${distance.toFixed(1)}km`
  }
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}
</script>

<style scoped>
.card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 11px 14px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.card:active {
  transform: scale(0.985);
  box-shadow: 0 1px 4px rgba(17, 24, 39, 0.06);
}

/* ── 1줄 ── */
.row1 {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.rank-badge {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: white;
  line-height: 1;
}

.brand-badge {
  flex-shrink: 0;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.title {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-gray-900);
}

/* ── 2줄 ── */
.row2 {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 2px;
}

.fuel-price {
  font-size: 12px;
  color: var(--color-gray-600);
  font-weight: 600;
}

.fuel-price strong {
  font-size: 13px;
  font-weight: 800;
  color: var(--color-gray-900);
}

.fuel-price em {
  font-size: 10px;
  font-weight: 600;
  font-style: normal;
  color: var(--color-gray-400);
  margin-left: 1px;
}

.sep {
  color: var(--color-gray-300);
  font-size: 11px;
  line-height: 1;
}

.distance {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
}
</style>
