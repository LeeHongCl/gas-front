  export interface KakaoPlaceResult {                                                                                     id: string
    name: string
    address: string
    roadAddress: string
    lat: number
    lng: number
  }

  interface KakaoPlaceItem {
    id: string
    place_name: string
    address_name: string
    road_address_name: string
    x: string
    y: string
  }

  interface KakaoGeocodeItem {
    x: string
    y: string
    road_address: { address_name: string } | null
    address: { address_name: string } | null
  }

  interface KakaoSDK {
    maps: {
      load: (callback: () => void) => void
      LatLng: new (lat: number, lng: number) => unknown
      Map: new (container: HTMLElement, options: unknown) => unknown
      Marker: new (options: unknown) => unknown
      Polyline: new (options: unknown) => unknown
      LatLngBounds: new () => unknown
      event: {
        addListener: (target: unknown, type: string, handler: () => void) => void
      }
      services: {
        Places: new () => {
          keywordSearch: (
            keyword: string,
            callback: (results: KakaoPlaceItem[], status: string) => void,
          ) => void
        }
        Geocoder: new () => {
          addressSearch: (
            address: string,
            callback: (results: KakaoGeocodeItem[], status: string) => void,
          ) => void
          coord2Address: (
            lng: number,
            lat: number,
            callback: (results: KakaoGeocodeItem[], status: string) => void,
          ) => void
        }
        Status: {
          OK: string
          ZERO_RESULT: string
          ERROR: string
        }
      }
    }
  }

  declare global {
    interface Window {
      kakao: KakaoSDK
    }
  }

  export function searchKakaoPlaces(keyword: string): Promise<KakaoPlaceResult[]> {
    return new Promise((resolve, reject) => {
      const q = keyword.trim()

      if (!q) {
        resolve([])
        return
      }

      if (!window.kakao?.maps?.services) {
        reject(new Error('카카오 장소 검색 서비스를 사용할 수 없습니다.'))
        return
      }

      const places = new window.kakao.maps.services.Places()

      places.keywordSearch(q, (results, status) => {
        const { OK, ZERO_RESULT } = window.kakao.maps.services.Status

        if (status === ZERO_RESULT) {
          resolve([])
          return
        }

        if (status !== OK) {
          reject(new Error(`장소 검색 실패: ${status}`))
          return
        }

        resolve(
          results.map((item) => ({
            id: item.id,
            name: item.place_name,
            address: item.address_name ?? '',
            roadAddress: item.road_address_name ?? '',
            lat: Number(item.y),
            lng: Number(item.x),
          })),
        )
      })
    })
  }

  export function geocodeAddress(
    address: string,
  ): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve, reject) => {
      const trimmed = address.trim()
      if (!trimmed) {
        resolve(null)
        return
      }

      if (!window.kakao?.maps?.services) {
        reject(new Error('카카오 Geocoder 서비스를 사용할 수 없습니다.'))
        return
      }

      const geocoder = new window.kakao.maps.services.Geocoder()

      geocoder.addressSearch(trimmed, (results, status) => {
        const { OK } = window.kakao.maps.services.Status

        if (status !== OK || results.length === 0) {
          resolve(null)
          return
        }

        const first = results[0]
        if (!first) {
          resolve(null)
          return
        }

        resolve({
          lat: Number(first.y),
          lng: Number(first.x),
        })
      })
    })
  }
