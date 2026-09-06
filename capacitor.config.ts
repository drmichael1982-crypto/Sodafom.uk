import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.sodafom.app',
  appName: 'uk.sodafom.app',
  webDir: 'dist/client',
  server: {
    androidScheme: 'http',
    hostname: 'localhost'
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
