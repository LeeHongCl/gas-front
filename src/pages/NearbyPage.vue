<template>
  <div class="page">
    <div class="map-area">
      <!-- 지도 -->
      <div class="map-canvas">
        <KakaoMapView
          :stations="store.stations"
          :selected-station="store.selectedStation"
          :center="store.mapCenter"
          :show-center-marker="false"
          @select-station="store.selectStation"
        />
      </div>

      <!-- 상단 플로팅 바 -->
      <div class="top-bar">
        <div class="top-info">
          <span class="top-title">주변 주유소</span>
          <span class="top-sub">
            <template v-if="store.loading">검색 중...</template>
            <template v-else-if="store.stations.length > 0">{{ store.stations.length }}곳 검색됨</template>
            <template v-else>현재 위치 기준 3km</template>
          </span>
        </div>
        <button class="refresh-btn" :disabled="store.loading" @click="store.loadRadiusStations">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" :class="{ spinning: store.loading }">
            <path d="M23 4v6h-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 20v-6h6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ store.loading ? '검색 중' : '새로고침' }}
        </button>
      </div>

      <!-- 로딩 오버레이 -->
      <Transition name="fade">
        <div v-if="store.loading" class="loading-overlay">
          <div class="loading-spinner" />
          <span class="loading-text">주변 주유소 찾는 중...</span>
        </div>
      </Transition>

      <!-- 에러 토스트 -->
      <Transition name="slide-down">
        <div v-if="store.error && !store.loading" class="error-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span class="error-msg">{{ store.error }}</span>
          <button class="error-retry" @click="store.loadRadiusStations">재시도</button>
        </div>
      </Transition>

      <!-- 바텀시트 (항상 표시 - 카카오 맵 저작권 영역 커버) -->
      <StationBottomSheet
        ref="bottomSheetRef"
        :stations="store.stations"
        :expanded="false"
        mode="radius"
        @select-station="store.selectStation"
      />

      <!-- 상세 시트 -->
      <StationDetailSheet
        mode="nearby"
        :station="store.selectedStation"
        @close="store.selectedStation = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import KakaoMapView from '@/components/KakaoMapView.vue'
import StationBottomSheet from '@/components/StationBottomSheet.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import { useNearbyStore } from '@/stores/nearby'
import { useNoBodyScroll } from '@/composables/useNoBodyScroll'

const store = useNearbyStore()
const bottomSheetRef = ref(null)

useNoBodyScroll()

onMounted(() => {
  store.loadRadiusStations()
})
</script>

<style scoped>
.page {
  height: 100%;
}

.map-area {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.map-canvas {
  position: absolute;
  inset: 0;
}

/* 상단 플로팅 바 */
.top-bar {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.97);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.top-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.top-title {
  font-size: 15px;
  font-weight: 900;
  color: var(--color-gray-900);
}

.top-sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-400);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  font-size: 12px;
  font-weight: 700;
  padding: 8px 12px;
  transition: background var(--transition-fast);
}

.refresh-btn:active {
  background: var(--color-gray-200);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 로딩 오버레이 */
.loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-gray-600);
}

/* 에러 토스트 */
.error-toast {
  position: absolute;
  top: 80px;
  left: 16px;
  right: 16px;
  z-index: 35;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  box-shadow: var(--shadow-md);
}

.error-msg {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.error-retry {
  flex-shrink: 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: #dc2626;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
}

/* 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
