import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { GasStation } from '@/types/gasStation'
import {
  fetchRadiusRecommendations,
  fetchRouteRecommendations,
} from '@/api/gasStationApi'
import { mapRouteRecommendationsToGasStations } from '@/utils/mapRouteRecommendationsToGasStations'

const STORAGE_KEY = 'nearby-store'

type NearbySourceType = 'none' | 'radius' | 'route'

interface NearbyPersistedState {
  stations: GasStation[]
  selectedStation: GasStation | null
  mapCenter: {
    lat: number
    lng: number
  }
  error: string
  lastSource: NearbySourceType
}

function loadPersistedState(): NearbyPersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as NearbyPersistedState
  } catch (error) {
    console.error('nearby store restore 실패:', error)
    return null
  }
}

function savePersistedState(state: NearbyPersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('nearby store save 실패:', error)
  }
}

export const useNearbyStore = defineStore('nearby', () => {
  const persisted = loadPersistedState()

  const stations = ref<GasStation[]>(persisted?.stations ?? [])
  const selectedStation = ref<GasStation | null>(persisted?.selectedStation ?? null)
  const loading = ref(false)
  const error = ref(persisted?.error ?? '')
  const lastSource = ref<NearbySourceType>(persisted?.lastSource ?? 'none')

  const mapCenter = ref(
    persisted?.mapCenter ?? {
      lat: 35.8691,
      lng: 128.5945,
    },
  )

  function persist() {
    savePersistedState({
      stations: stations.value,
      selectedStation: selectedStation.value,
      mapCenter: mapCenter.value,
      error: error.value,
      lastSource: lastSource.value,
    })
  }

  watch([stations, selectedStation, mapCenter, error, lastSource], persist, {
    deep: true,
  })

  function selectStation(station: GasStation) {
    selectedStation.value = station
    mapCenter.value = {
      lat: station.lat,
      lng: station.lng,
    }
  }

  function clearStations() {
    stations.value = []
    selectedStation.value = null
    error.value = ''
    lastSource.value = 'none'
    persist()
  }

  async function loadRadiusStations() {
    try {
      loading.value = true
      error.value = ''
      selectedStation.value = null

      const response = await fetchRadiusRecommendations({
        latitude: mapCenter.value.lat,
        longitude: mapCenter.value.lng,
        radius: 3000,
        fuelType: 'GASOLINE',
        refuelLiters: 40,
        fuelEfficiency: 12,
        limit: 6,
      })

      stations.value = mapRouteRecommendationsToGasStations(response)
      lastSource.value = 'radius'

      const firstStation = stations.value[0]
      if (firstStation) {
        mapCenter.value = {
          lat: firstStation.lat,
          lng: firstStation.lng,
        }
      }
    } catch (err) {
      console.error(err)
      error.value = err instanceof Error ? err.message : '반경 추천 실패'
      stations.value = []
      lastSource.value = 'none'
    } finally {
      loading.value = false
    }
  }

  async function loadRouteStations() {
    try {
      loading.value = true
      error.value = ''
      selectedStation.value = null

      const response = await fetchRouteRecommendations({
        originLatitude: mapCenter.value.lat,
        originLongitude: mapCenter.value.lng,
        destinationLatitude: 35.8714,
        destinationLongitude: 128.6014,
        fuelType: 'GASOLINE',
        refuelLiters: 40,
        fuelEfficiency: 12,
        limit: 5,
      })

      stations.value = mapRouteRecommendationsToGasStations(response)
      lastSource.value = 'route'

      const firstStation = stations.value[0]
      if (firstStation) {
        mapCenter.value = {
          lat: firstStation.lat,
          lng: firstStation.lng,
        }
      }
    } catch (err) {
      console.error(err)
      error.value = err instanceof Error ? err.message : '경로 추천 실패'
      stations.value = []
      lastSource.value = 'none'
    } finally {
      loading.value = false
    }
  }

  return {
    stations,
    selectedStation,
    loading,
    error,
    mapCenter,
    lastSource,
    selectStation,
    clearStations,
    loadRadiusStations,
    loadRouteStations,
  }
})