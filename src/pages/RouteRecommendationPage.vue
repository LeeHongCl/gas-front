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
          <strong>
            {{
              routeStore.navigationStep === 'to_station'
                ? `${routeStore.selectedStation?.name ?? ''}로 이동 중`
                : '목적지로 이동 중'
            }}
          </strong>
          <p>현재 내비게이션 진행 중입니다</p>
        </div>

        <div class="nav-bottom-panel">
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

let watchId: number | null = null

onMounted(() => {
  if (!navigator.geolocation) return

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      routeStore.updateCurrentLocation(
        pos.coords.latitude,
        pos.coords.longitude,
      )
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
  padding: 16px;
  border-radius: 18px;
  background: white;
  font-weight: 700;
}

.nav-bottom-panel {
  position: absolute;
  bottom: 20px;
  left: 16px;
  right: 16px;
  z-index: 40;
}

.exit-nav-btn {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: black;
  color: white;
  font-weight: 800;
}
</style>