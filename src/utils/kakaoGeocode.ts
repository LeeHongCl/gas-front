/**
 * 카카오 Geocoder를 사용해 주소(도로명/지번)를 좌표로 변환합니다.
 * kakaoPlaceSearch.ts의 resolveRoadCoord와 동일한 방식이나
 * 외부에서 직접 호출할 수 있도록 독립 유틸로 분리했습니다.
 */

declare global {
  interface Window {
    kakao: any
  }
}

export interface GeocodedResult {
  lat: number
  lng: number
  roadAddress: string
  jibunAddress: string
}

/**
 * 주소 문자열을 좌표로 변환합니다.
 * 도로명 주소, 지번 주소 모두 지원합니다.
 *
 * @returns 변환 성공 시 GeocodedResult, 결과 없을 시 null
 */
export function geocodeAddress(address: string): Promise<GeocodedResult | null> {
  return new Promise((resolve, reject) => {
    const trimmed = address.trim()
    if (!trimmed) {
      resolve(null)
      return
    }

    if (!window.kakao?.maps?.services?.Geocoder) {
      reject(new Error('카카오 Geocoder 서비스를 사용할 수 없습니다. 지도가 로드되었는지 확인해주세요.'))
      return
    }

    const geocoder = new window.kakao.maps.services.Geocoder()

    geocoder.addressSearch(trimmed, (results: any[], status: string) => {
      const OK = window.kakao.maps.services.Status.OK

      if (status !== OK || results.length === 0) {
        resolve(null)
        return
      }

      const first = results[0]
      resolve({
        lat: Number(first.y),
        lng: Number(first.x),
        roadAddress: first.road_address?.address_name ?? '',
        jibunAddress: first.address?.address_name ?? '',
      })
    })
  })
}
