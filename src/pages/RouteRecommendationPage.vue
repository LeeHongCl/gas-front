<template>
  <div class="page">
    <div class="map-area">
      <div class="map-canvas">
        <KakaoMapView
          :stations="routeStore.routePath.length && routeStore.selectedStation
            ? [routeStore.selectedStation]
            : routeStore.recommendedStations"
          :selected-station="routeStore.selectedStation"
          :center="routeStore.mapCenter"
          :route-path="routeStore.routePath"
          :all-route-paths="routeStore.allRoutePaths"
          :current-location="routeStore.currentLocation"
          :origin-point="routeStore.origin"
          :destination-point="routeStore.destination"
          :station-colors="ROUTE_COLORS"
          :show-center-marker="false"
          :active-route-station-id="activeRouteStationId"
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

        <!-- 경로 비교 버튼 -->
        <div
          v-if="routeStore.recommendedStations.length > 0"
          class="compare-bar"
          :style="{ bottom: compareBarBottom + 'px' }"
        >
          <button
            class="compare-btn"
            :class="{ active: routeStore.allRoutePaths.length > 0 }"
            :disabled="routeStore.allRoutesLoading"
            @click="handleCompareRoutes"
          >
            <span v-if="routeStore.allRoutesLoading" class="btn-spinner" />
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            {{ routeStore.allRoutesLoading ? '경로 계산 중...' : routeStore.allRoutePaths.length > 0 ? '경로 비교 닫기' : '경로 비교' }}
          </button>

          <!-- 범례 -->
          <div v-if="routeStore.allRoutePaths.length > 0" class="legend">
            <button
              v-for="(item, i) in routeStore.allRoutePaths"
              :key="item.stationId"
              class="legend-item"
              :class="{ 'legend-item--active': activeRouteStationId === item.stationId }"
              @click="toggleActiveRoute(item.stationId)"
            >
              <span class="legend-dot" :style="{ background: item.color }" />
              {{ routeStore.recommendedStations[i]?.name ?? `주유소 ${i + 1}` }}
            </button>
          </div>
        </div>

        <StationBottomSheet
          ref="bottomSheetRef"
          :stations="routeStore.recommendedStations"
          :expanded="sheetExpanded"
          mode="route"
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="19" r="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="18" cy="5" r="2" stroke="currentColor" stroke-width="2"/>
              <path d="M6 17V9a6 6 0 016-6h0M18 7v8a6 6 0 01-6 6h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="summary-item">{{ formatDistance(routeStore.routeSummary.distanceM) }}</span>
            <span class="summary-divider">·</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="summary-item">{{ formatDuration(routeStore.routeSummary.durationSec) }}</span>
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
            {{ navigatingToDestination ? '경로 계산 중...' : '주유소 도착 — 목적지로 출발' }}
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
import { onMounted, onUnmounted, ref, computed } from 'vue'
import KakaoMapView from '@/components/KakaoMapView.vue'
import StationBottomSheet from '@/components/StationBottomSheet.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import RoutePointForm from '@/components/route/RoutePointForm.vue'
import { useRouteStore } from '@/stores/route'

const routeStore = useRouteStore()
const ROUTE_COLORS = ['#2563eb', '#ea580c', '#16a34a']
const sheetExpanded = ref(true)
const navigatingToDestination = ref(false)
const activeRouteStationId = ref<string | null>(null)

function toggleActiveRoute(stationId: string) {
  activeRouteStationId.value = activeRouteStationId.value === stationId ? null : stationId
}
const bottomSheetRef = ref<{ sheetHeight: number } | null>(null)

const compareBarBottom = computed(() => {
  const sheetH = bottomSheetRef.value?.sheetHeight ?? 220
  return sheetH + 12
})

async function handleCompareRoutes() {
  if (routeStore.allRoutePaths.length > 0) {
    routeStore.clearAllRoutes()
    activeRouteStationId.value = null
  } else {
    await routeStore.buildAllRoutes()
  }
}

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
  height: calc(100dvh - 78px);
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
  border-radius: var(--radius-xl);
  background: white;
  box-shadow: var(--shadow-lg);
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

.nav-dot.to_station     { background: var(--color-primary); }
.nav-dot.to_destination { background: var(--color-success); }

.nav-title { font-size: 16px; font-weight: 800; }

.nav-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--color-gray-50);
}

.summary-item { font-size: 13px; font-weight: 700; color: var(--color-gray-700); }
.summary-divider { color: var(--color-gray-300); }

.nav-sub {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--color-gray-500);
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
  height: 56px;
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: white;
  font-size: 15px;
  font-weight: 800;
  box-shadow: var(--shadow-blue);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.arrive-btn:active   { transform: scale(0.98); }
.arrive-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.exit-nav-btn {
  width: 100%;
  height: 50px;
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--color-gray-900);
  color: white;
  font-size: 15px;
  font-weight: 800;
  transition: opacity var(--transition-fast);
}

.exit-nav-btn:active { opacity: 0.8; }

.compare-bar {
  position: absolute;
  left: 16px;
  right: 16px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  pointer-events: none;
  transition: bottom 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.compare-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border: 0;
  border-radius: var(--radius-full);
  background: white;
  color: var(--color-gray-800);
  font-size: 13px;
  font-weight: 700;
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.compare-btn.active {
  background: var(--color-gray-900);
  color: white;
}

.compare-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0,0,0,0.15);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  pointer-events: none;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1.5px solid transparent;
  border-radius: var(--radius-full);
  background: white;
  font-size: 12px;
  font-weight: 700;
  box-shadow: var(--shadow-md);
  color: var(--color-gray-700);
  cursor: pointer;
  pointer-events: auto;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.legend-item--active {
  border-color: var(--color-gray-800);
  box-shadow: var(--shadow-lg);
  transform: scale(1.05);
}

.legend-item:active {
  transform: scale(0.97);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

</style>
