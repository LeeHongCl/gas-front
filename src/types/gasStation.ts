export type GasStation = {
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

export type CurrentPosition = {
  lat: number
  lng: number
}