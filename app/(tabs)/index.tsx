import CurrentLocationSummary from "@/components/CurrentLocationSummary";
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import stoppoints from '../data/stoppoints.json';



export default function HomeScreen() {
  
  const router = useRouter();
  
   const [nearestStop, setNearestStop] = useState<{ name: string; distance: number } | null>({
    name: stoppoints[1].commonName,
    distance: 100,
  });
  const [arrivals, setArrivals] = useState([
    { id: '1', route: '24', destination: 'Piccadilly Circus', time: '5 min' },
    { id: '2', route: '24', destination: 'Oxford Circus', time: '8 min' },
  ]);
  const [showLocation, setShowLocation] = useState(false);

  const handleUseLocation = () => setShowLocation(true);

  const favorites = [
    { id: '1', title: 'Home Stop', icon: 'star' },
    { id: '2', title: 'Route 25', icon: 'bus' },
  ];
  return (
    
    <FlatList
      data={arrivals} // main vertical list
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.arrivalRow}>
          <Text style={styles.route}>{item.route}</Text>
          <Text style={styles.destination}>→ {item.destination}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      )}
      ListHeaderComponent={
        <>
          {/* Parallax Header Image */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/partial-react-logo.png')}
              style={styles.reactLogo}
              contentFit="contain"
            />
            <Text style={styles.title}>London Bus Timer</Text>
          </View>
          {/* Search */}
          <TouchableOpacity
            style={styles.searchBox}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Ionicons name="search" size={20} color="#666" />
            <Text style={styles.searchText}>Enter stop, route or postcode</Text>
          </TouchableOpacity>

          {/* Location Button */}
          <TouchableOpacity style={styles.locationBtn} onPress={handleUseLocation}>
            <Ionicons name="location-outline" size={20} color="#fff" />
            <Text style={styles.locationText}>Use Current Location</Text>
          </TouchableOpacity>

          {/* Current Location Summary */}
          {showLocation && <CurrentLocationSummary />}
           {/* Nearest Stop */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearest Stop</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/nearby')}>
                <Text style={styles.link}>View More</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              {nearestStop ? (
                <>
                  <Text style={styles.stopName}>{nearestStop.name}</Text>
                  <Text style={styles.distance}>{nearestStop.distance}m away</Text>
                </>
              ) : (
                <Text style={{ color: '#666' }}>Click “Use Current Location” to find nearest stop</Text>
              )}
            </View>
          </View>
          {/* Favorites */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <FlatList
              horizontal
              data={favorites}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.favoriteCard}>
                  <Ionicons name={item.icon as any} size={18} color="#333" />
                  <Text style={styles.favoriteText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
           {/* Title for arrivals */}
          <Text style={{ marginVertical: 12, fontWeight: '600' }}>Arrivals:</Text>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchText: { marginLeft: 10, color: '#666' },
  locationBtn: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  section: { marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  link: { color: '#007AFF', fontWeight: '500' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12 },
  stopName: { fontSize: 16, fontWeight: '600' },
  distance: { color: '#666', marginTop: 4 },
  favoritesRow: { flexDirection: 'row' },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginRight: 10,
  },
  favoriteText: { marginLeft: 6, fontWeight: '500' },
  arrivalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
  },
  route: { fontWeight: '600' },
  destination: { color: '#444' },
  time: { color: '#007AFF', fontWeight: '600' },
});
