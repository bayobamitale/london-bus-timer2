import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatArrivalTime, getStopArrivals, getStopPoint, type Arrival } from '@/services/tfl';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/constants/theme';
import { useFavorites } from '@/context/favoritesContext';

export default function StopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [stopName, setStopName] = useState<string>('');
  const savedStop = favorites.find((favorite) => favorite.type === 'stop' && favorite.stopId === id);

  useEffect(() => {
    if (!id) return;

    const fetchArrivals = async () => {
      setLoading(true);
      try {
        const [buses, stop] = await Promise.all([
          getStopArrivals(id),
          getStopPoint(id).catch(() => null),
        ]);
        setArrivals(buses);
        setStopName(stop?.commonName || buses[0]?.stopPointName || '');
      } catch (err) {
        console.error(err);
        setArrivals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArrivals();
  }, [id]);

  const toggleFavorite = () => {
    if (!id) return;

    if (savedStop) {
      removeFavorite(savedStop.id);
      return;
    }

    addFavorite({
      id: `stop:${id}`,
      title: stopName || `Stop ${id}`,
      icon: 'location',
      stopId: id,
      type: 'stop',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.eyebrow}>LIVE DEPARTURES</Text>
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              savedStop && styles.favoriteButtonSelected,
              loading && styles.favoriteButtonDisabled,
            ]}
            onPress={toggleFavorite}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={savedStop ? 'Remove stop from favourites' : 'Add stop to favourites'}
            accessibilityState={{ selected: Boolean(savedStop) }}
          >
            <Ionicons
              name={savedStop ? 'star' : 'star-outline'}
              size={18}
              color={savedStop ? '#fff' : Brand.red}
            />
            <Text style={[styles.favoriteButtonText, savedStop && styles.favoriteButtonTextSelected]}>
              {savedStop ? 'Saved' : 'Save stop'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{stopName || `Stop ${id}`}</Text>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Updating from TfL</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={Brand.red} />
          <Text style={styles.loadingText}>Loading arrivals…</Text>
        </View>
      ) : arrivals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={34} color={Brand.red} />
          <Text style={styles.emptyTitle}>No arrivals right now</Text>
          <Text style={styles.emptyText}>Check again in a moment.</Text>
        </View>
      ) : (
        <FlatList
          data={arrivals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.arrivalRow}>
              <View style={styles.routeBadge}>
                <Text style={styles.line}>{item.lineName}</Text>
              </View>
              <Text
                style={styles.destination}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                → {item.destinationName}
              </Text>
              <Text style={styles.time}>{formatArrivalTime(item.timeToStation)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Brand.cream },
  header: { paddingTop: 6, marginBottom: 18 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: Brand.red, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  favoriteButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.red,
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  favoriteButtonSelected: { backgroundColor: Brand.red },
  favoriteButtonDisabled: { opacity: 0.5 },
  favoriteButtonText: { color: Brand.red, fontSize: 12, fontWeight: '800', marginLeft: 6 },
  favoriteButtonTextSelected: { color: '#fff' },
  title: {
    color: Brand.navy,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.4,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Brand.success, marginRight: 7 },
  liveText: { color: Brand.textMuted, fontSize: 12 },
  loadingState: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  loadingText: { color: Brand.textMuted, marginLeft: 10 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { color: Brand.navy, fontSize: 19, fontWeight: '800', marginTop: 12 },
  emptyText: { color: Brand.textMuted, marginTop: 4 },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.surface,
  },
  routeBadge: {
    minWidth: 46,
    minHeight: 38,
    paddingHorizontal: 8,
    backgroundColor: Brand.navy,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  destination: {
    flex: 1,
    fontSize: 16,
    color: Brand.text,
    marginHorizontal: 12,
  },
  time: {
    width: 60,
    fontSize: 16,
    color: Brand.success,
    fontWeight: '800',
    textAlign: 'right',
  },
});
