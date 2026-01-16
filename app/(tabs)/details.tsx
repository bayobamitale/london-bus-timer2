import { FlatList, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

type BusLine = {
  id: string;
  name: string;
};

export default function DetailsIndex() {
  const router = useRouter();
  const [busLines, setBusLines] = useState<BusLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusLines = async () => {
      try {
        const res = await fetch('https://api.tfl.gov.uk/Line/Mode/bus');
        const data = await res.json();
        const lines: BusLine[] = data.map((line: any) => ({
          id: line.id,
          name: line.name,
        }));
        setBusLines(lines);
      } catch (err) {
        console.error('Failed to fetch bus lines', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusLines();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus Details</Text>

      <FlatList
        data={busLines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.busRow}
            onPress={() => router.push(`/bus/${item.id}`)}
          >
            <Text style={styles.busNumber}>{item.name}</Text>
            <Text style={styles.busText}>View route & times</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  busRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    marginBottom: 10,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: '700',
    width: 50,
  },
  busText: { color: '#666' },
});
