import 'expo-router';

declare module 'expo-router' {
  interface ExpoRouter {
    routes: {
      '(tabs)': undefined;
      '(tabs)/search': undefined;
      '(tabs)/nearby': undefined;
      // Add other routes here
    };
  }
}