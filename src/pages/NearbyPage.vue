<template>
  <div class="nearby-page">
    <header class="page-header">
      <h1>주변 주유소 테스트</h1>
      <p>반경 / 경로 추천을 각각 테스트할 수 있습니다.</p>
    </header>

    <section class="action-section">
      <button class="load-btn" :disabled="store.loading" @click="store.loadRadiusStations">
        반경 추천
      </button>

      <button class="load-btn route" :disabled="store.loading" @click="store.loadRouteStations">
        경로 추천
      </button>
    </section>

    <p v-if="store.error" class="error-text">{{ store.error }}</p>

    <section class="map-section">
      <KakaoMapView
        :stations="store.stations"
        :selectedStation="store.selectedStation"
        :center="store.mapCenter"
        @select-station="store.selectStation"
      />
    </section>

    <section v-if="!store.loading && store.stations.length === 0" class="empty-section">
      아직 조회된 주유소가 없습니다.
    </section>

    <section v-else class="card-list">
      <StationCard
        v-for="station in store.stations"
        :key="station.id"
        :station="station"
        @select="store.selectStation"
      />
    </section>

    <StationDetailSheet
      :station="store.selectedStation"
      @close="store.selectedStation = null"
    />
  </div>
</template>

<script setup lang="ts">
import KakaoMapView from '@/components/KakaoMapView.vue'
import StationCard from '@/components/StationCard.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import { useNearbyStore } from '@/stores/nearby'

const store = useNearbyStore()
</script>

<style scoped>
.nearby-page {
  padding: calc(16px + env(safe-area-inset-top)) 16px 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
}

.page-header p {
  margin-top: 6px;
  color: #6b7280;
}

.action-section {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.load-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #111827;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.load-btn.route {
  background: #2563eb;
}

.load-btn:disabled {
  opacity: 0.6;
}

.map-section {
  position: relative;
  height: 320px;
  margin-top: 18px;
  border-radius: 18px;
  overflow: hidden;
}

.card-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.empty-section {
  margin-top: 18px;
  text-align: center;
  color: #6b7280;
}

.error-text {
  margin-top: 10px;
  color: red;
}
</style>