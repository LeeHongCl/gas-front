<template>
  <div class="sidebar-list">
    <StationSearchBar v-model="searchKeyword" />

    <SelectedStationInfo
      :station="selectedStation"
      :distance-text="selectedDistanceText"
      :duration-text="selectedDurationText"
    />

    <StationBrandFilter
      v-model="selectedBrand"
      :brands="brandOptions"
    />

    <StationSortBar v-model="currentSort" />

    <template v-if="sortedStations.length > 0">
      <StationCard
        v-for="station in sortedStations"
        :key="station.id"
        :station="station"
        :selected="station.id === selectedStationId"
        :distance-text="getDistanceText(station)"
        :duration-text="getDurationText(station)"
        @select="emit('select-station', station)"
      />
    </template>

    <div v-else class="empty-result">
      검색 결과가 없습니다.
    </div>
    <div class="empty-result">
    지도 영역 내에 주유소가 없습니다.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import StationCard from './StationCard.vue'
import SelectedStationInfo from './SelectedStationInfo.vue'
import StationSortBar from './StationSortBar.vue'
import StationSearchBar from './StationSearchBar.vue'
import StationBrandFilter from './StationBrandFilter.vue'
import type { CurrentPosition, GasStation } from '@/types/gasStation'
import type { StationSortType } from '@/types/sort'
import {
  calculateDistanceInKm,
  estimateDrivingMinutes,
  formatDistance,
} from '@/utils/distance'

const props = defineProps<{
  stations: GasStation[]
  selectedStationId: string | null
  selectedStation: GasStation | null
  currentPosition: CurrentPosition | null
  bounds: {
  swLat: number
  swLng: number
  neLat: number
  neLng: number
} | null
}>()

const emit = defineEmits<{
  (e: 'select-station', station: GasStation): void
}>()

const currentSort = ref<StationSortType>('distance')
const searchKeyword = ref('')
const selectedBrand = ref('전체')

const brandOptions = computed(() => {
  const uniqueBrands = [...new Set(props.stations.map((station) => station.brand))]
  return ['전체', ...uniqueBrands]
})

function getDistanceKm(station: GasStation): number | null {
  if (!props.currentPosition) return null

  return calculateDistanceInKm(
    props.currentPosition.lat,
    props.currentPosition.lng,
    station.lat,
    station.lng
  )
}

function isInBounds(station: GasStation): boolean {
  if (!props.bounds) return true

  return (
    station.lat >= props.bounds.swLat &&
    station.lat <= props.bounds.neLat &&
    station.lng >= props.bounds.swLng &&
    station.lng <= props.bounds.neLng
  )
}

function getDistanceText(station: GasStation): string {
  const distanceKm = getDistanceKm(station)
  if (distanceKm === null) return ''
  return formatDistance(distanceKm)
}

function getDurationText(station: GasStation): string {
  const distanceKm = getDistanceKm(station)
  if (distanceKm === null) return ''
  return `약 ${estimateDrivingMinutes(distanceKm)}분`
}

const selectedDistanceText = computed(() => {
  if (!props.selectedStation) return ''
  return getDistanceText(props.selectedStation)
})

const selectedDurationText = computed(() => {
  if (!props.selectedStation) return ''
  return getDurationText(props.selectedStation)
})

const filteredStations = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  return props.stations.filter((station) => {
    const matchesKeyword =
      !keyword || station.name.toLowerCase().includes(keyword)

    const matchesBrand =
      selectedBrand.value === '전체' ||
      station.brand === selectedBrand.value

    const matchesBounds = isInBounds(station)

    return matchesKeyword && matchesBrand && matchesBounds
  })
})

const sortedStations = computed(() => {
  const copied = [...filteredStations.value]

  if (currentSort.value === 'gasolinePrice') {
    return copied.sort((a, b) => a.gasolinePrice - b.gasolinePrice)
  }

  if (currentSort.value === 'dieselPrice') {
    return copied.sort((a, b) => a.dieselPrice - b.dieselPrice)
  }

  return copied.sort((a, b) => {
    const aDistance = getDistanceKm(a)
    const bDistance = getDistanceKm(b)

    if (aDistance === null && bDistance === null) return 0
    if (aDistance === null) return 1
    if (bDistance === null) return -1

    return aDistance - bDistance
  })
})
</script>

<style scoped>
.sidebar-list {
  width: 100%;
}

.empty-result {
  padding: 24px 16px;
  font-size: 14px;
  color: #6b7280;
}
</style>