export interface KakaoPlaceResult {
  id: string
  name: string
  address: string
  roadAddress: string
  lat: number
  lng: number
}

declare global {
  interface Window {
    kakao: any
  }
}

export function searchKakaoPlaces(keyword: string): Promise<KakaoPlaceResult[]> {
  return new Promise((resolve, reject) => {
    const q = keyword.trim()

    if (!q) {
      resolve([])
      return
    }

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      reject(new Error('카카오 장소 검색 서비스를 사용할 수 없습니다.'))
      return
    }

    const places = new window.kakao.maps.services.Places()

    places.keywordSearch(q, (results: any[], status: string) => {
      const okStatus = window.kakao.maps.services.Status.OK
      const zeroStatus = window.kakao.maps.services.Status.ZERO_RESULT

      if (status === zeroStatus) {
        resolve([])
        return
      }

      if (status !== okStatus) {
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