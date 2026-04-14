/**
 * 카카오 모빌리티 길찾기 REST API 래퍼
 * https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-category
 *
 * vite.config.ts의 proxy 설정으로 CORS를 우회합니다.
 * dev: /kakao-navi → https://apis-navi.kakaomobility.com
 * prod: Vercel rewrites 또는 백엔드 프록시가 필요합니다.
 */

export interface LatLng {
  lat: number
  lng: number
}

export interface KakaoRouteResult {
  /** 실제 도로 위 좌표 배열 (폴리라인용) */
  path: LatLng[]
  /** 총 거리 (미터) */
  totalDistanceM: number
  /** 총 소요 시간 (초) */
  totalDurationSec: number
}

const REST_KEY = import.meta.env.VITE_KAKAO_MOBILITY_REST_KEY as string

/**
 * 카카오 모빌리티 자동차 길찾기 API를 호출해 실제 도로 경로를 반환합니다.
 *
 * @param origin  출발지 좌표
 * @param destination 도착지 좌표
 * @param waypoint 경유지 좌표 (주유소) - 선택
 */
export async function fetchKakaoRoute(
  origin: LatLng,
  destination: LatLng,
  waypoint?: LatLng,
): Promise<KakaoRouteResult> {
  const params = new URLSearchParams({
    origin: `${origin.lng},${origin.lat}`,
    destination: `${destination.lng},${destination.lat}`,
    priority: 'RECOMMEND',
  })

  if (waypoint) {
    params.set('waypoints', `${waypoint.lng},${waypoint.lat}`)
  }

  // vite proxy: /kakao-navi → https://apis-navi.kakaomobility.com
  const url = `/kakao-navi/v1/directions?${params.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `KakaoAK ${REST_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`카카오 길찾기 API 오류: ${response.status} ${body}`)
  }

  const data = await response.json()

  // 응답 구조: data.routes[0].sections[].roads[].vertexes
  const route = data.routes?.[0]

  if (!route || route.result_code !== 0) {
    const msg = route?.result_msg ?? '경로를 찾을 수 없습니다.'
    throw new Error(`카카오 길찾기: ${msg}`)
  }

  const path: LatLng[] = []

  for (const section of route.sections ?? []) {
    for (const road of section.roads ?? []) {
      // vertexes = [lng1, lat1, lng2, lat2, ...] 플랫 배열
      const v: number[] = road.vertexes ?? []
      for (let i = 0; i < v.length - 1; i += 2) {
        const lng = v[i]
        const lat = v[i + 1]
        if (lng !== undefined && lat !== undefined) {
          path.push({ lng, lat })
        }
      }
    }
  }

  const summary = route.summary ?? {}
  const totalDistanceM: number = summary.distance ?? 0
  const totalDurationSec: number = summary.duration ?? 0

  return { path, totalDistanceM, totalDurationSec }
}
