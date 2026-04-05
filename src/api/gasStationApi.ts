import type {
  RouteRecommendationItem,
  RouteRecommendationRequest,
} from '@/types/gasRecommendation';

const BASE_URL = 'http://43.203.29.58:8080';

export async function fetchRouteRecommendations(
  params: RouteRecommendationRequest,
): Promise<RouteRecommendationItem[]> {
  const safeLimit = Math.min(Math.max(params.limit, 1), 5);

  if (params.fuelEfficiency <= 0) {
    throw new Error('연비는 0보다 커야 합니다.');
  }

  if (params.refuelLiters <= 0) {
    throw new Error('주유량은 0보다 커야 합니다.');
  }

  const searchParams = new URLSearchParams({
    originLatitude: String(params.originLatitude),
    originLongitude: String(params.originLongitude),
    destinationLatitude: String(params.destinationLatitude),
    destinationLongitude: String(params.destinationLongitude),
    fuelType: params.fuelType,
    refuelLiters: String(params.refuelLiters),
    fuelEfficiency: String(params.fuelEfficiency),
    limit: String(safeLimit),
  });

  const response = await fetch(
    `${BASE_URL}/api/gas-stations/recommendations/route?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`경로 기반 추천 조회 실패: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as RouteRecommendationItem[];

  if (!Array.isArray(data)) {
    throw new Error('예상한 응답 형식이 아닙니다.');
  }

  return data;
}