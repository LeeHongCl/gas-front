import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

export interface AppLocation {
  lat: number
  lng: number
  accuracy: number
}

/** 웹 브라우저 기본 Geolocation API 사용 */
function getWebLocation(): Promise<AppLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new Error('현재 위치를 확인할 수 없습니다.'))
            break
          case error.TIMEOUT:
            reject(new Error('위치 요청 시간이 초과되었습니다.'))
            break
          default:
            reject(new Error('위치를 가져오지 못했습니다.'))
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  })
}

/** Capacitor 네이티브 Geolocation 사용 (Android/iOS) */
async function getNativeLocation(): Promise<AppLocation> {
  const permissionStatus = await Geolocation.checkPermissions()

  const hasPermission =
    permissionStatus.location === 'granted' ||
    permissionStatus.coarseLocation === 'granted'

  if (!hasPermission) {
    const requested = await Geolocation.requestPermissions()
    const granted =
      requested.location === 'granted' ||
      requested.coarseLocation === 'granted'

    if (!granted) {
      throw new Error('위치 권한이 거부되었습니다.')
    }
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  })

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
  }
}

/**
 * 현재 위치를 가져옵니다.
 * - 네이티브 앱 (Android/iOS): Capacitor Geolocation 사용
 * - 웹 브라우저: navigator.geolocation 사용
 */
export async function getAppCurrentLocation(): Promise<AppLocation> {
  if (Capacitor.isNativePlatform()) {
    return getNativeLocation()
  }
  return getWebLocation()
}
