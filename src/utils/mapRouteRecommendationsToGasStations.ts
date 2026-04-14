import type { GasStation } from '@/types/gasStation';
import type { RouteRecommendationItem } from '@/types/gasRecommendation';

export function mapRouteRecommendationsToGasStations(
  items: RouteRecommendationItem[],
): GasStation[] {
  return items.map((item) => ({
    id: item.opinetStationId,
    name: item.name,
    brand: item.brand,
    address: '',
    tel: '',
    lat: item.latitude,
    lng: item.longitude,
    gasolinePrice: item.price,
    dieselPrice: item.price,
    isSelf: false,
    hasCarWash: false,
    hasStore: false,
    distance: item.distance / 1000, // API는 meter 단위, GasStation은 km 단위
  }));
}
