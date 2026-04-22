 import { defineStore } from 'pinia'
  import { ref } from 'vue'
  import type { GasStation } from '@/types/gasStation'
  import { fetchRouteRecommendations } from '@/api/gasStationApi'
  import { mapRouteRecommendationsToGasStations } from '@/utils/mapRouteRecommendationsToGasStations'
  import { fetchKakaoRoute } from '@/utils/kakaoRouteApi'
  import { snapCoordToRoad } from '@/utils/kakaoGeocode'

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

    const mapCenter = ref({ lat: 35.8691, lng: 128.5945 })

    const navigationStep = ref<'idle' | 'to_station' | 'to_destination'>('idle')
    const currentLocation = ref<{ lat: number; lng: number } | null>(null)
    const routePath = ref<{ lat: number; lng: number }[]>([])
    const routeSummary = ref<{ distanceM: number; durationSec: number } | null>(null)

    // ─── 기본 세터 ────────────────────────────────────────────────

    function setOrigin(point: RoutePoint) {
      origin.value = point
      mapCenter.value = { lat: point.lat, lng: point.lng }
    }

    function setDestination(point: RoutePoint) {
      destination.value = point
    }

    function selectRecommendedStation(station: GasStation) {
      console.log('✅ selectRecommendedStation', station)
      selectedStation.value = station
      mapCenter.value = { lat: station.lat, lng: station.lng }
    }

    function updateCurrentLocation(lat: number, lng: number) {
      currentLocation.value = { lat, lng }
    }

    // ─── 카카오 모빌리티 실제 도로 경로 ──────────────────────────

    async function buildRouteToStation(): Promise<void> {
      const startPoint = origin.value ?? currentLocation.value
      if (!startPoint || !selectedStation.value) {
        console.warn('❌ buildRouteToStation: 출발지 또는 선택 주유소 없음')
        return
      }

      try {
        const result = await fetchKakaoRoute(
          { lat: startPoint.lat, lng: startPoint.lng },
          { lat: selectedStation.value.lat, lng: selectedStation.value.lng },
        )

        routePath.value = result.path
        routeSummary.value = {
          distanceM: result.totalDistanceM,
          durationSec: result.totalDurationSec,
        }

        console.log('✅ 주유소까지 경로 생성됨', result.path.length, '개 좌표')
      } catch (err) {
        console.error('카카오 경로(주유소) 오류:', err)
        routePath.value = [
          { lat: startPoint.lat, lng: startPoint.lng },
          { lat: selectedStation.value.lat, lng: selectedStation.value.lng },
        ]
        routeSummary.value = null
      }
    }

    async function buildRouteToDestination(): Promise<void> {
      const startPoint = selectedStation.value
        ? { lat: selectedStation.value.lat, lng: selectedStation.value.lng }
        : currentLocation.value

      if (!startPoint || !destination.value) {
        console.warn('❌ buildRouteToDestination: 시작 또는 목적지 없음')
        return
      }

      try {
        const result = await fetchKakaoRoute(
          { lat: startPoint.lat, lng: startPoint.lng },
          { lat: destination.value.lat, lng: destination.value.lng },
        )

        routePath.value = result.path
        routeSummary.value = {
          distanceM: result.totalDistanceM,
          durationSec: result.totalDurationSec,
        }

        console.log('✅ 목적지까지 경로 생성됨', result.path.length, '개 좌표')
      } catch (err) {
        console.error('카카오 경로(목적지) 오류:', err)
        routePath.value = [
          { lat: startPoint.lat, lng: startPoint.lng },
          { lat: destination.value.lat, lng: destination.value.lng },
        ]
        routeSummary.value = null
      }
    }

    async function buildFullRoute(): Promise<void> {
      if (!origin.value || !selectedStation.value || !destination.value) return

      try {
        const result = await fetchKakaoRoute(
          { lat: origin.value.lat, lng: origin.value.lng },
          { lat: destination.value.lat, lng: destination.value.lng },
          { lat: selectedStation.value.lat, lng: selectedStation.value.lng },
        )

        routePath.value = result.path
        routeSummary.value = {
          distanceM: result.totalDistanceM,
          durationSec: result.totalDurationSec,
        }

        console.log('✅ 전체 경로 생성됨 (경유지 포함)', result.path.length, '개 좌표')
      } catch (err) {
        console.error('카카오 전체 경로 오류:', err)
        routePath.value = []
        routeSummary.value = null
      }
    }

    // ─── 내비게이션 제어 ──────────────────────────────────────────

    async function startNavigationToStation() {
      console.log('✅ startNavigationToStation 실행')

      if (!selectedStation.value) {
        error.value = '먼저 주유소를 선택하세요.'
        return
      }

      navigationStep.value = 'to_station'
      pageMode.value = 'navigating'
      error.value = ''

      const center = origin.value ?? currentLocation.value ?? selectedStation.value
      mapCenter.value = { lat: center.lat, lng: center.lng }

      await buildRouteToStation()
    }

    async function startNavigationToDestination() {
      console.log('✅ startNavigationToDestination 실행')

      if (!destination.value) {
        error.value = '최종 목적지가 없습니다.'
        return
      }

      navigationStep.value = 'to_destination'
      error.value = ''

      const center = selectedStation.value ?? currentLocation.value ?? destination.value
      mapCenter.value = { lat: center.lat, lng: center.lng }

      await buildRouteToDestination()
    }

    function stopNavigation() {
      console.log('🛑 길찾기 종료')

      navigationStep.value = 'idle'
      pageMode.value = 'planning'
      routePath.value = []
      routeSummary.value = null
      selectedStation.value = null

      mapCenter.value = origin.value
        ? { lat: origin.value.lat, lng: origin.value.lng }
        : { lat: 35.8691, lng: 128.5945 }
    }

    function clearRoutePlan() {
      origin.value = null
      destination.value = null
      recommendedStations.value = []
      selectedStation.value = null
      error.value = ''
      navigationStep.value = 'idle'
      routePath.value = []
      routeSummary.value = null
    }

    // ─── 추천 API 호출 ────────────────────────────────────────────

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
        routeSummary.value = null

        // 도로 위 좌표 보정 (교차로·캠퍼스 등 비도로 좌표 대응)
        const [snappedOrigin, snappedDestination] = await Promise.all([
          snapCoordToRoad(origin.value.lat, origin.value.lng),
          snapCoordToRoad(destination.value.lat, destination.value.lng),
        ])

        console.log('보정 전:', origin.value.lat, origin.value.lng, '→ 보정 후:', snappedOrigin)
        console.log('보정 전:', destination.value.lat, destination.value.lng, '→ 보정 후:', snappedDestination)

        const response = await fetchRouteRecommendations({
          originLatitude: snappedOrigin.lat,
          originLongitude: snappedOrigin.lng,
          destinationLatitude: snappedDestination.lat,
          destinationLongitude: snappedDestination.lng,
          fuelType: 'GASOLINE',
          refuelLiters: 40,
          fuelEfficiency: 12,
          limit: 3,
        })

        recommendedStations.value = mapRouteRecommendationsToGasStations(response)

        const first = recommendedStations.value[0]
        if (first) {
          mapCenter.value = { lat: first.lat, lng: first.lng }
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
            err instanceof Error ? err.message : '경로 추천 정보를 불러오지 못했습니다.'
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
      routeSummary,
      pageMode,
      setOrigin,
      setDestination,
      selectRecommendedStation,
      updateCurrentLocation,
      startNavigationToStation,
      startNavigationToDestination,
      stopNavigation,
      clearRoutePlan,
      loadRouteRecommendations,
      buildRouteToStation,
      buildRouteToDestination,
      buildFullRoute,
    }
  })