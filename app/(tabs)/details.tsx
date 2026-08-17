import { FlatList, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getBusLines, type BusLine } from '@/services/tfl';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/constants/theme';

export default function DetailsIndex() {
  const router = useRouter();
  const [busLines, setBusLines] = useState<BusLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusLines = async () => {
      try {
        setBusLines(await getBusLines());
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
        <ActivityIndicator size="large" color={Brand.red} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={busLines}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>LONDON NETWORK</Text>
            <Text style={styles.title}>All bus routes</Text>
            <Text style={styles.subtitle}>Choose a route to view its stops and times.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.busRow}
            onPress={() => router.push(`/bus/${item.id}`)}
          >
            <View style={styles.routeBadge}>
              <Text style={styles.busNumber}>{item.name}</Text>
            </View>
            <Text style={styles.busText}>View route and stops</Text>
            <Ionicons name="chevron-forward" size={19} color={Brand.textMuted} />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Brand.cream },
  header: { paddingTop: 6, marginBottom: 18 },
  eyebrow: { color: Brand.red, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: Brand.navy, fontSize: 28, fontWeight: '800', marginTop: 6 },
  subtitle: { color: Brand.textMuted, marginTop: 4 },
  busRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    marginBottom: 9,
  },
  routeBadge: {
    minWidth: 48,
    minHeight: 38,
    paddingHorizontal: 8,
    backgroundColor: Brand.red,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  busText: { color: Brand.text, flex: 1, marginLeft: 12, fontWeight: '600' },
});
