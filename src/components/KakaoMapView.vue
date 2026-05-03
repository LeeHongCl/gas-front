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
  setBounds: (bounds: KakaoBounds, pt?: number, pr?: number, pb?: number, pl?: number) => void
}

interface KakaoBounds {
  extend: (latlng: KakaoLatLng) => void
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

interface KakaoOverlayInstance {
  setMap: (map: KakaoMapInstance | null) => void
}

const props = defineProps<{
  stations: GasStation[]
  selectedStation: GasStation | null
  center: { lat: number; lng: number }
  routePath?: { lat: number; lng: number }[]
  currentLocation?: { lat: number; lng: number } | null
  autoFit?: boolean
  level?: number
  showCenterMarker?: boolean
  originPoint?: { lat: number; lng: number; name?: string } | null
  destinationPoint?: { lat: number; lng: number; name?: string } | null
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
let originOverlay: KakaoOverlayInstance | null = null
let destOverlay: KakaoOverlayInstance | null = null

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
  currentMarker = null
  if (props.showCenterMarker === false) return
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

  if (props.autoFit) {
    const bounds = new (window.kakao.maps.LatLngBounds as new () => KakaoBounds)()
    path.forEach((p) => bounds.extend(p))
    map.setBounds(bounds, 60, 40, 60, 40)
  }
}

function makeOverlayContent(label: string, color: string) {
  return `<div style="background:${color};color:white;padding:5px 10px;border-radius:20px;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);pointer-events:none">${label}</div>`
}

function renderOriginDestMarkers() {
  if (!map) return

  originOverlay?.setMap(null)
  originOverlay = null
  destOverlay?.setMap(null)
  destOverlay = null

  if (props.originPoint) {
    originOverlay = new (window.kakao.maps.CustomOverlay as new (opts: unknown) => KakaoOverlayInstance)({
      position: makeLatLng(props.originPoint.lat, props.originPoint.lng),
      content: makeOverlayContent(props.originPoint.name ?? '출발', '#2563eb'),
      yAnchor: 1.4,
      map,
    })
  }

  if (props.destinationPoint) {
    destOverlay = new (window.kakao.maps.CustomOverlay as new (opts: unknown) => KakaoOverlayInstance)({
      position: makeLatLng(props.destinationPoint.lat, props.destinationPoint.lng),
      content: makeOverlayContent(props.destinationPoint.name ?? '도착', '#16a34a'),
      yAnchor: 1.4,
      map,
    })
  }
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
    { center: makeLatLng(props.center.lat, props.center.lng), level: props.level ?? 4 },
  )

  renderCurrentLocationMarker()
  renderUserLocation()
  renderStationMarkers()
  renderRouteLine()
  renderOriginDestMarkers()

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
watch(() => [props.originPoint, props.destinationPoint], () => { if (map) renderOriginDestMarkers() }, { deep: true })
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
