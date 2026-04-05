export type FuelType =
  | 'GASOLINE'
  | 'DIESEL'
  | 'PREMIUM_GASOLINE'
  | 'LPG';

export interface RouteRecommendationRequest {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  fuelType: FuelType;
  refuelLiters: number;
  fuelEfficiency: number;
  limit: number;
}

export interface RouteRecommendationItem {
  opinetStationId: string;
  name: string;
  brand: string;
  latitude: number;
  longitude: number;
  price: number;
  distance: number;
  score: number;
  frontRoadSpeed: number;
  detourDistance: number;
}

export interface RadiusRecommendationRequest {
  latitude: number;
  longitude: number;
  radius: number;
  fuelType: FuelType;
  refuelLiters: number;
  fuelEfficiency: number;
  limit: number;
}
