<template>
  <div class="nearby-page">
    <!-- 상단 헤더 -->
    <div class="page-header">
      <h1 class="page-title">주변 주유소</h1>
      <button class="refresh-btn" :disabled="store.loading" @click="store.loadRadiusStations">
        {{ store.loading ? '검색 중...' : '🔄 새로고침' }}
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

    <!-- 로딩 -->
    <div v-if="store.loading" class="status-box">
      <p>현재 위치 기반으로 주유소를 검색 중입니다...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="store.error" class="error-box">
      <p>{{ store.error }}</p>
      <button class="retry-btn" @click="store.loadRadiusStations">다시 시도</button>
    </div>

    <!-- 결과 없음 -->
    <div v-else-if="store.stations.length === 0" class="empty-box">
      <p>주변 주유소가 없습니다.</p>
    </div>

    <!-- 카드 리스트 -->
    <section v-else class="card-list">
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
import { useRouteStore } from '@/stores/route'

const store = useNearbyStore()
const routeStore = useRouteStore()

// 반경 기반 경로 (현재 위치 → 주유소)
const nearbyRoutePath = ref<{ lat: number; lng: number }[]>([])

function handleRouteReady(path: { lat: number; lng: number }[]) {
  nearbyRoutePath.value = path
  store.selectedStation = null
}

onMounted(() => {
  // 페이지 진입 시 자동으로 현재 위치 기반 반경 추천 로드
  store.loadRadiusStations()
})
</script>

<style scoped>
.nearby-page {
  padding: calc(16px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.refresh-btn {
  border: 0;
  border-radius: 12px;
  background: #f3f4f6;
  color: #374151;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 14px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.map-section {
  position: relative;
  height: 280px;
  margin-top: 16px;
  border-radius: 20px;
  overflow: hidden;
}

.status-box,
.empty-box {
  margin-top: 24px;
  text-align: center;
  color: #6b7280;
  font-size: 15px;
}

.error-box {
  margin-top: 24px;
  padding: 16px;
  border-radius: 16px;
  background: #fef2f2;
  text-align: center;
}

.error-box p {
  margin: 0 0 12px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
}

.retry-btn {
  border: 0;
  border-radius: 12px;
  background: #dc2626;
  color: white;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 18px;
  cursor: pointer;
}

.card-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}
</style>
