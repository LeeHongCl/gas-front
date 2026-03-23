<template>
  <div class="map-page">
    <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <StationSidebar
    :stations="stations"
    :selected-station-id="selectedStationId"
    :selected-station="selectedStation"
    :current-position="currentPosition"
    :bounds="mapBounds"
    @select-station="handleSelectStation"
    />
    </aside>

    <main class="map-area">
      <button class="sidebar-toggle" @click="toggleSidebar">
        {{ isSidebarCollapsed ? '목록 열기' : '목록 닫기' }}
      </button>

      <KakaoMapView
        :stations="stations"
        :selected-station="selectedStation"
        @select-station="handleSelectStation"
        @update-current-position="handleUpdateCurrentPosition"
        @update-bounds="handleUpdateBounds"
        />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CurrentPosition, GasStation } from '@/types/gasStation'
import { gasStations } from '@/mocks/gasStations'
import StationSidebar from '@/components/StationSidebar.vue'
import KakaoMapView from '@/components/KakaoMapView.vue'

const stations = ref<GasStation[]>(gasStations)
const selectedStation = ref<GasStation | null>(null)
const currentPosition = ref<CurrentPosition | null>(null)
const isSidebarCollapsed = ref(false)
const mapBounds = ref<{
  swLat: number
  swLng: number
  neLat: number
  neLng: number
} | null>(null)

const selectedStationId = computed(() => {
  return selectedStation.value ? selectedStation.value.id : null
})

function handleUpdateBounds(bounds: any) {
  mapBounds.value = bounds
}

function handleSelectStation(station: GasStation) {
  selectedStation.value = station
}

function handleUpdateCurrentPosition(position: CurrentPosition) {
  currentPosition.value = position
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<style scoped>
.map-page {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 360px;
  min-width: 360px;
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  transition: width 0.25s ease, min-width 0.25s ease, border-right 0.25s ease;
}

.sidebar.collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
  overflow: hidden;
}

.map-area {
  position: relative;
  flex: 1;
  height: 100%;
  background-color: #f3f4f6;
}

.sidebar-toggle {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 20;
  border: none;
  background-color: #ffffff;
  color: #111827;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.sidebar-toggle:hover {
  background-color: #f9fafb;
}
</style>