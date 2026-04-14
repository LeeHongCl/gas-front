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

/**
 * 도로명 주소를 카카오 Geocoder로 변환해 정규화된 좌표를 반환합니다.
 * 도로명 주소가 없으면 원래 좌표를 그대로 사용합니다.
 *
 * 배경: 장소 검색 결과의 좌표(x/y)는 건물 중심 좌표라서
 * 도로와 거리가 있는 경우 백엔드 경로 탐색이 실패할 수 있습니다.
 * 도로명 주소로 Geocoding하면 도로 인접 좌표가 반환됩니다.
 */
function resolveRoadCoord(
  roadAddress: string,
  fallbackLat: number,
  fallbackLng: number,
): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!roadAddress) {
      resolve({ lat: fallbackLat, lng: fallbackLng })
      return
    }

    if (!window.kakao?.maps?.services?.Geocoder) {
      resolve({ lat: fallbackLat, lng: fallbackLng })
      return
    }

    const geocoder = new window.kakao.maps.services.Geocoder()

    geocoder.addressSearch(roadAddress, (results: any[], status: string) => {
      const OK = window.kakao.maps.services.Status.OK

      if (status === OK && results.length > 0) {
        resolve({
          lat: Number(results[0].y),
          lng: Number(results[0].x),
        })
      } else {
        // Geocoding 실패 시 원래 좌표 유지
        resolve({ lat: fallbackLat, lng: fallbackLng })
      }
    })
  })
}

/**
 * 키워드로 카카오 장소를 검색하고,
 * 각 결과의 좌표를 도로명 주소 기준으로 보정합니다.
 */
export async function searchKakaoPlaces(keyword: string): Promise<KakaoPlaceResult[]> {
  const q = keyword.trim()
  if (!q) return []

  if (!window.kakao?.maps?.services) {
    throw new Error('카카오 장소 검색 서비스를 사용할 수 없습니다.')
  }

  // 1단계: 키워드 검색
  const rawResults = await new Promise<any[]>((resolve, reject) => {
    const places = new window.kakao.maps.services.Places()

    places.keywordSearch(q, (results: any[], status: string) => {
      const OK = window.kakao.maps.services.Status.OK
      const ZERO = window.kakao.maps.services.Status.ZERO_RESULT

      if (status === ZERO) {
        resolve([])
        return
      }

      if (status !== OK) {
        reject(new Error(`장소 검색 실패: ${status}`))
        return
      }

      resolve(results)
    })
  })

  if (rawResults.length === 0) return []

  // 2단계: 도로명 주소 기준 좌표 보정 (병렬 처리)
  const resolved = await Promise.all(
    rawResults.map(async (item) => {
      const roadAddress: string = item.road_address_name ?? ''
      const fallbackLat = Number(item.y)
      const fallbackLng = Number(item.x)

      const coord = await resolveRoadCoord(roadAddress, fallbackLat, fallbackLng)

      return {
        id: item.id as string,
        name: item.place_name as string,
        address: item.address_name ?? '',
        roadAddress,
        lat: coord.lat,
        lng: coord.lng,
      } satisfies KakaoPlaceResult
    }),
  )

  return resolved
}
