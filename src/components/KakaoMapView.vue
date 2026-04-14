<template>
  <div ref="mapRef" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { GasStation } from '@/types/gasStation'
// window.kakao 전역 타입은 kakaoPlaceSearch.ts에서 선언됨
import '@/utils/kakaoPlaceSearch'

/** 카카오 SDK 인스턴스 최소 타입 */
interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void
  relayout: () => void
}

interface KakaoLatLng {
  getLat: () => number
  getLng: () => number
}

interface KakaoMarkerInstance {
  setMap: (map: KakaoMapInstance | null) => void
  setPosition: (latlng: KakaoLatLng) => void
}

interface KakaoPolylineInstance {
  setMap: (map: KakaoMapInstance | null) => void
}

const props = defineProps<{
  stations: GasStation[]
  selectedStation: GasStation | null
  center: { lat: number; lng: number }
  routePath?: { lat: number; lng: number }[]
  currentLocation?: { lat: number; lng: number } | null
}>()

const emit = defineEmits<{
  (e: 'select-station', station: GasStation): void
}>()

const mapRef = ref<HTMLElement | null>(null)

let map: KakaoMapInstance | null = null
let markers: KakaoMarkerInstance[] = []
let currentMarker: KakaoMarkerInstance | null = null
let userMarker: KakaoMarkerInstance | null = null
let polyline: KakaoPolylineInstance | null = null

function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => resolve())
      return
    }

    const existingScript = document.querySelector(
      'script[data-kakao-map="true"]',
    ) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        window.kakao.maps.load(() => resolve())
      })
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`
    script.async = true
    script.dataset.kakaoMap = 'true'

    script.onload = () => {
      window.kakao.maps.load(() => resolve())
    }

    script.onerror = () => reject(new Error('카카오맵 스크립트 로드 실패'))
    document.head.appendChild(script)
  })
}

function makeLatLng(lat: number, lng: number): KakaoLatLng {
  return new (window.kakao.maps.LatLng as new (lat: number, lng: number) => KakaoLatLng)(lat, lng)
}

function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null))
  markers = []
}

function renderCurrentLocationMarker() {
  if (!map) return
  currentMarker?.setMap(null)
  currentMarker = new (window.kakao.maps.Marker as new (opts: unknown) => KakaoMarkerInstance)({
    position: makeLatLng(props.center.lat, props.center.lng),
    map,
  })
}

function renderUserLocation() {
  if (!map || !props.currentLocation) return
  const position = makeLatLng(props.currentLocation.lat, props.currentLocation.lng)
  if (!userMarker) {
    userMarker = new (window.kakao.maps.Marker as new (opts: unknown) => KakaoMarkerInstance)({
      map,
      position,
    })
  } else {
    userMarker.setPosition(position)
  }
}

function renderStationMarkers() {
  if (!map) return
  clearMarkers()

  props.stations.forEach((station) => {
    const marker = new (window.kakao.maps.Marker as new (opts: unknown) => KakaoMarkerInstance)({
      map,
      position: makeLatLng(station.lat, station.lng),
      title: station.name,
    })

    window.kakao.maps.event.addListener(marker, 'click', () => {
      emit('select-station', station)
    })

    markers.push(marker)
  })
}

function renderRouteLine() {
  if (!map) return
  polyline?.setMap(null)
  polyline = null

  const pathData = props.routePath ?? []
  if (pathData.length < 2) return

  const path = pathData.map((point) => makeLatLng(point.lat, point.lng))

  polyline = new (window.kakao.maps.Polyline as new (opts: unknown) => KakaoPolylineInstance)({
    map,
    path,
    strokeWeight: 5,
    strokeColor: '#2563eb',
    strokeOpacity: 0.8,
    strokeStyle: 'solid',
  })
}

function moveCenter(lat: number, lng: number) {
  if (!map) return
  map.setCenter(makeLatLng(lat, lng))
}

async function initMap() {
  if (!mapRef.value) return
  await loadKakaoMapScript()

  map = new (window.kakao.maps.Map as new (container: HTMLElement, opts: unknown) => KakaoMapInstance)(
    mapRef.value,
    { center: makeLatLng(props.center.lat, props.center.lng), level: 4 },
  )

  renderCurrentLocationMarker()
  renderUserLocation()
  renderStationMarkers()
  renderRouteLine()

  setTimeout(() => {
    map?.relayout()
    map?.setCenter(makeLatLng(props.center.lat, props.center.lng))
  }, 0)
}

onMounted(async () => {
  try {
    await initMap()
  } catch (error) {
    console.error(error)
  }
})

watch(() => props.stations,    () => { if (map) renderStationMarkers() }, { deep: true })
watch(() => props.center,      (c) => { if (map) { moveCenter(c.lat, c.lng); renderCurrentLocationMarker() } }, { deep: true })
watch(() => props.selectedStation, () => { if (map && props.selectedStation) moveCenter(props.selectedStation.lat, props.selectedStation.lng) })
watch(() => props.currentLocation, () => { if (map) renderUserLocation() }, { deep: true })
watch(() => props.routePath,   () => { if (map) renderRouteLine() }, { deep: true })
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
