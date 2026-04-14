<template>
  <div class="page">
    <div class="map-area">
      <!-- 지도 레이어 -->
      <div class="map-canvas">
        <KakaoMapView
          :stations="displayStations"
          :selected-station="selectedStation"
          :center="mapCenter"
          :route-path="nearbyRoutePath"
          :current-location="currentLocation"
          @select-station="handleSelectStation"
        />
      </div>

      <!-- 상단 검색 -->
      <SearchBar v-model="keyword" @open-filter="isFilterOpen = true" />

      <!-- 플로팅 버튼 -->
      <FloatingButtons @recenter="handleRecenter" @research="handleResearch" />

      <!-- 경로 안내 중 상단 배너 -->
      <Transition name="fade">
        <div v-if="nearbyRoutePath.length > 0" class="nav-banner">
          <span class="nav-banner-text">
            🛣️ {{ selectedStation?.name ?? '주유소' }}까지 경로 안내 중
          </span>
          <button class="nav-banner-close" @click="clearNearbyRoute">종료</button>
        </div>
      </Transition>

      <!-- 바텀시트 -->
      <StationBottomSheet
        :stations="displayStations"
        :expanded="sheetExpanded"
        @toggle-expand="sheetExpanded = !sheetExpanded"
        @select-station="handleSelectStation"
      />
    </div>

    <!-- 필터 바텀시트 -->
    <FilterBottomSheet
      :open="isFilterOpen"
      :state="filterState"
      @close="isFilterOpen = false"
      @apply="handleApplyFilter"
    />

    <!-- 상세 시트 — nearby 모드 -->
    <StationDetailSheet
      mode="nearby"
      :station="selectedStation"
      @close="selectedStation = null"
      @route-ready="handleRouteReady"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import FloatingButtons from '@/components/FloatingButtons.vue'
import StationBottomSheet from '@/components/StationBottomSheet.vue'
import FilterBottomSheet from '@/components/FilterBottomSheet.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import KakaoMapView from '@/components/KakaoMapView.vue'
import { gasStations } from '@/data/gasStations'
import { getAppCurrentLocation } from '@/utils/location'
import type { GasStation, StationFilterState } from '@/types/gasStation'
import { useNearbyStore } from '@/stores/nearby'
import { useRouteStore } from '@/stores/route'
import { calculateDistanceInKm } from '@/utils/distance'

const store = useNearbyStore()
const routeStore = useRouteStore()

const keyword = ref('')
const isFilterOpen = ref(false)
const sheetExpanded = ref(true)
const selectedStation = ref<GasStation | null>(null)

// 반경 기반 경로 (현재 위치 → 주유소)
const nearbyRoutePath = ref<{ lat: number; lng: number }[]>([])
const currentLocation = ref<{ lat: number; lng: number } | null>(null)

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

const stationsWithDistance = computed(() => {
  return gasStations.map((station) => ({
    ...station,
    distance: calculateDistanceInKm(
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

const displayStations = computed(() => {
  if (store.lastSource !== 'none' && store.stations.length > 0) return store.stations
  return filteredStations.value
})

function handleApplyFilter(nextState: StationFilterState) {
  filterState.value = nextState
  isFilterOpen.value = false
}

async function updateCurrentLocation() {
  try {
    const location = await getAppCurrentLocation()
    mapCenter.value = { lat: location.lat, lng: location.lng }
    currentLocation.value = { lat: location.lat, lng: location.lng }

    // routeStore에도 현재 위치 업데이트 (경로 계산에 사용)
    routeStore.updateCurrentLocation(location.lat, location.lng)
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

function handleSelectStation(station: GasStation) {
  // 다른 주유소 선택 시 이전 경로 초기화
  if (selectedStation.value?.id !== station.id) {
    nearbyRoutePath.value = []
  }
  selectedStation.value = station
}

/** StationDetailSheet에서 경로 계산 완료 후 호출 */
function handleRouteReady(path: { lat: number; lng: number }[]) {
  nearbyRoutePath.value = path
  // 시트 닫기
  selectedStation.value = null
}

/** 경로 안내 종료 */
function clearNearbyRoute() {
  nearbyRoutePath.value = []
  routeStore.clearRoutePlan()
}

watch(
  () => store.selectedStation,
  (nextStation) => {
    if (nextStation) selectedStation.value = nextStation
  },
)

watch(
  () => store.mapCenter,
  (nextCenter) => {
    if (store.lastSource !== 'none') {
      mapCenter.value = { lat: nextCenter.lat, lng: nextCenter.lng }
    }
  },
  { deep: true },
)

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
  height: calc(100dvh - 82px);
  overflow: hidden;
  background: #dbeafe;
}

.map-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* 경로 안내 배너 */
.nav-banner {
  position: absolute;
  top: calc(14px + env(safe-area-inset-top));
  left: 16px;
  right: 16px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  background: #1d4ed8;
  color: white;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.nav-banner-text {
  font-size: 14px;
  font-weight: 700;
}

.nav-banner-close {
  border: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 12px;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.nav-banner-close:active {
  background: rgba(255, 255, 255, 0.3);
}

/* 배너 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
