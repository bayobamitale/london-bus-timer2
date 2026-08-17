import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/constants/theme';
import {
  getLineDirectionStops,
  type LineDirectionStops,
} from '@/services/tfl';

export default function BusLineScreen() {
  const { line } = useLocalSearchParams<{ line: string }>();
  const [directions, setDirections] = useState<LineDirectionStops[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!line) return;

    const loadRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        setDirections(await getLineDirectionStops(line));
      } catch (err) {
        console.error('Failed to load route stops', err);
        setError('Unable to load this route. Please try again.');
        setDirections([]);
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [line]);

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={Brand.red} />
        <Text style={styles.loadingText}>Loading both directions…</Text>
      </View>
    );
  }

  const sections = directions.map((item) => ({
    title: item.direction === 'inbound' ? 'Inbound' : 'Outbound',
    direction: item.direction,
    data: item.stops,
  }));
  const hasStops = directions.some((item) => item.stops.length > 0);

  return (
    <View style={styles.container}>
      {error || !hasStops ? (
        <View style={styles.emptyState}>
          <Ionicons name="git-branch-outline" size={34} color={Brand.red} />
          <Text style={styles.emptyTitle}>Route stops unavailable</Text>
          <Text style={styles.emptyText}>{error || 'No stops were found for this route.'}</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.eyebrow}>ROUTE {line}</Text>
              <Text style={styles.title}>Stops in both directions</Text>
              <Text style={styles.subtitle}>
                Browse inbound and outbound stops without choosing first.
              </Text>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.directionIcon}>
                <Ionicons
                  name={section.direction === 'inbound' ? 'arrow-down' : 'arrow-up'}
                  size={17}
                  color="#fff"
                />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.stopCount}>{section.data.length} stops</Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.stopRow}
              onPress={() => router.push({ pathname: '/stop/[id]', params: { id: item.id } })}
            >
              <View style={styles.stopIndex}>
                <Text style={styles.stopIndexText}>{index + 1}</Text>
              </View>
              <Text style={styles.stopName}>
                {item.name}
                {item.stopLetter ? ` (${item.stopLetter})` : ''}
              </Text>
              <Ionicons name="chevron-forward" size={19} color={Brand.textMuted} />
            </TouchableOpacity>
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.cream },
  listContent: { padding: 16, paddingBottom: 28 },
  header: { marginBottom: 20 },
  eyebrow: { color: Brand.red, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginTop: 6 },
  title: { color: Brand.navy, fontSize: 28, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 },
  subtitle: { color: Brand.textMuted, fontSize: 15, lineHeight: 21, marginTop: 6 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  directionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { color: Brand.navy, fontSize: 18, fontWeight: '800', marginLeft: 10 },
  stopCount: { color: Brand.textMuted, fontSize: 12, marginLeft: 'auto' },
  stopRow: {
    padding: 13,
    marginTop: 7,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Brand.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stopIndexText: { color: Brand.navy, fontSize: 11, fontWeight: '800' },
  stopName: { color: Brand.text, fontSize: 14, fontWeight: '600', flex: 1 },
  loadingState: {
    flex: 1,
    backgroundColor: Brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: Brand.textMuted, marginTop: 12 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: Brand.navy, fontSize: 19, fontWeight: '800', marginTop: 12 },
  emptyText: { color: Brand.textMuted, marginTop: 5, textAlign: 'center' },
});
