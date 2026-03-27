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
  distance?: number
  favorite?: boolean
}

export type FuelType = 'gasoline' | 'diesel'

export interface StationFilterState {
  fuelType: FuelType
  sortBy: 'distance' | 'price' | 'recommend'
  onlySelf: boolean
  hasCarWash: boolean
  hasStore: boolean
  radiusKm: number
}