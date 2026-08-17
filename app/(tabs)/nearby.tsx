import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentLocation, getLocationErrorMessage } from '@/utils/location';
import {
  formatArrivalTime,
  getNearbyBusStops,
  getStopArrivals,
  type Arrival,
  type StopPoint,
} from '@/services/tfl';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/constants/theme';

const NEARBY_RADIUS_METERS = 120;

type NearbyStopItem = {
  stop: StopPoint;
  distance: number;
  arrivals: Arrival[];
};

export default function NearbyScreen() {
  const router = useRouter();
  const [nearbyStops, setNearbyStops] = useState<NearbyStopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const loadNearbyStops = useCallback(async () => {
    setLoading(true);
    setLocationError(null);

    try {
      const result = await getCurrentLocation();
      if (result.status !== 'granted') {
        setLocationError(getLocationErrorMessage(result.status));
        setNearbyStops([]);
        return;
      }

      const { latitude, longitude } = result.location.coords;
      const stops = await getNearbyBusStops(latitude, longitude, NEARBY_RADIUS_METERS);

      const stopsWithArrivals = await Promise.all(
        stops.map(async (stop) => ({
          stop,
          distance: stop.distance ?? 0,
          arrivals: await getStopArrivals(stop.id).catch(() => [] as Arrival[]),
        }))
      );

      setNearbyStops(stopsWithArrivals);
    } catch (err) {
      console.error(err);
      setLocationError('Unable to load nearby stops. Please try again.');
      setNearbyStops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch is async: the loading/error resets happen before any await, which the
    // compiler lint treats as a cascading render even though it runs once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNearbyStops();
  }, [loadNearbyStops]);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Brand.red} />
          <Text style={styles.loadingText}>Finding stops around you…</Text>
        </View>
      )}

      {!loading && locationError && (
        <View>
          <Text style={styles.errorText}>{locationError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNearbyStops}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !locationError && nearbyStops.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={36} color={Brand.red} />
          <Text style={styles.emptyTitle}>No stops close by</Text>
          <Text style={styles.emptyText}>There are no bus stops within {NEARBY_RADIUS_METERS} metres.</Text>
        </View>
      )}

      <FlatList
        data={nearbyStops}
        keyExtractor={(item) => item.stop.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          !loading && nearbyStops.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.eyebrow}>AROUND YOU</Text>
              <Text style={styles.heading}>{nearbyStops.length} stops nearby</Text>
              <Text style={styles.subheading}>Live arrivals within {NEARBY_RADIUS_METERS} metres.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.stopCard}>
            <TouchableOpacity onPress={() => router.push(`/stop/${item.stop.id}`)}>
              <View style={styles.stopHeader}>
                <View style={styles.stopMarker}>
                  <Text style={styles.stopMarkerText}>{item.stop.indicator || 'BUS'}</Text>
                </View>
                <View style={styles.stopHeaderText}>
                  <Text style={styles.stopName}>{item.stop.commonName}</Text>
                  <Text style={styles.distance}>{Math.round(item.distance)}m away</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Brand.textMuted} />
              </View>
            </TouchableOpacity>

            {item.arrivals.slice(0, 3).map((arr, index) => (
              <View key={arr.id} style={styles.arrivalRow}>
                <View style={styles.routeBadge}>
                  <Text style={styles.line}>{arr.lineName}</Text>
                </View>
                <Text style={styles.destination} numberOfLines={1} ellipsizeMode="tail">
                  {arr.destinationName}
                </Text>
                <Text style={[styles.time, index === 0 && styles.timeNext]}>
                  {formatArrivalTime(arr.timeToStation)}
                </Text>
              </View>
            ))}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.cream },
  listContent: { padding: 16, paddingBottom: 28 },
  listHeader: { marginBottom: 18, paddingTop: 6 },
  eyebrow: { color: Brand.red, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  heading: { color: Brand.navy, fontSize: 28, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 },
  subheading: { color: Brand.textMuted, marginTop: 4 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: Brand.textMuted, marginTop: 12 },
  stopCard: {
    backgroundColor: Brand.surface,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Brand.border,
    marginBottom: 12,
  },
  stopHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stopMarker: {
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Brand.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  stopMarkerText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  stopHeaderText: { flex: 1, marginLeft: 11 },
  stopName: { color: Brand.navy, fontSize: 16, fontWeight: '800' },
  distance: { color: Brand.textMuted, fontSize: 12, marginTop: 3 },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEAE4',
  },
  routeBadge: {
    minWidth: 38,
    backgroundColor: Brand.navy,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    alignItems: 'center',
  },
  line: { color: '#fff', fontWeight: '900', fontSize: 12 },
  destination: { flex: 1, color: Brand.text, marginHorizontal: 9 },
  time: { color: Brand.text, fontWeight: '700', minWidth: 48, textAlign: 'right' },
  timeNext: { color: Brand.success },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: Brand.navy, fontSize: 19, fontWeight: '800', marginTop: 12 },
  emptyText: { color: Brand.textMuted, textAlign: 'center', marginTop: 5 },
  errorText: { color: Brand.danger, marginTop: 16 },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Brand.red,
    borderRadius: 12,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});
