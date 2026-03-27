<template>
  <div class="simple-page">
    <header class="page-header">
      <h1>주변 주유소</h1>
      <p>거리 중심으로 빠르게 비교하는 화면입니다.</p>
    </header>

    <div class="card-list">
      <StationCard
        v-for="station in stations"
        :key="station.id"
        :station="station"
        @select="selectStation"
      />
    </div>

    <StationDetailSheet :station="selectedStation" @close="selectedStation = null" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StationCard from '@/components/StationCard.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import { gasStations } from '@/data/gasStations'
import type { GasStation } from '@/types/gasStation'

const stations = gasStations.map((station, index) => ({
  ...station,
  distance: 0.5 + index * 0.3,
}))

const selectedStation = ref<GasStation | null>(null)

function selectStation(station: GasStation) {
  selectedStation.value = station
}
</script>

<style scoped>
.simple-page {
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

.card-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}
</style>