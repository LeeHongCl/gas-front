 declare global {
    interface Window {
      Kakao: {
        isInitialized(): boolean
        Navi: {
          start(options: {
            name: string
            x: number       // 경도 (longitude)
            y: number       // 위도 (latitude)
            coordType?: 'wgs84' | 'katec'
            viaPoints?: Array<{ name: string; x: number; y: number }>
          }): void
        }
      }
    }
  }

  export {}