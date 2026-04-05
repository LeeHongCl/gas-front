import type { RouteRecommendationItem } from '@/types/gasRecommendation';

export interface RouteRecommendationViewModel {
  id: string;
  rank: number;
  name: string;
  brand: string;
  latitude: number;
  longitude: number;
  price: number;
  distance: number;
  score: number;
  frontRoadSpeed: number;
  detourDistance: number;
  raw: RouteRecommendationItem;
}

export function toRouteRecommendationViewModel(
  items: RouteRecommendationItem[],
): RouteRecommendationViewModel[] {
  return items.map((item, index) => ({
    id: item.opinetStationId,
    rank: index + 1,
    name: item.name,
    brand: item.brand,
    latitude: item.latitude,
    longitude: item.longitude,
    price: item.price,
    distance: item.distance,
    score: item.score,
    frontRoadSpeed: item.frontRoadSpeed,
    detourDistance: item.detourDistance,
    raw: item,
  }));
}