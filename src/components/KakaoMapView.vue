<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map"></div>

    <button
      class="current-location-btn"
      @click="moveToCurrentLocation"
      type="button"
    >
      현재 위치
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { GasStation } from '@/types/gasStation'

declare global {
  interface Window {
    kakao: any
  }
}

const props = defineProps<{
  stations: GasStation[]
  selectedStation: GasStation | null
}>()

const emit = defineEmits<{
  (e: 'select-station', station: GasStation): void
  (e: 'update-current-position', position: { lat: number; lng: number }): void
  (e: 'update-bounds', bounds: {
    swLat: number
    swLng: number
    neLat: number
    neLng: number
  }): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const map = ref<any>(null)
const clusterer = ref<any>(null)
const stationMarkers = ref<any[]>([])
const currentMarker = ref<any>(null)
const currentPosition = ref<{ lat: number; lng: number } | null>(null)
const polyline = ref<any>(null)
const activeOverlay = ref<any>(null)

const KAKAO_MAP_SDK_URL =
  'https://dapi.kakao.com/v2/maps/sdk.js?appkey=d8d3668f7759340c2f4dcb70c0f701bd&autoload=false&libraries=clusterer'

function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve()
      return
    }

    const existingScript = document.querySelector(
      'script[data-kakao-map-sdk="true"]'
    ) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () =>
        reject(new Error('카카오맵 SDK 로드 실패'))
      )
      return
    }

    const script = document.createElement('script')
    script.src = KAKAO_MAP_SDK_URL
    script.async = true
    script.dataset.kakaoMapSdk = 'true'

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'))

    document.head.appendChild(script)
  })
}

function emitBounds() {
  if (!map.value || !window.kakao) return

  const bounds = map.value.getBounds()
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()

  emit('update-bounds', {
    swLat: sw.getLat(),
    swLng: sw.getLng(),
    neLat: ne.getLat(),
    neLng: ne.getLng(),
  })
}

function createMarkerImage(isSelected: boolean) {
  const imageSrc = isSelected
    ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
    : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'

  const imageSize = isSelected
    ? new window.kakao.maps.Size(24, 35)
    : new window.kakao.maps.Size(29, 42)

  return new window.kakao.maps.MarkerImage(imageSrc, imageSize)
}

function clearStationMarkers() {
  if (clusterer.value) {
    clusterer.value.clear()
  }

  stationMarkers.value.forEach((marker) => marker.setMap(null))
  stationMarkers.value = []
}

function clearPolyline() {
  if (polyline.value) {
    polyline.value.setMap(null)
    polyline.value = null
  }
}

function clearOverlay() {
  if (activeOverlay.value) {
    activeOverlay.value.setMap(null)
    activeOverlay.value = null
  }
}

function createOverlayContent(station: GasStation): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'custom-overlay'

  wrapper.innerHTML = `
    <div class="overlay-card">
      <div class="overlay-title">${station.name}</div>
      <div class="overlay-brand">${station.brand}</div>
      <div class="overlay-price">휘발유 ${station.gasolinePrice}원</div>
      <div class="overlay-price">경유 ${station.dieselPrice}원</div>
      <button class="overlay-button">선택하기</button>
    </div>
  `

  wrapper.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  const button = wrapper.querySelector('.overlay-button')
  button?.addEventListener('click', () => {
    emit('select-station', station)
  })

  return wrapper
}

function showOverlay(station: GasStation) {
  if (!map.value || !window.kakao) return

  clearOverlay()

  const content = createOverlayContent(station)

  activeOverlay.value = new window.kakao.maps.CustomOverlay({
    map: map.value,
    position: new window.kakao.maps.LatLng(station.lat, station.lng),
    content,
    yAnchor: 1.25,
  })
}

function renderRouteLine() {
  if (!map.value || !window.kakao) return
  if (!currentPosition.value || !props.selectedStation) {
    clearPolyline()
    return
  }

  clearPolyline()

  const path = [
    new window.kakao.maps.LatLng(
      currentPosition.value.lat,
      currentPosition.value.lng
    ),
    new window.kakao.maps.LatLng(
      props.selectedStation.lat,
      props.selectedStation.lng
    ),
  ]

  polyline.value = new window.kakao.maps.Polyline({
    path,
    strokeWeight: 4,
    strokeColor: '#2563eb',
    strokeOpacity: 0.9,
    strokeStyle: 'solid',
  })

  polyline.value.setMap(map.value)
}

