import { Capacitor, registerPlugin } from '@capacitor/core'

interface TmapNaviPlugin {
  startNavigation(options: {
    destLat: number
    destLng: number
    destName: string
    viaLat?: number
    viaLng?: number
    viaName?: string
  }): Promise<void>
}

const TmapNavi = registerPlugin<TmapNaviPlugin>('TmapNavi')

export async function startTmapNavi(options: {
  destLat: number
  destLng: number
  destName: string
  viaLat?: number
  viaLng?: number
  viaName?: string
}): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) throw new Error(`not native: ${Capacitor.getPlatform()}`)
  await TmapNavi.startNavigation(options)
  return true
}
