import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStopsNearPostcode, type StopPoint } from '@/services/tfl';
import stopsData from '../data/stoppoints.json';
import { Brand } from '@/constants/theme';

type Stop = StopPoint;

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);

  function detectInputType(input: string) {
    const trimmed = input.trim();
    const busNumberPattern = /^[0-9]+[A-Za-z]?$/;
    const postcodePattern = /^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/i;

    if (busNumberPattern.test(trimmed)) return 'bus';
    if (postcodePattern.test(trimmed)) return 'postcode';
    return 'stop';
  }

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    const type = detectInputType(trimmed);

    Keyboard.dismiss();
    setLoading(true);
    setSearchResults([]);

    try {
      if (type === 'bus') {
        router.push(`/bus/${trimmed.toUpperCase()}`);
      } else if (type === 'stop') {
        const matches = (stopsData as Stop[]).filter((stop) =>
          stop.commonName.toLowerCase().includes(trimmed.toLowerCase())
        );
        setSearchResults(matches);
      } else if (type === 'postcode') {
        setSearchResults(await getStopsNearPostcode(trimmed));
      }
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>PLAN YOUR JOURNEY</Text>
        <Text style={styles.title}>Find your bus</Text>
        <Text style={styles.subtitle}>Search by route number, stop name or London postcode.</Text>
      </View>

      <View style={styles.searchBox}>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={20} color={Brand.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Bus, stop or postcode"
            placeholderTextColor={Brand.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="arrow-forward" size={21} color="#fff" />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        style={styles.results}
        contentContainerStyle={searchResults.length === 0 ? styles.emptyResults : undefined}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultRow}
            onPress={() => router.push(`/stop/${item.id}`)}
          >
            <View style={styles.stopIcon}>
              <Ionicons name="bus" size={19} color={Brand.red} />
            </View>
            <View style={styles.resultText}>
              <Text style={styles.stopName}>{item.commonName}</Text>
              <Text style={styles.stopMeta}>{item.indicator || 'London bus stop'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={Brand.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={34} color={Brand.red} />
              <Text style={styles.emptyTitle}>Ready when you are</Text>
              <Text style={styles.emptyText}>Try “36”, “Camberwell Green” or “SE5 7AB”.</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Brand.cream },
  intro: { marginBottom: 20, paddingTop: 8 },
  eyebrow: { color: Brand.red, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: Brand.navy, fontSize: 30, fontWeight: '800', marginTop: 6, letterSpacing: -0.6 },
  subtitle: { color: Brand.textMuted, fontSize: 14, lineHeight: 20, marginTop: 5, maxWidth: 330 },
  searchBox: { flexDirection: 'row', alignItems: 'center' },
  inputWrap: {
    flex: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Brand.text,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  button: {
    width: 54,
    height: 54,
    backgroundColor: Brand.red,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  results: { marginTop: 18 },
  emptyResults: { flexGrow: 1 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 9,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 16,
  },
  stopIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDECEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: { flex: 1, marginLeft: 12 },
  stopName: { color: Brand.navy, fontSize: 15, fontWeight: '700' },
  stopMeta: { color: Brand.textMuted, fontSize: 12, marginTop: 3 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 90 },
  emptyTitle: { color: Brand.navy, fontSize: 18, fontWeight: '800', marginTop: 12 },
  emptyText: { color: Brand.textMuted, textAlign: 'center', marginTop: 5 },
});
