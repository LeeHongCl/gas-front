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
        <!-- 상단 상태 카드 -->
        <div class="nav-top-card">
          <div class="nav-status">
            <span class="nav-dot" :class="routeStore.navigationStep" />
            <strong>
              {{
                routeStore.navigationStep === 'to_station'
                  ? `${routeStore.selectedStation?.name ?? '주유소'}로 이동 중`
                  : `${routeStore.destination?.name ?? '목적지'}로 이동 중`
              }}
            </strong>
          </div>
          <p class="nav-sub">
            {{
              routeStore.navigationStep === 'to_station'
                ? '주유소에 도착하면 아래 버튼을 눌러주세요'
                : '목적지까지 안내 중입니다'
            }}
          </p>
        </div>

        <!-- 하단 버튼 패널 -->
        <div class="nav-bottom-panel">
          <!-- 주유소 → 목적지 단계 전환 버튼 (to_station 일 때만) -->
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

    <!-- 상세 시트는 추천 모드에서만 -->
    <StationDetailSheet
      v-if="routeStore.pageMode === 'planning'"
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

let watchId: number | null = null

onMounted(() => {
  if (!navigator.geolocation) return

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      routeStore.updateCurrentLocation(pos.coords.latitude, pos.coords.longitude)
    },
    (err) => {
      console.error(err)
    },
  )
})

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
  }
})
</script>

<style scoped>
.page {
  min-height: 100dvh;
}

.map-area {
  position: relative;
  height: calc(100dvh - 82px);
  overflow: hidden;
}

.map-canvas {
  position: absolute;
  inset: 0;
}

/* 🔵 추천 UI */
.top-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 30;
}

/* 🔴 내비 UI */
.nav-top-card {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 40;
  padding: 16px 18px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.1);
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

.nav-dot.to_station {
  background: #2563eb;
}

.nav-dot.to_destination {
  background: #16a34a;
}

.nav-status strong {
  font-size: 16px;
}

.nav-sub {
  margin: 8px 0 0 20px;
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
  height: 52px;
  border: 0;
  border-radius: 14px;
  background: #2563eb;
  color: white;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.arrive-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.exit-nav-btn {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: #111827;
  color: white;
  font-weight: 800;
  cursor: pointer;
}
</style>
