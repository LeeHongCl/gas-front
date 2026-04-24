<template>
  <div class="nearby-page">
    <!-- 상단 헤더 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">주변 주유소</h1>
        <p class="page-sub">현재 위치 기준으로 검색합니다</p>
      </div>
      <button class="refresh-btn" :disabled="store.loading" @click="store.loadRadiusStations">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :class="{ spinning: store.loading }">
          <path d="M23 4v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M1 20v-6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ store.loading ? '검색 중' : '새로고침' }}</span>
      </button>
    </div>

    <!-- 지도 -->
    <section class="map-section">
      <KakaoMapView
        :stations="store.stations"
        :selected-station="store.selectedStation"
        :center="store.mapCenter"
        @select-station="store.selectStation"
      />
    </section>

    <!-- 로딩 스켈레톤 -->
    <div v-if="store.loading" class="card-list">
      <div v-for="i in 3" :key="i" class="skeleton-card">
        <div class="skel skel-title" />
        <div class="skel skel-meta" />
        <div class="skel-prices">
          <div class="skel skel-price" />
          <div class="skel skel-price" />
        </div>
      </div>
    </div>

    <!-- 에러 -->
    <div v-else-if="store.error" class="state-box error">
      <div class="state-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="state-title">검색 실패</p>
      <p class="state-desc">{{ store.error }}</p>
      <button class="retry-btn" @click="store.loadRadiusStations">다시 시도</button>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="store.stations.length === 0 && !store.loading" class="state-box">
      <div class="state-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#9ca3af" stroke-width="2"/>
          <circle cx="12" cy="9" r="2.5" stroke="#9ca3af" stroke-width="2"/>
        </svg>
      </div>
      <p class="state-title">주변 주유소 없음</p>
      <p class="state-desc">검색 반경을 늘려보거나<br />다른 위치에서 시도해 주세요</p>
    </div>

    <!-- 카드 리스트 -->
    <section v-else class="card-list">
      <p class="result-count">
        <strong>{{ store.stations.length }}곳</strong> 검색됨
      </p>
      <StationCard
        v-for="station in store.stations"
        :key="station.id"
        :station="station"
        @select="store.selectStation"
      />
    </section>

    <!-- 상세 시트 -->
    <StationDetailSheet
      mode="nearby"
      :station="store.selectedStation"
      @close="store.selectedStation = null"
      @route-ready="handleRouteReady"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import KakaoMapView from '@/components/KakaoMapView.vue'
import StationCard from '@/components/StationCard.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import { useNearbyStore } from '@/stores/nearby'

const store = useNearbyStore()
const nearbyRoutePath = ref<{ lat: number; lng: number }[]>([])

function handleRouteReady(path: { lat: number; lng: number }[]) {
  nearbyRoutePath.value = path
  store.selectedStation = null
}

onMounted(() => {
  store.loadRadiusStations()
})
</script>

<style scoped>
.nearby-page {
  padding: calc(20px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.page-sub {
  margin: 4px 0 0;
  color: var(--color-gray-400);
  font-size: 13px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  font-size: 13px;
  font-weight: 700;
  padding: 10px 14px;
  transition: background var(--transition-fast);
  flex-shrink: 0;
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

.map-section {
  position: relative;
  height: 260px;
  margin-top: 16px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.result-count {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--color-gray-500);
}

.result-count strong {
  color: var(--color-primary);
}

.card-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 스켈레톤 */
.skeleton-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.skel {
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skel-title {
  height: 18px;
  width: 55%;
  margin-bottom: 8px;
}

.skel-meta {
  height: 13px;
  width: 40%;
  margin-bottom: 14px;
}

.skel-prices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.skel-price {
  height: 52px;
  border-radius: var(--radius-md);
}

/* 상태 박스 */
.state-box {
  margin-top: 40px;
  text-align: center;
  padding: 40px 20px;
}

.state-box.error .state-title {
  color: var(--color-danger);
}

.state-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.state-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: var(--color-gray-700);
}

.state-desc {
  margin: 0 0 20px;
  color: var(--color-gray-400);
  font-size: 14px;
  line-height: 1.7;
}

.retry-btn {
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-danger);
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 12px 24px;
  transition: opacity var(--transition-fast);
}

.retry-btn:active {
  opacity: 0.8;
}
</style>
