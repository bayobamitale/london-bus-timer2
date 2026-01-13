import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import stoppoints from '../data/stoppoints.json';
import CurrentLocationSummary from '@/components/CurrentLocationSummary';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

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
  timeToStation: number; // seconds
};

type NearestStop = {
  name: string;
  distance: number;
  stopId: string;
};

export default function HomeScreen() {
  const router = useRouter();

  const [nearestStop, setNearestStop] = useState<NearestStop | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [showLocation, setShowLocation] = useState(false);
  const [loadingArrivals, setLoadingArrivals] = useState(false);

  // Haversine formula to calculate distance in meters
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // meters
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

  // Format seconds to minutes
  const formatArrivalTime = (seconds: number) => {
    if (seconds <= 0) return 'Due';
    const minutes = Math.floor(seconds / 60);
    return minutes <= 0 ? 'Due' : `${minutes} min`;
  };

  // Fetch arrivals for a stop
  const fetchArrivals = async (stopId: string) => {
    setLoadingArrivals(true);
    try {
      const res = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setArrivals([]);
        return;
      }

      const buses: Arrival[] = data
        .filter((a: any) => a.modeName === 'bus')
        .map((a: any) => ({
          id: a.id,
          lineName: a.lineName,
          destinationName: a.destinationName,
          stopLetter: a.stationLetter || a.stopLetter,
          direction: a.direction,
          timeToStation: a.timeToStation,
        }))
        .sort((a, b) => a.timeToStation - b.timeToStation);

      setArrivals(buses);
    } catch (err) {
      console.error(err);
      setArrivals([]);
    } finally {
      setLoadingArrivals(false);
    }
  };

  // Detect current location & nearest stop within 200m
  const handleUseLocation = async () => {
    setShowLocation(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location denied!');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    const nearbyStops = stoppoints
      .map(stop => ({
        stop,
        distance: getDistance(loc.coords.latitude, loc.coords.longitude, stop.lat, stop.lon),
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

  const favorites = [
    { id: '1', title: 'Home Stop', icon: 'star' },
    { id: '2', title: 'Route 25', icon: 'bus' },
  ];

  return (
    <FlatList
      data={arrivals}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.arrivalRow}
          onPress={() => router.push(`/bus/${item.lineName}`)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.route}>{item.lineName}</Text>
            <Text style={styles.destination}>
              → {item.destinationName} {item.stopLetter ? `(${item.stopLetter})` : ''}
            </Text>
            <Text style={styles.direction}>{item.direction}</Text>
          </View>
          <Text style={styles.time}>{formatArrivalTime(item.timeToStation)}</Text>
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
            <Text style={styles.title}>London Bus Timer</Text>
          </View>

          {/* Search */}
          <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/(tabs)/search')}>
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchText}>Enter bus number, stop or postcode</Text>
          </TouchableOpacity>

          {/* Location Button */}
          <TouchableOpacity style={styles.locationBtn} onPress={handleUseLocation}>
            <Ionicons name="location-outline" size={20} color="#fff" />
            <Text style={styles.locationText}>Use Current Location</Text>
          </TouchableOpacity>

          {showLocation && <CurrentLocationSummary />}

          {/* Nearest Stop */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearest Stop (within 200m)</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/nearby')}>
                <Text style={styles.link}>View More</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {nearestStop ? (
                <>
                  <TouchableOpacity onPress={() => router.push(`/stop/${nearestStop.stopId}`)}>
                    <Text style={styles.stopName}>{nearestStop.name}</Text>
                    <Text style={styles.distance}>{Math.round(nearestStop.distance)}m away</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={{ color: '#666' }}>No stops within 200 meters</Text>
              )}
            </View>
          </View>

          {/* Favorites */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <FlatList
              horizontal
              data={favorites}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.favoriteCard}>
                  <Ionicons name={item.icon as any} size={18} color="#333" />
                  <Text style={styles.favoriteText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <Text style={{ marginVertical: 12, fontWeight: '600' }}>Arrivals:</Text>
          {loadingArrivals && <ActivityIndicator size="small" color="#007AFF" />}
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
/>
        </>
      }
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 12 },
  reactLogo: { width: 100, height: 80 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12 },
  searchText: { marginLeft: 10, color: '#666' },
  locationBtn: { flexDirection: 'row', backgroundColor: '#007AFF', padding: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  locationText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  section: { marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  link: { color: '#007AFF', fontWeight: '500' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12 },
  stopName: { fontSize: 16, fontWeight: '600' },
  distance: { color: '#666', marginTop: 4 },
  favoriteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginRight: 10 },
  favoriteText: { marginLeft: 6, fontWeight: '500' },
  arrivalRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 12,
  paddingHorizontal: 10,
  backgroundColor: '#fff',
  borderRadius: 10,
  marginBottom: 8,
  alignItems: 'flex-start', // align top
},
arrivalTextContainer: {
  flex: 1, // allow text to wrap
  paddingRight: 10, // spacing for time
},
timeContainer: {
  width: 50, // fixed width for time so it never moves
  alignItems: 'flex-end', // keep time right-aligned
},
route: { fontWeight: '600', marginBottom: 2 },
destination: { color: '#444', flexWrap: 'wrap' }, // allow wrapping
direction: { fontSize: 12, color: '#666', marginTop: 2 },
time: { color: '#007AFF', fontWeight: '600' },


});
