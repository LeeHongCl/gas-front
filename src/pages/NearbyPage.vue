<template>
  <div class="nearby-page">
    <header class="page-header">
      <h1>주변 주유소 테스트</h1>
      <p>반경 / 경로 추천을 각각 테스트할 수 있습니다.</p>
    </header>

    <!-- 🔥 버튼 2개 -->
    <section class="action-section">
      <button class="load-btn" :disabled="loading" @click="loadRadiusStations">
        반경 추천
      </button>

      <button class="load-btn route" :disabled="loading" @click="loadRouteStations">
        경로 추천
      </button>
    </section>

    <p v-if="error" class="error-text">{{ error }}</p>

    <!-- 지도 -->
    <section class="map-section">
      <KakaoMapView
        :stations="stations"
        :selectedStation="selectedStation"
        :center="mapCenter"
        @select-station="selectStation"
      />
    </section>

    <!-- 리스트 -->
    <section v-if="!loading && stations.length === 0" class="empty-section">
      아직 조회된 주유소가 없습니다.
    </section>

    <section v-else class="card-list">
      <StationCard
        v-for="station in stations"
        :key="station.id"
        :station="station"
        @select="selectStation"
      />
    </section>

    <StationDetailSheet
      :station="selectedStation"
      @close="selectedStation = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KakaoMapView from '@/components/KakaoMapView.vue'
import StationCard from '@/components/StationCard.vue'
import StationDetailSheet from '@/components/StationDetailSheet.vue'
import type { GasStation } from '@/types/gasStation'

import {
  fetchRadiusRecommendations,
  fetchRouteRecommendations,
} from '@/api/gasStationApi'

import { mapRouteRecommendationsToGasStations } from '@/utils/mapRouteRecommendationsToGasStations'

const stations = ref<GasStation[]>([])
const selectedStation = ref<GasStation | null>(null)
const loading = ref(false)
const error = ref('')

const mapCenter = ref({
  lat: 35.8691,
  lng: 128.5945,
})

function selectStation(station: GasStation) {
  selectedStation.value = station
  mapCenter.value = {
    lat: station.lat,
    lng: station.lng,
  }
}

//
// 🔥 반경 추천
//
async function loadRadiusStations() {
  console.log('반경 추천 실행')

  try {
    loading.value = true
    error.value = ''
    selectedStation.value = null

    const response = await fetchRadiusRecommendations({
      latitude: mapCenter.value.lat,
      longitude: mapCenter.value.lng,
      radius: 3000,
      fuelType: 'GASOLINE',
      refuelLiters: 40,
      fuelEfficiency: 12,
      limit: 3,
    })

    stations.value = mapRouteRecommendationsToGasStations(response)

    console.log('반경 결과:', stations.value)
  } catch (err) {
    console.error(err)
    error.value = '반경 추천 실패'
    stations.value = []
  } finally {
    loading.value = false
  }
}

//
// 🔥 경로 추천
//
async function loadRouteStations() {
  console.log('경로 추천 실행')

  try {
    loading.value = true
    error.value = ''
    selectedStation.value = null

    const response = await fetchRouteRecommendations({
      originLatitude: mapCenter.value.lat,
      originLongitude: mapCenter.value.lng,
      destinationLatitude: 35.1796, // 부산 (테스트용)
      destinationLongitude: 129.0756,
      fuelType: 'GASOLINE',
      refuelLiters: 40,
      fuelEfficiency: 12,
      limit: 3,
    })

    stations.value = mapRouteRecommendationsToGasStations(response)

    console.log('경로 결과:', stations.value)
  } catch (err) {
    console.error(err)
    error.value = '경로 추천 실패'
    stations.value = []
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.nearby-page {
  padding: calc(16px + env(safe-area-inset-top)) 16px 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
}

.page-header p {
  margin-top: 6px;
  color: #6b7280;
}

.action-section {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.load-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #111827;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.load-btn.route {
  background: #2563eb;
}

.load-btn:disabled {
  opacity: 0.6;
}

.map-section {
  height: 320px;
  margin-top: 18px;
  border-radius: 18px;
  overflow: hidden;
}

.card-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.empty-section {
  margin-top: 18px;
  text-align: center;
  color: #6b7280;
}

.error-text {
  margin-top: 10px;
  color: red;
}
</style>