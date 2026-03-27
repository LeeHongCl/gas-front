import { Geolocation } from '@capacitor/geolocation'

export interface AppLocation {
  lat: number
  lng: number
  accuracy: number
}

export async function getAppCurrentLocation(): Promise<AppLocation> {
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