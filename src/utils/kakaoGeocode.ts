import type { KakaoPlaceResult } from '@/utils/kakaoPlaceSearch'

  export interface GeocodedResult {
    lat: number
    lng: number
    roadAddress: string
    jibunAddress: string
  }

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

  /** 좌표 → 역지오코딩 → 도로명 주소 → 좌표 재변환 */
  function coord2RoadSnap(
    lat: number,
    lng: number,
  ): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!window.kakao?.maps?.services?.Geocoder) {
        resolve(null)
        return
      }

      const geocoder = new window.kakao.maps.services.Geocoder()

      ;(geocoder as any).coord2Address(lng, lat, async (results: any[], status: string) => {
        if (status !== window.kakao.maps.services.Status.OK || !results[0]) {
          resolve(null)
          return
        }

        const roadAddr: string | undefined = results[0].road_address?.address_name
        if (!roadAddr) {
          resolve(null)
          return
        }

        const snapped = await geocodeAddress(roadAddr)
        resolve(snapped ? { lat: snapped.lat, lng: snapped.lng } : null)
      })
    })
  }

  /**
   * 좌표를 도로 위 좌표로 보정합니다. (roadAddress 없이 좌표만으로 동작)
   * - 1차: 원본 좌표 역지오코딩
   * - 2차: 주변 오프셋 시도 (교차로 중심점 탈출)
   */
  export async function snapCoordToRoad(
    lat: number,
    lng: number,
  ): Promise<{ lat: number; lng: number }> {
    const fromOrigin = await coord2RoadSnap(lat, lng)
    if (fromOrigin) return fromOrigin

    const offsets = [
      { dlat: 0.0003, dlng: 0 },
      { dlat: -0.0003, dlng: 0 },
      { dlat: 0, dlng: 0.0003 },
      { dlat: 0, dlng: -0.0003 },
    ]

    for (const { dlat, dlng } of offsets) {
      const result = await coord2RoadSnap(lat + dlat, lng + dlng)
      if (result) return result
    }

    return { lat, lng }
  }

  /**
   * Places 검색 결과 좌표를 도로 위 좌표로 보정합니다.
   * roadAddress가 있으면 우선 사용, 없으면 snapCoordToRoad로 폴백합니다.
   */
  export async function snapPlaceToRoad(
    place: KakaoPlaceResult,
  ): Promise<{ lat: number; lng: number }> {
    if (place.roadAddress) {
      const snapped = await geocodeAddress(place.roadAddress)
      if (snapped) return { lat: snapped.lat, lng: snapped.lng }
    }

    return snapCoordToRoad(place.lat, place.lng)
  }