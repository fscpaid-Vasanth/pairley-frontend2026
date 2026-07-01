import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pairley.marketplace',
  appName: 'Pairley',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#4E2BC4',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      clientId: '75280626707-7p2l9hdgbo4nokqfjrbsh17lkq6u0087.apps.googleusercontent.com',
      serverClientId: '75280626707-7p2l9hdgbo4nokqfjrbsh17lkq6u0087.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
