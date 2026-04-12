import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GasStation } from '@/types/gasStation'
import { fetchRouteRecommendations } from '@/api/gasStationApi'
import { mapRouteRecommendationsToGasStations } from '@/utils/mapRouteRecommendationsToGasStations'

console.log('✅ route store loaded')

export interface RoutePoint {
  name: string
  lat: number
  lng: number
}

export const useRouteStore = defineStore('route', () => {
  const origin = ref<RoutePoint | null>(null)
  const destination = ref<RoutePoint | null>(null)

  const recommendedStations = ref<GasStation[]>([])
  const selectedStation = ref<GasStation | null>(null)
const pageMode = ref<'planning' | 'navigating'>('planning')
  const loading = ref(false)
  const error = ref('')

  const mapCenter = ref({
    lat: 35.8691,
    lng: 128.5945,
  })

  const navigationStep = ref<'idle' | 'to_station' | 'to_destination'>('idle')
  const currentLocation = ref<{ lat: number; lng: number } | null>(null)
  const routePath = ref<{ lat: number; lng: number }[]>([])

  function setOrigin(point: RoutePoint) {
    origin.value = point
    mapCenter.value = {
      lat: point.lat,
      lng: point.lng,
    }
  }

  function setDestination(point: RoutePoint) {
    destination.value = point
  }

  function selectRecommendedStation(station: GasStation) {
    console.log('✅ selectRecommendedStation', station)

    selectedStation.value = station
    mapCenter.value = {
      lat: station.lat,
      lng: station.lng,
    }
  }

  function updateCurrentLocation(lat: number, lng: number) {
    console.log('✅ updateCurrentLocation', { lat, lng })

    currentLocation.value = { lat, lng }

    if (navigationStep.value === 'to_station' && selectedStation.value) {
      buildSimpleRouteToStation()
    } else if (navigationStep.value === 'to_destination' && destination.value) {
      buildSimpleRouteToDestination()
    }
  }

  function buildSimpleRouteToStation() {
  const startPoint = origin.value
    ? { lat: origin.value.lat, lng: origin.value.lng }
    : currentLocation.value

  console.log('✅ buildSimpleRouteToStation 실행', {
    origin: origin.value,
    currentLocation: currentLocation.value,
    startPoint,
    selectedStation: selectedStation.value,
  })

  if (!startPoint || !selectedStation.value) {
    console.warn('❌ routePath 생성 실패: startPoint 또는 selectedStation 없음')
    return
  }

  routePath.value = [
    { ...startPoint },
    {
      lat: selectedStation.value.lat,
      lng: selectedStation.value.lng,
    },
  ]

  console.log('✅ routePath 생성됨', routePath.value)
}

  function buildSimpleRouteToDestination() {
  const startPoint = selectedStation.value
    ? { lat: selectedStation.value.lat, lng: selectedStation.value.lng }
    : currentLocation.value

  console.log('✅ buildSimpleRouteToDestination 실행', {
    selectedStation: selectedStation.value,
    currentLocation: currentLocation.value,
    destination: destination.value,
    startPoint,
  })

  if (!startPoint || !destination.value) {
    console.warn('❌ 목적지 routePath 생성 실패')
    return
  }

  routePath.value = [
    { ...startPoint },
    {
      lat: destination.value.lat,
      lng: destination.value.lng,
    },
  ]

  console.log('✅ 목적지 routePath 생성됨', routePath.value)
}
  function startNavigationToStation() {
  console.log('✅ startNavigationToStation 실행', {
    selectedStation: selectedStation.value,
    origin: origin.value,
    currentLocation: currentLocation.value,
  })

  if (!selectedStation.value) {
    error.value = '먼저 주유소를 선택하세요.'
    return
  }

  navigationStep.value = 'to_station'
  pageMode.value = 'navigating'
  error.value = ''

  if (origin.value) {
    mapCenter.value = {
      lat: origin.value.lat,
      lng: origin.value.lng,
    }
  } else if (currentLocation.value) {
    mapCenter.value = {
      lat: currentLocation.value.lat,
      lng: currentLocation.value.lng,
    }
  } else {
    mapCenter.value = {
      lat: selectedStation.value.lat,
      lng: selectedStation.value.lng,
    }
  }

  buildSimpleRouteToStation()
}
function stopNavigation() {
  console.log('🛑 길찾기 종료')

  navigationStep.value = 'idle'
  pageMode.value = 'planning'

  // 경로 제거
  routePath.value = []

  // 선택된 주유소 유지 or 해제 (선택)
  selectedStation.value = null

  // 지도 중심을 출발지 or 기본값으로 복구
  if (origin.value) {
    mapCenter.value = {
      lat: origin.value.lat,
      lng: origin.value.lng,
    }
  } else {
    mapCenter.value = {
      lat: 35.8691,
      lng: 128.5945,
    }
  }
}
  function startNavigationToDestination() {
    console.log('✅ startNavigationToDestination 실행', {
      destination: destination.value,
      currentLocation: currentLocation.value,
    })

    if (!destination.value) {
      error.value = '최종 목적지가 없습니다.'
      return
    }

    navigationStep.value = 'to_destination'
    error.value = ''

    mapCenter.value = {
      lat: destination.value.lat,
      lng: destination.value.lng,
    }

    buildSimpleRouteToDestination()
  }

  function clearRoutePlan() {
    origin.value = null
    destination.value = null
    recommendedStations.value = []
    selectedStation.value = null
    error.value = ''
    navigationStep.value = 'idle'
    routePath.value = []
  }

  async function loadRouteRecommendations() {
    if (!origin.value || !destination.value) {
      error.value = '출발지와 도착지를 먼저 선택해 주세요.'
      return
    }

    try {
      loading.value = true
      error.value = ''
      selectedStation.value = null
      navigationStep.value = 'idle'
      routePath.value = []

      const response = await fetchRouteRecommendations({
        originLatitude: origin.value.lat,
        originLongitude: origin.value.lng,
        destinationLatitude: destination.value.lat,
        destinationLongitude: destination.value.lng,
        fuelType: 'GASOLINE',
        refuelLiters: 40,
        fuelEfficiency: 12,
        limit: 3,
      })

      recommendedStations.value = mapRouteRecommendationsToGasStations(response)

      const firstStation = recommendedStations.value[0]
      if (firstStation) {
        mapCenter.value = {
          lat: firstStation.lat,
          lng: firstStation.lng,
        }
      } else {
        error.value = '추천 결과가 없습니다.'
      }
    } catch (err) {
      console.error(err)
      recommendedStations.value = []

      if (err instanceof Error && err.message.includes('경로를 찾을 수 없습니다')) {
        error.value =
          '선택한 출발지/도착지로 차량 경로를 찾을 수 없습니다. 다른 장소를 선택해 주세요.'
      } else {
        error.value =
          err instanceof Error
            ? err.message
            : '경로 추천 정보를 불러오지 못했습니다.'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    origin,
    destination,
    recommendedStations,
    selectedStation,
    loading,
    error,
    mapCenter,
    navigationStep,
    currentLocation,
    routePath,
    setOrigin,
    setDestination,
    selectRecommendedStation,
    updateCurrentLocation,
    startNavigationToStation,
    startNavigationToDestination,
    clearRoutePlan,
    loadRouteRecommendations,
    pageMode,
    stopNavigation,
  }
})