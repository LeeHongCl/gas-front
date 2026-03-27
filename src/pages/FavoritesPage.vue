<template>
  <div class="simple-page">
    <header class="page-header">
      <h1>즐겨찾기</h1>
      <p>저장해둔 주유소를 빠르게 확인할 수 있습니다.</p>
    </header>

    <div class="card-list">
      <StationCard
        v-for="station in favoriteStations"
        :key="station.id"
        :station="station"
        @select="selectedStation = $event"
      />
    </div>

    <StationDetailSheet :station="selectedStation" @close="selectedStation = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import StationCard from '@/components/StationCard.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import { gasStations } from '@/data/gasStations'
import type { GasStation } from '@/types/gasStation'

const selectedStation = ref<GasStation | null>(null)

const favoriteStations = computed(() =>
  gasStations
    .filter((station) => station.favorite)
    .map((station, index) => ({ ...station, distance: 1.0 + index * 0.2 })),
)
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