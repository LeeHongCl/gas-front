<template>
  <div class="page">
    <div class="map-area">
      <div class="map-canvas">
        <KakaoMapView
          :stations="routeStore.recommendedStations"
          :selected-station="routeStore.selectedStation"
          :center="routeStore.mapCenter"
          :route-path="routeStore.routePath"
          :current-location="routeStore.currentLocation"
          @select-station="routeStore.selectRecommendedStation"
        />
      </div>

      <!-- 🔵 추천 모드 -->
      <template v-if="routeStore.pageMode === 'planning'">
        <div class="top-panel">
          <RoutePointForm
            :origin="routeStore.origin"
            :destination="routeStore.destination"
            :loading="routeStore.loading"
            @update-origin="routeStore.setOrigin"
            @update-destination="routeStore.setDestination"
            @search-route="routeStore.loadRouteRecommendations"
            @clear-route="routeStore.clearRoutePlan"
          />
        </div>

        <StationBottomSheet
          :stations="routeStore.recommendedStations"
          :expanded="sheetExpanded"
          @toggle-expand="sheetExpanded = !sheetExpanded"
          @select-station="routeStore.selectRecommendedStation"
        />
      </template>

      <!-- 🔴 내비 모드 -->
      <template v-else>
        <div class="nav-top-card">
          <div class="nav-status">
            <span class="nav-dot" :class="routeStore.navigationStep" />
            <strong class="nav-title">
              {{
                routeStore.navigationStep === 'to_station'
                  ? `${routeStore.selectedStation?.name ?? '주유소'}로 이동 중`
                  : `${routeStore.destination?.name ?? '목적지'}로 이동 중`
              }}
            </strong>
          </div>

          <div v-if="routeStore.routeSummary" class="nav-summary">
            <span class="summary-item">🛣️ {{ formatDistance(routeStore.routeSummary.distanceM) }}</span>
            <span class="summary-divider">·</span>
            <span class="summary-item">⏱️ {{ formatDuration(routeStore.routeSummary.durationSec) }}</span>
          </div>

          <p class="nav-sub">
            {{
              routeStore.navigationStep === 'to_station'
                ? '주유소에 도착하면 아래 버튼을 눌러주세요'
                : '목적지까지 안내 중입니다'
            }}
          </p>
        </div>

        <div class="nav-bottom-panel">
          <button
            v-if="routeStore.navigationStep === 'to_station'"
            class="arrive-btn"
            :disabled="navigatingToDestination"
            @click="handleArrive"
          >
            {{ navigatingToDestination ? '경로 계산 중...' : '🚗 주유소 도착 — 목적지로 출발' }}
          </button>

          <button class="exit-nav-btn" @click="routeStore.stopNavigation()">
            길찾기 종료
          </button>
        </div>
      </template>
    </div>

    <!-- 상세 시트는 추천 모드에서만 - route 모드 -->
    <StationDetailSheet
      v-if="routeStore.pageMode === 'planning'"
      mode="route"
      :station="routeStore.selectedStation"
      @close="routeStore.selectedStation = null"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import KakaoMapView from '@/components/KakaoMapView.vue'
import StationBottomSheet from '@/components/StationBottomSheet.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import RoutePointForm from '@/components/route/RoutePointForm.vue'
import { useRouteStore } from '@/stores/route'

const routeStore = useRouteStore()
const sheetExpanded = ref(true)
const navigatingToDestination = ref(false)

async function handleArrive() {
  navigatingToDestination.value = true
  try {
    await routeStore.startNavigationToDestination()
  } finally {
    navigatingToDestination.value = false
  }
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

function formatDuration(seconds: number) {
  const min = Math.round(seconds / 60)
  if (min < 60) return `${min}분`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

let watchId: number | null = null

onMounted(() => {
  if (!navigator.geolocation) return
  watchId = navigator.geolocation.watchPosition(
    (pos) => routeStore.updateCurrentLocation(pos.coords.latitude, pos.coords.longitude),
    (err) => console.error(err),
  )
})

onUnmounted(() => {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
})
</script>

<style scoped>
.page { min-height: 100dvh; }

.map-area {
  position: relative;
  height: calc(100dvh - 82px);
  overflow: hidden;
}

.map-canvas { position: absolute; inset: 0; }

.top-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 30;
}

.nav-top-card {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 40;
  padding: 16px 18px;
  border-radius: 20px;
  background: white;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.12);
}

.nav-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.nav-dot.to_station     { background: #2563eb; }
.nav-dot.to_destination { background: #16a34a; }

.nav-title { font-size: 16px; font-weight: 800; }

.nav-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f8fafc;
}

.summary-item { font-size: 13px; font-weight: 700; color: #374151; }
.summary-divider { color: #d1d5db; }

.nav-sub {
  margin: 8px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.nav-bottom-panel {
  position: absolute;
  bottom: 20px;
  left: 16px;
  right: 16px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.arrive-btn {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 16px;
  background: #2563eb;
  color: white;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s, transform 0.1s;
}

.arrive-btn:active   { transform: scale(0.98); }
.arrive-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.exit-nav-btn {
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: 16px;
  background: #111827;
  color: white;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.exit-nav-btn:active { opacity: 0.8; }
</style>
