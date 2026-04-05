import { ref } from 'vue';
import { fetchRouteRecommendations } from '@/api/gasStationApi';
import type {
  FuelType,
  RouteRecommendationRequest,
} from '@/types/gasRecommendation';
import {
  toRouteRecommendationViewModel,
  type RouteRecommendationViewModel,
} from '@/utils/routeRecommendation';

export function useRouteRecommendations() {
  console.log('✅ useRouteRecommendations 사용됨')

  const loading = ref(false);
  const error = ref('');
  const recommendations = ref<RouteRecommendationViewModel[]>([]);

  const form = ref<RouteRecommendationRequest>({
    originLatitude: 35.8714,
    originLongitude: 128.6014,
    destinationLatitude: 35.1796,
    destinationLongitude: 129.0756,
    fuelType: 'GASOLINE' as FuelType,
    refuelLiters: 40,
    fuelEfficiency: 12,
    limit: 3,
  });

  async function loadRecommendations() {
    try {
      loading.value = true;
      error.value = '';

      const data = await fetchRouteRecommendations(form.value);
      recommendations.value = toRouteRecommendationViewModel(data);
    } catch (err) {
      console.error(err);
      error.value =
        err instanceof Error
          ? err.message
          : '경로 기반 추천 정보를 불러오지 못했습니다.';
      recommendations.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    form,
    loading,
    error,
    recommendations,
    loadRecommendations,
  };
}