import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import rawStopsData from '../data/stoppoints.json';
import rawRouteData from '../data/route.json';

type Stop = {
  id: string;
  commonName: string;
  lat: number;
  lon: number;
  indicator: string; // Stop letter
  lineGroup?: { lineIdentifier: string[]; direction?: string }[];
};

type RouteSection = {
  direction: 'inbound' | 'outbound';
  stopIds: string[]; // Array of stop IDs in order for that direction
};

type RouteData = {
  routeSections: RouteSection[];
};

export default function BusLineScreen() {
  const { line } = useLocalSearchParams<{ line: string }>();
  const [direction, setDirection] = useState<'Inbound' | 'Outbound' | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);

  // Parse JSON
  const stoppoints: Stop[] = (rawStopsData as any).default || rawStopsData;
  const routeData: RouteData = (rawRouteData as any).default || rawRouteData;

  useEffect(() => {
  if (!direction || !line) return;

  // Filter stops for this line
  const filteredStops = stoppoints
    .filter((stop) =>
      stop.lineGroup?.some((group) =>
        group.lineIdentifier.includes(line)
      )
    );

 
  const orderedStops = [...filteredStops].sort((a, b) => {
  const aInd = a.indicator ?? ''; // fallback to empty string
  const bInd = b.indicator ?? '';

  return direction === 'Inbound'
    ? aInd.localeCompare(bInd)
    : bInd.localeCompare(aInd); // reverse for Outbound
});

  setStops(orderedStops);
}, [direction, line]);

  if (!direction) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bus {line}</Text>
        <Text style={styles.subtitle}>Select direction:</Text>

        <TouchableOpacity style={styles.button} onPress={() => setDirection('Inbound')}>
          <Text style={styles.buttonText}>Inbound</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setDirection('Outbound')}>
          <Text style={styles.buttonText}>Outbound</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus {line} - {direction}</Text>

      {stops.length === 0 ? (
        <Text style={{ color: '#666', marginTop: 16 }}>No stops found for this direction.</Text>
      ) : (
        <FlatList
          data={stops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.stopRow}
              onPress={() => router.push({ pathname: '/stop/[id]', params: { id: item.id } })}
            >
              <Text style={styles.stopName}>{item.commonName} ({item.indicator})</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  subtitle: { fontSize: 18, marginBottom: 12 },
  button: {
    paddingVertical: 16,
    backgroundColor: '#E11D48',
    marginVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stopRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stopName: { fontSize: 16 },
  chevron: { fontSize: 18, color: '#999' },
});
