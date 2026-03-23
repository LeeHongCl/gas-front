import type { GasStation } from '@/types/gasStation'

export const gasStations: GasStation[] = [
  {
    id: '1',
    name: '행복주유소',
    brand: 'SK에너지',
    address: '대구 중구 중앙대로 100',
    tel: '053-111-1111',
    lat: 35.8691,
    lng: 128.5945,
    gasolinePrice: 1645,
    dieselPrice: 1498,
    isSelf: true,
    hasCarWash: true,
    hasStore: false,
  },
  {
    id: '2',
    name: '중앙에너지주유소',
    brand: 'GS칼텍스',
    address: '대구 중구 국채보상로 120',
    tel: '053-222-2222',
    lat: 35.8675,
    lng: 128.5968,
    gasolinePrice: 1639,
    dieselPrice: 1489,
    isSelf: false,
    hasCarWash: false,
    hasStore: true,
  },
  {
    id: '3',
    name: '동성로셀프주유소',
    brand: '현대오일뱅크',
    address: '대구 중구 동성로 2길 80',
    tel: '053-333-3333',
    lat: 35.8683,
    lng: 128.5982,
    gasolinePrice: 1652,
    dieselPrice: 1503,
    isSelf: true,
    hasCarWash: false,
    hasStore: true,
  },
  {
    id: '4',
    name: '반월당주유소',
    brand: 'S-OIL',
    address: '대구 중구 달구벌대로 2100',
    tel: '053-444-4444',
    lat: 35.8657,
    lng: 128.5932,
    gasolinePrice: 1648,
    dieselPrice: 1495,
    isSelf: false,
    hasCarWash: true,
    hasStore: true,
  },
  
]
export interface GasStation {
  id: string
  name: string
  brand: string
  address: string
  tel: string
  lat: number
  lng: number
  gasolinePrice: number
  dieselPrice: number
  isSelf: boolean
  hasCarWash: boolean
  hasStore: boolean
}

export interface CurrentPosition {
  lat: number
  lng: number
}