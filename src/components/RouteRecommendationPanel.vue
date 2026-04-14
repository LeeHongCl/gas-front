<template>
  <Transition name="sheet">
    <div v-if="station" class="detail-overlay" @click.self="$emit('close')">
      <section class="detail-sheet">
        <div class="handle" />

        <!-- 헤더 -->
        <div class="header-row">
          <div class="header-info">
            <p class="brand-label">{{ station.brand }}</p>
            <h2 class="station-name">{{ station.name }}</h2>
            <p v-if="station.address" class="address">{{ station.address }}</p>
          </div>
          <button type="button" class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <!-- 거리 뱃지 -->
        <div v-if="station.distance != null" class="distance-badge">
          📍 {{ formatDistance(station.distance) }} 거리
        </div>

        <!-- 가격 -->
        <div class="price-grid">
          <div class="price-box gasoline">
            <span class="price-label">휘발유</span>
            <strong class="price-value">{{ station.gasolinePrice.toLocaleString() }}<em>원</em></strong>
          </div>
          <div class="price-box diesel">
            <span class="price-label">경유</span>
            <strong class="price-value">{{ station.dieselPrice.toLocaleString() }}<em>원</em></strong>
          </div>
        </div>

        <!-- 태그 -->
        <div v-if="hasTags" class="tag-row">
          <span v-if="station.isSelf" class="tag self">셀프</span>
          <span v-if="station.hasCarWash" class="tag wash">세차 가능</span>
          <span v-if="station.hasStore" class="tag store">편의점 있음</span>
        </div>

        <!-- 전화번호 -->
        <div v-if="station.tel" class="info-row">
          <span class="info-icon">📞</span>
          <span>{{ station.tel }}</span>
        </div>

        <!-- 액션 버튼 -->
        <div class="action-row">
          <a
            class="action-btn secondary"
            :class="{ disabled: !station.tel }"
            :href="station.tel ? `tel:${station.tel}` : undefined"
            @click.stop
          >
            📞 전화
          </a>
          <button
            type="button"
            class="action-btn primary"
            :disabled="navigating"
            @click.stop.prevent="handleStartNavigation"
          >
            {{ navigating ? '경로 계산 중...' : '🛣️ 길찾기' }}
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GasStation } from '@/types/gasStation'
import { useRouteStore } from '@/stores/route'

const routeStore = useRouteStore()

const props = defineProps<{
  station: GasStation | null
}>()

defineEmits<{
  (e: 'close'): void
}>()

const navigating = ref(false)

const hasTags = computed(
  () =>
    props.station &&
    (props.station.isSelf || props.station.hasCarWash || props.station.hasStore),
)

async function handleStartNavigation() {
  if (!props.station) return
  navigating.value = true
  try {
    routeStore.selectRecommendedStation(props.station)
    await routeStore.startNavigationToStation()
  } finally {
    navigating.value = false
  }
}

function formatDistance(distance?: number) {
  if (distance == null) return '-'
  if (distance < 1) return `${Math.round(distance * 1000)}m`
  return `${distance.toFixed(1)}km`
}
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active .detail-sheet,
.sheet-leave-active .detail-sheet {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .detail-sheet,
.sheet-leave-to .detail-sheet {
  transform: translateY(100%);
}

.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.4);
}

.detail-sheet {
  width: 100%;
  padding: 0 16px calc(28px + env(safe-area-inset-bottom));
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  background: white;
}

.handle {
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background: #d1d5db;
  margin: 12px auto 16px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.header-info { flex: 1; min-width: 0; }

.brand-label {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: 0.3px;
}

.station-name {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.address {
  margin: 6px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.close-btn {
  border: 0;
  background: #f3f4f6;
  color: #6b7280;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  margin-top: 2px;
}

.distance-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 13px;
  font-weight: 700;
}

.price-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 16px;
}

.price-box {
  border-radius: 18px;
  padding: 14px;
}

.price-box.gasoline { background: #eff6ff; }
.price-box.diesel   { background: #f0fdf4; }

.price-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
}

.price-value {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
}

.price-value em {
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  color: #6b7280;
  margin-left: 2px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.tag {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.tag.self   { background: #eff6ff; color: #1d4ed8; }
.tag.wash   { background: #f0f9ff; color: #0369a1; }
.tag.store  { background: #fdf4ff; color: #7e22ce; }

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f8fafc;
  font-size: 14px;
  color: #374151;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  margin-top: 20px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  border: 0;
  border-radius: 18px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s ease, transform 0.1s ease;
  -webkit-tap-highlight-color: transparent;
}

.action-btn:active { transform: scale(0.97); }

.action-btn.secondary {
  background: #f3f4f6;
  color: #111827;
}

.action-btn.secondary.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.action-btn.primary {
  background: #2563eb;
  color: white;
}

.action-btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
