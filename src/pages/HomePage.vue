<template>
  <div class="page">
    <div class="map-area">
      <SearchBar v-model="keyword" @open-filter="isFilterOpen = true" />

      <KakaoMapView
        :stations="filteredStations"
        :selected-station="selectedStation"
        :center="mapCenter"
        @select-station="selectedStation = $event"
      />

      <div class="map-chip">
        현재 위치: {{ mapCenter.lat.toFixed(4) }}, {{ mapCenter.lng.toFixed(4) }}
      </div>

      <FloatingButtons @recenter="handleRecenter" @research="handleResearch" />

      <StationBottomSheet
        :stations="filteredStations"
        :expanded="sheetExpanded"
        @toggle-expand="sheetExpanded = !sheetExpanded"
        @select-station="selectedStation = $event"
      />
    </div>

    <FilterBottomSheet
      :open="isFilterOpen"
      :state="filterState"
      @close="isFilterOpen = false"
      @apply="handleApplyFilter"
    />

    <StationDetailSheet :station="selectedStation" @close="selectedStation = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import FloatingButtons from '@/components/FloatingButtons.vue'
import StationBottomSheet from '@/components/StationBottomSheet.vue'
import FilterBottomSheet from '@/components/FilterBottomSheet.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import KakaoMapView from '@/components/KakaoMapView.vue'
import { gasStations } from '@/data/gasStations'
import { getAppCurrentLocation } from '@/utils/location'
import type { GasStation, StationFilterState } from '@/types/gasStation'

const keyword = ref('')
const isFilterOpen = ref(false)
const sheetExpanded = ref(false)
const selectedStation = ref<GasStation | null>(null)

const mapCenter = ref({
  lat: 35.8691,
  lng: 128.5945,
})

const filterState = ref<StationFilterState>({
  fuelType: 'gasoline',
  sortBy: 'recommend',
  onlySelf: false,
  hasCarWash: false,
  hasStore: false,
  radiusKm: 5,
})

function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const earthRadiusKm = 6371

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

const stationsWithDistance = computed(() => {
  return gasStations.map((station) => ({
    ...station,
    distance: calculateDistanceKm(
      mapCenter.value.lat,
      mapCenter.value.lng,
      station.lat,
      station.lng,
    ),
  }))
})

const filteredStations = computed(() => {
  const q = keyword.value.trim().toLowerCase()

  let result = stationsWithDistance.value.filter((station) => {
    const matchesKeyword =
      !q ||
      station.name.toLowerCase().includes(q) ||
      station.address.toLowerCase().includes(q) ||
      station.brand.toLowerCase().includes(q)

    const matchesSelf = !filterState.value.onlySelf || station.isSelf
    const matchesCarWash = !filterState.value.hasCarWash || station.hasCarWash
    const matchesStore = !filterState.value.hasStore || station.hasStore
    const matchesRadius = (station.distance ?? 999) <= filterState.value.radiusKm

    return matchesKeyword && matchesSelf && matchesCarWash && matchesStore && matchesRadius
  })

  if (filterState.value.sortBy === 'distance') {
    result = [...result].sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
  } else if (filterState.value.sortBy === 'price') {
    result = [...result].sort((a, b) => {
      const aPrice = filterState.value.fuelType === 'gasoline' ? a.gasolinePrice : a.dieselPrice
      const bPrice = filterState.value.fuelType === 'gasoline' ? b.gasolinePrice : b.dieselPrice
      return aPrice - bPrice
    })
  } else {
    result = [...result].sort((a, b) => {
      const aScore = (a.favorite ? 2 : 0) + (a.isSelf ? 1 : 0) - (a.distance ?? 0)
      const bScore = (b.favorite ? 2 : 0) + (b.isSelf ? 1 : 0) - (b.distance ?? 0)
      return bScore - aScore
    })
  }

  return result
})

function handleApplyFilter(nextState: StationFilterState) {
  filterState.value = nextState
  isFilterOpen.value = false
}

async function updateCurrentLocation() {
  try {
    const location = await getAppCurrentLocation()

    mapCenter.value = {
      lat: location.lat,
      lng: location.lng,
    }

    console.log('현재 위치 정확도(m):', location.accuracy)
  } catch (error) {
    console.error('현재 위치를 가져오지 못했습니다.', error)
  }
}

function handleRecenter() {
  updateCurrentLocation()
}

function handleResearch() {
  console.log('현재 지도 중심 기준으로 재검색')
}

onMounted(() => {
  updateCurrentLocation()
})
</script>

<style scoped>
.page {
  min-height: 100dvh;
}

.map-area {
  position: relative;
  min-height: calc(100dvh - 82px);
  overflow: hidden;
  background: #dbeafe;
}

.map-chip {
  position: absolute;
  left: 16px;
  top: 88px;
  z-index: 30;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.1);
}
</style>