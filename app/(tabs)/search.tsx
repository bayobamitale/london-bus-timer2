import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard } from 'react-native';
import { router } from 'expo-router';
import stopsData from '../data/stoppoints.json'; // your local stops JSON

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

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);

  // Detect type of input: bus number, postcode, or stop name
  function detectInputType(input: string) {
    const trimmed = input.trim();
    const busNumberPattern = /^[0-9]+[A-Za-z]?$/; // e.g., 24 or 25A
    const postcodePattern = /^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/i; // UK postcode

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
        // Navigate to bus line screen
        router.push(`/bus/${trimmed.toUpperCase()}`);
      } else if (type === 'stop') {
        // Filter local stops JSON
        const matches = (stopsData as Stop[]).filter((stop) =>
          stop.commonName.toLowerCase().includes(trimmed.toLowerCase())
        );
        setSearchResults(matches);
     } else if (type === 'postcode') {
  try {
    // Convert postcode to coordinates using postcodes.io
    const geoRes = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}`
    );
    const geoData = await geoRes.json();

    if (!geoData || geoData.status !== 200 || !geoData.result) {
      setSearchResults([]);
      return;
    }

    const { latitude, longitude } = geoData.result;

    // Find nearby bus stops using TfL StopPoint API
    const stopsRes = await fetch(
      `https://api.tfl.gov.uk/StopPoint?lat=${latitude}&lon=${longitude}&stopTypes=NaptanPublicBusCoachTram&modes=bus&radius=500`
    );
    const stopsData = await stopsRes.json();

    if (!Array.isArray(stopsData.stopPoints)) {
      setSearchResults([]);
      return;
    }

    const stops: Stop[] = stopsData.stopPoints.map((s: any) => ({
      id: s.id,
      naptanId: s.naptanId,
      commonName: s.commonName,
      lat: s.lat,
      lon: s.lon,
      indicator: s.indicator,
      stopLetter: s.stopLetter,
      modes: s.modes,
    }));

    setSearchResults(stops);
  } catch (err) {
    console.error("Postcode search error:", err);
    setSearchResults([]);
  }
}


    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Bus Stops</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Enter bus number, stop, or postcode"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && <Text style={{ marginTop: 16 }}>Loading...</Text>}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultRow}
            onPress={() => router.push(`/stop/${item.id}`)}
          >
            <Text style={styles.stopName}>{item.commonName}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (<Text style={{ marginTop: 16, color: '#666' }}>No results found</Text>) : null 
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  button: { backgroundColor: '#E11D48', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  resultRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stopName: { fontSize: 16 },
});
