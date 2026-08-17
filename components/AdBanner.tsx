import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const isNativeAdBuild = Platform.OS !== 'web' && Constants.appOwnership !== 'expo';
type GoogleMobileAdsModule = typeof import('react-native-google-mobile-ads');

export default function AdBanner() {
  const [adsModule, setAdsModule] = useState<GoogleMobileAdsModule | null>(null);

  useEffect(() => {
    if (!isNativeAdBuild) return;

    let mounted = true;
    import('react-native-google-mobile-ads')
      .then(async (module) => {
        await module.default().initialize();
        if (mounted) setAdsModule(module);
      })
      .catch((error: unknown) => {
        console.warn('AdMob initialization failed', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // AdMob contains native code and is unavailable in Expo Go and on web.
  if (!isNativeAdBuild || !adsModule) return null;

  const { BannerAd, BannerAdSize, TestIds } = adsModule;

  const productionUnitId =
    Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID
      : process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID;
  const unitId = __DEV__ || !productionUnitId ? TestIds.BANNER : productionUnitId;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <BannerAd
          unitId={unitId}
          size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdFailedToLoad={(error) => console.warn('AdMob banner failed to load', error)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    backgroundColor: '#fff',
  },
});