function renderStationMarkers() {
  if (!map.value || !window.kakao || !clusterer.value) return

  clearStationMarkers()

  const markers = props.stations.map((station) => {
    const isSelected = props.selectedStation?.id === station.id

    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(station.lat, station.lng),
      title: station.name,
      image: createMarkerImage(isSelected),
    })

    window.kakao.maps.event.addListener(marker, 'click', () => {
      showOverlay(station)
      emit('select-station', station)
    })

    return marker
  })

  stationMarkers.value = markers
  clusterer.value.addMarkers(markers)
}

function moveToSelectedStation() {
  if (!map.value || !props.selectedStation || !window.kakao) return

  const position = new window.kakao.maps.LatLng(
    props.selectedStation.lat,
    props.selectedStation.lng
  )

  map.value.setCenter(position)
  showOverlay(props.selectedStation)
}

function moveToCurrentLocation() {
  if (!map.value || !currentPosition.value || !window.kakao) return

  const position = new window.kakao.maps.LatLng(
    currentPosition.value.lat,
    currentPosition.value.lng
  )

  map.value.setCenter(position)
}

function initMap() {
  if (!mapContainer.value || !window.kakao || !window.kakao.maps) return

  window.kakao.maps.load(() => {
    if (!mapContainer.value) return

    const defaultLat = 35.8691
    const defaultLng = 128.5945
    const defaultCenter = new window.kakao.maps.LatLng(defaultLat, defaultLng)

    map.value = new window.kakao.maps.Map(mapContainer.value, {
      center: defaultCenter,
      level: 4,
    })

    clusterer.value = new window.kakao.maps.MarkerClusterer({
      map: map.value,
      averageCenter: true,
      minLevel: 6,
      disableClickZoom: false,
    })

    window.kakao.maps.event.addListener(map.value, 'click', () => {
      clearOverlay()
    })

    window.kakao.maps.event.addListener(map.value, 'idle', () => {
      emitBounds()
    })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        currentPosition.value = { lat, lng }
        emit('update-current-position', { lat, lng })

        const currentPos = new window.kakao.maps.LatLng(lat, lng)

        map.value.setCenter(currentPos)

        currentMarker.value = new window.kakao.maps.Marker({
          map: map.value,
          position: currentPos,
          title: '현재 위치',
        })

        renderStationMarkers()
        renderRouteLine()
        emitBounds()
      },
      () => {
        currentPosition.value = { lat: defaultLat, lng: defaultLng }
        emit('update-current-position', { lat: defaultLat, lng: defaultLng })

        currentMarker.value = new window.kakao.maps.Marker({
          map: map.value,
          position: defaultCenter,
          title: '현재 위치',
        })

        renderStationMarkers()
        renderRouteLine()
        emitBounds()
      }
    )
  })
}

watch(
  () => props.selectedStation,
  () => {
    renderStationMarkers()
    moveToSelectedStation()
    renderRouteLine()
  }
)

watch(
  () => props.stations,
  () => {
    renderStationMarkers()
  },
  { deep: true }
)

onMounted(async () => {
  try {
    await loadKakaoMapScript()
    initMap()
  } catch (error) {
    console.error(error)
  }
})
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map {
  width: 100%;
  height: 100%;
}

.current-location-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
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

.current-location-btn:hover {
  background-color: #f9fafb;
}

:deep(.overlay-card) {
  min-width: 180px;
  padding: 12px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
}

:deep(.overlay-title) {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

:deep(.overlay-brand) {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

:deep(.overlay-price) {
  margin-top: 6px;
  font-size: 12px;
  color: #374151;
}

:deep(.overlay-button) {
  margin-top: 10px;
  width: 100%;
  border: none;
  background-color: #2563eb;
  color: #ffffff;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}
</style>