<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-card">

          <!-- 헤더 -->
          <div class="modal-header">
            <div class="modal-title-area">
              <span class="modal-label">경로 미리보기</span>
              <div v-if="routeSummary" class="modal-summary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="6" cy="19" r="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="18" cy="5" r="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M6 17V9a6 6 0 016-6h0M18 7v8a6 6 0 01-6 6h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>{{ formatDistance(routeSummary.distanceM) }}</span>
                <span class="dot">·</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>{{ formatDuration(routeSummary.durationSec) }}</span>
              </div>
            </div>
            <button class="modal-close-btn" @click="$emit('close')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- 경유 경로 strip -->
          <div class="route-strip">
            <div class="stop origin">
              <span class="stop-dot origin-dot" />
              <span class="stop-name">{{ origin?.name ?? '출발지' }}</span>
            </div>
            <div class="stop-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stop station">
              <span class="stop-dot station-dot" />
              <span class="stop-name">{{ selectedStation?.name ?? '주유소' }}</span>
            </div>
            <div class="stop-arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stop dest">
              <span class="stop-dot dest-dot" />
              <span class="stop-name">{{ destination?.name ?? '목적지' }}</span>
            </div>
          </div>

          <!-- 지도 -->
          <div class="modal-map-area">
            <KakaoMapView
              :stations="selectedStation ? [selectedStation] : []"
              :selected-station="null"
              :center="mapCenter"
              :route-path="routePath"
              :auto-fit="true"
            />
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import KakaoMapView from '@/components/KakaoMapView.vue'
import type { GasStation } from '@/types/gasStation'
import type { RoutePoint } from '@/stores/route'

const props = defineProps<{
  show: boolean
  routePath: { lat: number; lng: number }[]
  selectedStation: GasStation | null
  origin: RoutePoint | null
  destination: RoutePoint | null
  routeSummary: { distanceM: number; durationSec: number } | null
}>()

defineEmits<{ (e: 'close'): void }>()

const mapCenter = computed(() => {
  if (props.origin && props.destination) {
    return {
      lat: (props.origin.lat + props.destination.lat) / 2,
      lng: (props.origin.lng + props.destination.lng) / 2,
    }
  }
  return props.selectedStation
    ? { lat: props.selectedStation.lat, lng: props.selectedStation.lng }
    : { lat: 35.8691, lng: 128.5945 }
})

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

function formatDuration(seconds: number) {
  const min = Math.round(seconds / 60)
  if (min < 60) return `${min}분`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: flex-end;
  padding: 0;
}

.modal-card {
  width: 100%;
  height: 88dvh;
  background: white;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 12px;
  flex-shrink: 0;
}

.modal-title-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-label {
  font-size: 17px;
  font-weight: 900;
  color: var(--color-gray-900);
}

.modal-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-gray-600);
}

.modal-summary svg {
  color: var(--color-primary);
}

.dot {
  color: var(--color-gray-300);
}

.modal-close-btn {
  width: 32px;
  height: 32px;
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

.modal-close-btn:active {
  background: var(--color-gray-200);
}

.route-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px 14px;
  border-bottom: 1px solid var(--color-gray-100);
  flex-shrink: 0;
  overflow-x: auto;
}

.stop {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  flex-shrink: 1;
}

.stop-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.origin-dot  { background: var(--color-primary); }
.station-dot { background: #f59e0b; }
.dest-dot    { background: #10b981; }

.stop-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-gray-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.stop-arrow {
  flex-shrink: 0;
}

.modal-map-area {
  flex: 1;
  min-height: 0;
}

/* 트랜지션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: translateY(100%);
}
</style>
