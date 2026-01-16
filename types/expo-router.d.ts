import 'expo-router';

declare module 'expo-router' {
  interface ExpoRouter {
    routes: {
      '(tabs)': undefined;
      '(tabs)/search': undefined;
      '(tabs)/nearby': undefined;
      '/bus/[line]': { line: string };
      '/stop/[id]': undefined;
      '/results': { q: string };
      '/(tabs)/details': undefined;
      // Add other routes here
    };
  }
}