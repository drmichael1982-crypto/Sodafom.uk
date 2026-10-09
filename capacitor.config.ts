import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.sodafom.app',
  appName: 'Sodafom',
  webDir: 'dist/client',
  server: {
    androidScheme: 'https',
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
