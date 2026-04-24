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
            <p v-if="station.address" class="address">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ station.address }}
            </p>
          </div>
          <button type="button" class="close-btn" aria-label="닫기" @click="$emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- 거리 뱃지 -->
        <div v-if="station.distance != null" class="distance-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
          {{ formatDistance(station.distance) }} 거리
        </div>

        <!-- 가격 -->
        <div class="price-grid">
          <div class="price-box gasoline">
            <span class="price-label">휘발유</span>
            <strong class="price-value">{{ station.gasolinePrice.toLocaleString() }}<em>원/L</em></strong>
          </div>
          <div class="price-box diesel">
            <span class="price-label">경유</span>
            <strong class="price-value">{{ station.dieselPrice.toLocaleString() }}<em>원/L</em></strong>
          </div>
        </div>

        <!-- 태그 -->
        <div v-if="hasTags" class="tag-row">
          <span v-if="station.isSelf" class="tag self">셀프</span>
          <span v-if="station.hasCarWash" class="tag wash">세차</span>
          <span v-if="station.hasStore" class="tag store">편의점</span>
        </div>

        <!-- 전화번호 -->
        <div v-if="station.tel" class="info-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            전화
          </a>
          <button
            type="button"
            class="action-btn primary"
            :disabled="navigating"
            @click.stop.prevent="handleStartNavigation"
          >
            <svg v-if="!navigating" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <polygon points="3,11 22,2 13,21 11,13 3,11" stroke="white" stroke-width="2" stroke-linejoin="round" fill="none"/>
            </svg>
            <span class="btn-spinner" v-else />
            {{ navigating ? '경로 계산 중...' : '길찾기' }}
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

const props = defineProps<{ station: GasStation | null }>()

defineEmits<{ (e: 'close'): void }>()

const navigating = ref(false)

const hasTags = computed(
  () => props.station && (props.station.isSelf || props.station.hasCarWash || props.station.hasStore),
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
  transition: opacity var(--transition-base);
}

.sheet-enter-active .detail-sheet,
.sheet-leave-active .detail-sheet {
  transition: transform var(--transition-slow);
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
  background: rgba(15, 23, 42, 0.45);
}

.detail-sheet {
  width: 100%;
  padding: 0 20px calc(28px + env(safe-area-inset-bottom));
  border-top-left-radius: var(--radius-2xl);
  border-top-right-radius: var(--radius-2xl);
  background: white;
}

.handle {
  width: 44px;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  margin: 12px auto 18px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.header-info { flex: 1; min-width: 0; }

.brand-label {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.3px;
}

.station-name {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.4px;
}

.address {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  gap: 4px;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: var(--color-gray-100);
  color: var(--color-gray-500);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.close-btn:active {
  background: var(--color-gray-200);
}

.distance-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 14px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
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
  border-radius: var(--radius-lg);
  padding: 14px;
}

.price-box.gasoline { background: #eff6ff; }
.price-box.diesel   { background: #f0fdf4; }

.price-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-500);
  margin-bottom: 6px;
}

.price-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-gray-900);
}

.price-value em {
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
  color: var(--color-gray-400);
  margin-left: 2px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.tag {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
}

.tag.self  { background: var(--color-primary-light); color: var(--color-primary-dark); }
.tag.wash  { background: #f0f9ff; color: #0369a1; }
.tag.store { background: #fdf4ff; color: #7e22ce; }

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-gray-50);
  font-size: 14px;
  color: var(--color-gray-700);
}

.info-row svg {
  color: var(--color-gray-400);
  flex-shrink: 0;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  gap: 10px;
  margin-top: 18px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 56px;
  border: 0;
  border-radius: var(--radius-lg);
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.action-btn:active { transform: scale(0.97); }

.action-btn.secondary {
  background: var(--color-gray-100);
  color: var(--color-gray-800);
}

.action-btn.secondary.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.action-btn.primary {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-blue);
}

.action-btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
