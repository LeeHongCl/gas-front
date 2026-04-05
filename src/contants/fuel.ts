import type { FuelType } from '@/types/gasRecommendation';

export const fuelTypeOptions: { label: string; value: FuelType }[] = [
  { label: '휘발유', value: 'GASOLINE' },
  { label: '경유', value: 'DIESEL' },
  { label: '고급휘발유', value: 'PREMIUM_GASOLINE' },
  { label: 'LPG', value: 'LPG' },
];

export const fuelTypeLabelMap: Record<FuelType, string> = {
  GASOLINE: '휘발유',
  DIESEL: '경유',
  PREMIUM_GASOLINE: '고급휘발유',
  LPG: 'LPG',
};