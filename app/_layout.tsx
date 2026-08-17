import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { FavoritesProvider } from '@/context/favoritesContext';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { View } from 'react-native';
import AdBanner from '@/components/AdBanner';
import { Brand } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Brand.red,
    background: Brand.cream,
    card: Brand.surface,
    text: Brand.text,
    border: Brand.border,
    notification: Brand.red,
  },
};

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Brand.red,
    secondary: Brand.blue,
    background: Brand.cream,
    surface: Brand.surface,
    surfaceVariant: Brand.surfaceMuted,
    onSurface: Brand.text,
    outline: Brand.border,
    error: Brand.danger,
  },
  roundness: 4,
};

export default function RootLayout() {
  return (
    <PaperProvider theme={paperTheme}>
      <FavoritesProvider>
        <ThemeProvider value={navigationTheme}>
          <View style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: Brand.cream },
                headerStyle: { backgroundColor: Brand.surface },
                headerTintColor: Brand.navy,
                headerTitleStyle: { fontWeight: '700' },
                headerShadowVisible: false,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="bus/[line]" options={{ title: 'Bus route' }} />
              <Stack.Screen name="stop/[id]" options={{ title: 'Live arrivals' }} />
              <Stack.Screen name="results" options={{ title: 'Search results' }} />
            </Stack>
            <AdBanner />
            <StatusBar style="dark" />
          </View>
        </ThemeProvider>
      </FavoritesProvider>
    </PaperProvider>
  );
}
