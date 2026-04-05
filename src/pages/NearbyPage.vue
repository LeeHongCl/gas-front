<template>
  <div class="nearby-page">
    <header class="page-header">
      <h1>주변 주유소</h1>
      <p>거리 중심으로 빠르게 비교하는 화면입니다.</p>
    </header>

    <section class="map-section">
      <KakaoMapView
        :stations="stations"
        :selectedStation="selectedStation"
        :center="mapCenter"
        @select-station="selectStation"
      />
    </section>

    <section class="card-list">
      <StationCard
        v-for="station in stations"
        :key="station.id"
        :station="station"
        @select="selectStation"
      />
    </section>

    <StationDetailSheet
      :station="selectedStation"
      @close="selectedStation = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KakaoMapView from '@/components/KakaoMapView.vue'
import StationCard from '@/components/StationCard.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import { gasStations } from '@/data/gasStations'
import type { GasStation } from '@/types/gasStation'

const stations = ref<GasStation[]>(
  gasStations.map((station, index) => ({
    ...station,
    distance: 0.5 + index * 0.3,
  })),
)

const selectedStation = ref<GasStation | null>(null)

const mapCenter = ref({
  lat: stations.value[0]?.lat ?? 35.8691,
  lng: stations.value[0]?.lng ?? 128.5945,
})

function selectStation(station: GasStation) {
  selectedStation.value = station
  mapCenter.value = {
    lat: station.lat,
    lng: station.lng,
  }
}
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
  margin: 8px 0 0;
  color: #6b7280;
}

.map-section {
  position: relative;
  width: 100%;
  height: 320px;
  margin-top: 18px;
  border-radius: 18px;
  overflow: hidden;
  background: #f3f4f6;
}

.card-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}
</style>