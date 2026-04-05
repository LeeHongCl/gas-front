<template>
  <div ref="mapRef" class="map-container"></div>
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
  center: {
    lat: number
    lng: number
  }
}>()

const emit = defineEmits<{
  (e: 'select-station', station: GasStation): void
}>()

const mapRef = ref<HTMLElement | null>(null)

let map: any = null
let markers: any[] = []
let currentMarker: any = null

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY

function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve()
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
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=d8d3668f7759340c2f4dcb70c0f701bd&autoload=false`
    script.async = true
    script.dataset.kakaoMap = 'true'

    script.onload = () => {
      window.kakao.maps.load(() => resolve())
    }

    script.onerror = () => reject(new Error('카카오맵 스크립트 로드 실패'))
    document.head.appendChild(script)
  })
}

function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null))
  markers = []
}

function renderCurrentLocationMarker() {
  if (!map) return

  if (currentMarker) {
    currentMarker.setMap(null)
  }

  currentMarker = new window.kakao.maps.Marker({
    position: new window.kakao.maps.LatLng(props.center.lat, props.center.lng),
    map,
  })
}

function renderStationMarkers() {
  if (!map) return

  clearMarkers()

  props.stations.forEach((station) => {
    const markerPosition = new window.kakao.maps.LatLng(station.lat, station.lng)

    const marker = new window.kakao.maps.Marker({
      map,
      position: markerPosition,
      title: station.name,
    })

    window.kakao.maps.event.addListener(marker, 'click', () => {
      emit('select-station', station)
    })

    markers.push(marker)
  })
}

function moveCenter(lat: number, lng: number) {
  if (!map) return
  const moveLatLng = new window.kakao.maps.LatLng(lat, lng)
  map.setCenter(moveLatLng)
}

function focusSelectedStation() {
  if (!map || !props.selectedStation) return
  moveCenter(props.selectedStation.lat, props.selectedStation.lng)
}

async function initMap() {
  if (!mapRef.value) return
  await loadKakaoMapScript()

  const options = {
    center: new window.kakao.maps.LatLng(props.center.lat, props.center.lng),
    level: 4,
  }

  map = new window.kakao.maps.Map(mapRef.value, options)

  renderCurrentLocationMarker()
  renderStationMarkers()
}

onMounted(async () => {
  try {
    await initMap()
  } catch (error) {
    console.error(error)
  }
})

watch(
  () => props.stations,
  () => {
    if (!map) return
    renderStationMarkers()
  },
  { deep: true },
)

watch(
  () => props.center,
  (newCenter) => {
    if (!map) return
    moveCenter(newCenter.lat, newCenter.lng)
    renderCurrentLocationMarker()
  },
  { deep: true },
)

watch(
  () => props.selectedStation,
  () => {
    focusSelectedStation()
  },
)
</script>

<style scoped>
.map-container {
  position: absolute;
  inset: 0;
}
</style>