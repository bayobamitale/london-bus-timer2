import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getCurrentLocation, getLocationErrorMessage } from '@/utils/location';
import { formatArrivalTime, getStopArrivals, type Arrival } from '@/services/tfl';
import stoppoints from '../data/stoppoints.json';
import CurrentLocationSummary from '@/components/CurrentLocationSummary';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFavorites } from '@/context/favoritesContext';
import HeaderMenu from '@/components/HeaderMenu';
import { Brand } from '@/constants/theme';

type NearestStop = {
  name: string;
  distance: number;
  stopId: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const { favorites } = useFavorites();
  const [nearestStop, setNearestStop] = useState<NearestStop | null>(null);
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const [loadingArrivals, setLoadingArrivals] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Haversine formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchArrivals = async (stopId: string) => {
    setLoadingArrivals(true);
    try {
      setArrivals(await getStopArrivals(stopId));
    } catch (err) {
      console.error(err);
      setArrivals([]);
    } finally {
      setLoadingArrivals(false);
    }
  };

  const handleUseLocation = async () => {
    setShowLocation(true);
    setLocationError(null);

    const result = await getCurrentLocation();
    if (result.status !== 'granted') {
      setLocationError(getLocationErrorMessage(result.status));
      setNearestStop(null);
      setArrivals([]);
      return;
    }

    const loc = result.location;

    const nearbyStops = stoppoints
      .map(stop => ({
        stop,
        distance: getDistance(
          loc.coords.latitude,
          loc.coords.longitude,
          stop.lat,
          stop.lon
        ),
      }))
      .filter(s => s.distance <= 200)
      .sort((a, b) => a.distance - b.distance);

    if (nearbyStops.length > 0) {
      const nearest = nearbyStops[0];
      setNearestStop({
        name: nearest.stop.commonName,
        distance: nearest.distance,
        stopId: nearest.stop.id,
      });
      fetchArrivals(nearest.stop.id);
    } else {
      setNearestStop(null);
      setArrivals([]);
    }
  };
  
  return (
    <>
      {/* Header */}
      <Stack.Screen
        options={{
          headerTitle: 'London Bus Timer',
          headerRight: () => <HeaderMenu />,
        }}
      />
    <FlatList
      data={arrivals}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.arrivalRow}
          onPress={() => router.push(`/bus/${item.lineName}`)}
        >
          <View style={styles.arrivalTextContainer}>
            <Text style={styles.route}>{item.lineName}</Text>
            <Text style={styles.destination}>
              → {item.destinationName} {item.stopLetter ? `(${item.stopLetter})` : ''}
            </Text>
            <Text style={styles.direction}>{item.direction}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{formatArrivalTime(item.timeToStation)}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/partial-react-logo.png')}
              style={styles.reactLogo}
              contentFit="contain"
            />
            <View style={styles.eyebrow}>
              <View style={styles.liveDot} />
              <Text style={styles.eyebrowText}>LIVE LONDON BUS TIMES</Text>
            </View>
            <Text style={styles.title}>Where are you going?</Text>
            <Text style={styles.subtitle}>Find a stop and see what’s arriving next.</Text>
          </View>

          {/* Search */}
          <TouchableOpacity
            style={styles.searchBox}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Ionicons name="search" size={21} color={Brand.textMuted} />
            <Text style={styles.searchText}>Enter bus number, stop or postcode</Text>
            <Ionicons name="arrow-forward" size={18} color={Brand.red} />
          </TouchableOpacity>

          {/* Location */}
          <TouchableOpacity style={styles.locationBtn} onPress={handleUseLocation}>
            <Ionicons name="navigate" size={19} color="#fff" />
            <Text style={styles.locationText}>Find buses near me</Text>
          </TouchableOpacity>

          {showLocation && !locationError && <CurrentLocationSummary />}

          {locationError && (
            <View style={styles.locationErrorRow}>
              <Ionicons name="alert-circle-outline" size={18} color="#B91C1C" />
              <Text style={styles.locationErrorText}>{locationError}</Text>
            </View>
          )}

          {/* Nearest Stop */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Nearest stop</Text>
                <Text style={styles.sectionCaption}>Within a short walk</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/nearby')}>
                <Text style={styles.link}>View all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {nearestStop ? (
                <TouchableOpacity onPress={() => router.push(`/stop/${nearestStop.stopId}`)}>
                  <Text style={styles.stopName}>{nearestStop.name}</Text>
                  <Text style={styles.distance}>{Math.round(nearestStop.distance)}m away</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.emptyRow}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="bus-outline" size={20} color={Brand.red} />
                  </View>
                  <Text style={styles.emptyText}>Use your location to find nearby stops</Text>
                </View>
              )}
            </View>
          </View>

          {/* Favorites */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Your favourites</Text>
  {favorites.length === 0 ? (
    <Text style={styles.emptyText}>Save a bus or stop for quicker access.</Text>
  ) : (
    <FlatList
      horizontal
      data={favorites}
      keyExtractor={item => item.id}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.favoriteCard}
          onPress={() => {
            if (item.type === 'stop' && item.stopId) router.push(`/stop/${item.stopId}`);
            if (item.type === 'bus' && item.line) router.push(`/bus/${item.line}`);
          }}
        >
          <Ionicons name={item.icon as any} size={18} color={Brand.red} />
          <Text style={styles.favoriteText}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  )}
</View>


          {/* Arrivals Placeholder */}
          <Text style={styles.arrivalsTitle}>Live arrivals</Text>
          {loadingArrivals && (
            <View>
              {[1, 2, 3].map(i => (
                <View key={i} style={styles.arrivalPlaceholderRow}>
                  <View style={styles.arrivalTextPlaceholder} />
                  <View style={styles.arrivalTimePlaceholder} />
                </View>
              ))}
            </View>
          )}
          {/* Show actual arrivals */}
{!loadingArrivals && arrivals.length > 0 && (
  <FlatList
    data={arrivals}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={styles.arrivalRow}
        onPress={() => router.push(`/bus/${item.lineName}`)}
      >
        <View style={styles.arrivalTextContainer}>
          <Text style={styles.route}>{item.lineName}</Text>
          <Text style={styles.destination}>
            → {item.destinationName} {item.stopLetter ? `(${item.stopLetter})` : ''}
          </Text>
          <Text style={styles.direction}>{item.direction}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatArrivalTime(item.timeToStation)}</Text>
        </View>
      </TouchableOpacity>
    )}
  />
)}
{/* Show message if no arrivals */}
{!loadingArrivals && arrivals.length === 0 && (
  <Text style={styles.emptyText}>Choose a nearby stop to see live arrivals.</Text>
)}
        </>
      }
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
   </> 
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 28, backgroundColor: Brand.cream },
  header: { alignItems: 'center', paddingTop: 4, marginBottom: 22 },
  reactLogo: { width: 112, height: 82 },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Brand.red, marginRight: 7 },
  eyebrowText: { color: Brand.redDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  title: { color: Brand.navy, fontSize: 28, fontWeight: '800', marginTop: 12, letterSpacing: -0.5 },
  subtitle: { color: Brand.textMuted, fontSize: 14, marginTop: 5, textAlign: 'center' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    paddingHorizontal: 16,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    marginBottom: 10,
  },
  searchText: { marginLeft: 10, color: Brand.textMuted, flex: 1, fontSize: 14 },
  locationBtn: {
    flexDirection: 'row',
    backgroundColor: Brand.red,
    minHeight: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: { color: '#fff', marginLeft: 8, fontWeight: '800', fontSize: 15 },
  locationErrorRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  locationErrorText: { color: Brand.danger, marginLeft: 6, flex: 1 },
  section: { marginTop: 22 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: Brand.navy, fontSize: 19, fontWeight: '800', letterSpacing: -0.2 },
  sectionCaption: { color: Brand.textMuted, fontSize: 12, marginTop: 2 },
  arrivalsTitle: { color: Brand.navy, fontSize: 19, fontWeight: '800', marginTop: 22, marginBottom: 10 },
  link: { color: Brand.red, fontWeight: '700' },
  card: {
    backgroundColor: Brand.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    marginBottom: 12,
  },
  stopName: { color: Brand.navy, fontSize: 16, fontWeight: '700' },
  distance: { color: Brand.textMuted, marginTop: 4 },
  emptyRow: { flexDirection: 'row', alignItems: 'center' },
  emptyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FDECEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  emptyText: { color: Brand.textMuted, marginVertical: 8, lineHeight: 20 },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Brand.border,
    marginRight: 10,
  },
  favoriteText: { color: Brand.text, marginLeft: 7, fontWeight: '700' },
  arrivalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: Brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    marginBottom: 9,
    alignItems: 'center',
  },
  arrivalTextContainer: { flex: 1, paddingRight: 10 },
  timeContainer: { minWidth: 62, alignItems: 'flex-end' },
  route: { color: Brand.navy, fontSize: 17, fontWeight: '800', marginBottom: 2 },
  destination: { color: Brand.text, flexWrap: 'wrap' },
  direction: { fontSize: 12, color: Brand.textMuted, marginTop: 3 },
  time: {
    color: Brand.success,
    fontWeight: '800',
    backgroundColor: '#E8F5EF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },
  arrivalPlaceholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Brand.surfaceMuted,
    borderRadius: 16,
    marginBottom: 8,
  },
  arrivalTextPlaceholder: { flex: 1, height: 14, backgroundColor: Brand.border, borderRadius: 4 },
  arrivalTimePlaceholder: { width: 50, height: 14, backgroundColor: '#C9C2B8', borderRadius: 4 },
});
