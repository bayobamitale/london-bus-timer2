import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import stoppoints from '../data/stoppoints.json';

type Stop = {
  id: string;
  naptanId: string;
  commonName: string;
  lat: number;
  lon: number;
  stopLetter?: string;
  indicator?: string;
  modes: string[];
};

type Arrival = {
  id: string;
  lineName: string;
  destinationName: string;
  stopLetter?: string;
  direction: string;
  timeToStation: number;
};

// Haversine distance
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

export default function NearbyScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearbyStops, setNearbyStops] = useState<
    { stop: Stop; distance: number; arrivals: Arrival[] }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Format seconds to minutes
  const formatArrivalTime = (seconds: number) => {
    if (seconds <= 0) return 'Due';
    const minutes = Math.floor(seconds / 60);
    return minutes <= 0 ? 'Due' : `${minutes} min`;
  };

  // Fetch arrivals for a stop
  const fetchArrivals = async (stopId: string) => {
    try {
      const res = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`);
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      const buses: Arrival[] = data
        .filter((a: any) => a.modeName === 'bus')
        .map((a: any) => ({
          id: a.id || `${a.lineId}-${a.destinationName}-${a.timeToStation}`,
          lineName: a.lineName,
          destinationName: a.destinationName,
          stopLetter: a.stationLetter || a.stopLetter,
          direction: a.direction,
          timeToStation: a.timeToStation,
        }))
        .sort((a, b) => a.timeToStation - b.timeToStation);

      return buses;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Get current location & nearby stops
  const getNearbyStops = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location denied!');
      setLoading(false);
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    // Find stops within 200m
    const stopsWithDistance = stoppoints
      .map(stop => ({
        stop,
        distance: getDistance(loc.coords.latitude, loc.coords.longitude, stop.lat, stop.lon),
      }))
      .filter(s => s.distance <= 200)
      .sort((a, b) => a.distance - b.distance);

    // Fetch arrivals for each stop
    const stopsWithArrivals = await Promise.all(
      stopsWithDistance.map(async s => ({
        stop: s.stop,
        distance: s.distance,
        arrivals: await fetchArrivals(s.stop.id),
      }))
    );

    setNearbyStops(stopsWithArrivals);
    setLoading(false);
  };

  useEffect(() => {
    getNearbyStops();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {loading && <ActivityIndicator size="large" color="#007AFF" />}

      {!loading && nearbyStops.length === 0 && (
        <Text style={{ color: '#666', marginTop: 16 }}>No stops within 200 meters</Text>
      )}

      <FlatList
        data={nearbyStops}
        keyExtractor={item => item.stop.id}
        renderItem={({ item }) => (
          <View style={styles.stopCard}>
            <TouchableOpacity
              onPress={() => router.push(`/stop/${item.stop.id}`)}
            >
              <Text style={styles.stopName}>{item.stop.commonName}</Text>
              <Text style={styles.distance}>{Math.round(item.distance)}m away</Text>
            </TouchableOpacity>

            {item.arrivals.slice(0, 3).map(arr => (
              <View key={arr.id} style={styles.arrivalRow}>
                <Text style={styles.line}>{arr.lineName}</Text>
                <Text style={styles.destination} numberOfLines={1} ellipsizeMode="tail">
                  → {arr.destinationName}
                </Text>
                <Text style={styles.time}>{formatArrivalTime(arr.timeToStation)}</Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stopCard: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 16 },
  stopName: { fontSize: 16, fontWeight: '600' },
  distance: { color: '#666', marginBottom: 8 },
  arrivalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  line: { fontWeight: '600', width: 40 },
  destination: { flex: 1, color: '#444', marginHorizontal: 8 },
  time: { color: '#007AFF', fontWeight: '600', width: 50, textAlign: 'right' },
});
