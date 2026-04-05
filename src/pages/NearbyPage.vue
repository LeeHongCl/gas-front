<template>
  <div class="nearby-page">
    <header class="page-header">
      <h1>주변 주유소</h1>
      <p>버튼을 누르면 추천 주유소를 불러옵니다.</p>
    </header>

    <section class="action-section">
      <button class="load-btn" :disabled="loading" @click="loadStations">
        {{ loading ? '불러오는 중...' : '추천 주유소 불러오기' }}
      </button>
    </section>

    <p v-if="error" class="error-text">{{ error }}</p>

    <section class="map-section">
      <KakaoMapView
        :stations="stations"
        :selectedStation="selectedStation"
        :center="mapCenter"
        @select-station="selectStation"
      />
    </section>

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
import { ref } from 'vue';
import KakaoMapView from '@/components/KakaoMapView.vue';
import StationCard from '@/components/StationCard.vue';
import StationDetailSheet from '@/components/StationDetailSheet.vue';
import type { GasStation } from '@/types/gasStation';
import { fetchRouteRecommendations } from '@/api/gasStationApi';
import { mapRouteRecommendationsToGasStations } from '@/utils/mapRouteRecommendationsToGasStations';

const stations = ref<GasStation[]>([]);
const selectedStation = ref<GasStation | null>(null);
const loading = ref(false);
const error = ref('');

const mapCenter = ref({
  lat: 35.8691,
  lng: 128.5945,
});

function selectStation(station: GasStation) {
  selectedStation.value = station;
  mapCenter.value = {
    lat: station.lat,
    lng: station.lng,
  };
}

async function loadStations() {
  console.log('loadStations 실행됨');

  try {
    loading.value = true;
    error.value = '';
    selectedStation.value = null;

    const response = await fetchRouteRecommendations({
      originLatitude: 35.8714,
      originLongitude: 128.6014,
      destinationLatitude: 35.1796,
      destinationLongitude: 129.0756,
      fuelType: 'GASOLINE',
      refuelLiters: 40,
      fuelEfficiency: 12,
      limit: 3,
    });

    stations.value = mapRouteRecommendationsToGasStations(response);
    console.log('변환된 stations:', stations.value);

    const firstStation = stations.value[0];
    if (firstStation) {
      mapCenter.value = {
        lat: firstStation.lat,
        lng: firstStation.lng,
      };
    }
  } catch (err) {
    console.error('loadStations 에러:', err);
    error.value =
      err instanceof Error
        ? err.message
        : '주유소 데이터를 불러오지 못했습니다.';
    stations.value = [];
  } finally {
    loading.value = false;
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
  margin: 8px 0 0;
  color: #6b7280;
}

.action-section {
  margin-top: 16px;
}

.load-btn {
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #111827;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  margin-top: 12px;
  color: #dc2626;
}

.map-section {
  position: relative;
  width: 100%;
  height: 320px;
  margin-top: 18px;
  border-radius: 18px;
  overflow: hidden;
  background: #f3f4f6;
}

.empty-section {
  margin-top: 18px;
  padding: 20px;
  border-radius: 14px;
  background: #f9fafb;
  color: #6b7280;
  text-align: center;
}

.card-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}
</style>