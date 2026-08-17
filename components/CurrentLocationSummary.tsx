import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { DEFAULT_LOCATION, getCurrentLocation } from '@/utils/location';
import { Brand } from '@/constants/theme';

export default function CurrentLocationSummary() {
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await getCurrentLocation();
        if (result.status === 'denied') {
          setPermissionDenied(true);
          return;
        }

        if (result.isDefault) {
          setLocationName(`${DEFAULT_LOCATION.name}, ${DEFAULT_LOCATION.area}`);
          return;
        }

        const address = await Location.reverseGeocodeAsync({
          latitude: result.location.coords.latitude,
          longitude: result.location.coords.longitude,
        });

        if (address.length > 0) {
          const place =
            address[0].district ||
            address[0].subregion ||
            address[0].city ||
            address[0].region ||
            DEFAULT_LOCATION.name;
          setLocationName(place);
        } else {
          setLocationName(DEFAULT_LOCATION.name);
        }
      } catch {
        setLocationName(`${DEFAULT_LOCATION.name}, ${DEFAULT_LOCATION.area}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={Brand.red} />
        <Text style={styles.text}>Getting your location...</Text>
      </View>
    );
  }

  if (permissionDenied) {
    return (
      <View style={styles.container}>
        <Ionicons name="location-outline" size={18} color={Brand.textMuted} />
        <Text style={styles.text}>Location Disabled</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="location" size={18} color={Brand.red} />
      <Text style={styles.text}>Near {locationName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginVertical: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FDECEB',
  },
  text: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: Brand.redDark,
  },
});
