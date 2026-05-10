import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leehongcl.gasstation',
  appName: '주유조아',
  webDir: 'dist',
  server: {
    // Vercel URL을 webview 서버로 사용 → API rewrite, 카카오 설정 그대로 동작
    url: 'https://gas-front-liart.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
