import { Capacitor, registerPlugin } from '@capacitor/core'

interface TmapNaviPlugin {
  openUrl(options: { url: string }): Promise<void>
  startNavigation(options: {
    destLat: number
    destLng: number
    destName: string
    startLat?: number
    startLng?: number
    startName?: string
    viaLat?: number
    viaLng?: number
    viaName?: string
  }): Promise<void>
}

const TmapNavi = registerPlugin<TmapNaviPlugin>('TmapNavi')

export async function openTmapUrl(url: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    window.location.href = url
    return
  }
  await TmapNavi.openUrl({ url })
}

export async function startTmapNavi(options: {
  destLat: number
  destLng: number
  destName: string
  startLat?: number
  startLng?: number
  startName?: string
  viaLat?: number
  viaLng?: number
  viaName?: string
}): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) throw new Error(`not native: ${Capacitor.getPlatform()}`)
  await TmapNavi.startNavigation(options)
  return true
}
