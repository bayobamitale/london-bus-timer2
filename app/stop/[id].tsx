import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

type Arrival = {
  id: string;
  lineId: string;
  lineName: string;
  destinationName: string;
  direction: string;
  timeToStation: number; // seconds
};

export default function StopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchArrivals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.tfl.gov.uk/StopPoint/${id}/Arrivals`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.warn("Unexpected API response:", data);
          setArrivals([]);
          setLoading(false);
          return;
        }

        // Sort by arrival time (soonest first)
        const sorted: Arrival[] = data.sort(
          (a: any, b: any) => a.timeToStation - b.timeToStation
        );

        setArrivals(sorted);
      } catch (err) {
        console.error("Error fetching arrivals:", err);
        setArrivals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArrivals();
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stop ID: {id}</Text>

      {loading ? (
        <Text style={{ marginTop: 16 }}>Loading arrivals...</Text>
      ) : arrivals.length === 0 ? (
        <Text style={{ marginTop: 16, color: '#666' }}>
          No arrivals available for this stop
        </Text>
      ) : (
        <FlatList
          data={arrivals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.arrivalRow}>
              <Text style={styles.line}>{item.lineName}</Text>
              <Text style={styles.destination}>→ {item.destinationName}</Text>
              <Text style={styles.time}>
                {Math.round(item.timeToStation / 60)} min
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  arrivalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  line: { fontSize: 16, fontWeight: '600' },
  destination: { fontSize: 16, color: '#333' },
  time: { fontSize: 16, color: '#E11D48', fontWeight: '600' },
});
