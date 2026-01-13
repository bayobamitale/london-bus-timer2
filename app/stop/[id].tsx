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
  stopPointName: string;
};

function formatArrivalTime(seconds: number) {
  if (seconds <= 0) return 'Due';

  const minutes = Math.floor(seconds / 60);
  return minutes <= 0 ? 'Due' : `${minutes} min`;
}

export default function StopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [stopName, setStopName] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    const fetchArrivals = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.tfl.gov.uk/StopPoint/${id}/Arrivals`
        );
        const data = await res.json();

        if (!Array.isArray(data)) {
          setArrivals([]);
          return;
        }

        // Filter buses only
        const buses = data.filter((a: any) => a.modeName === 'bus');

        // Sort by arrival time (soonest first)
        const sorted: Arrival[] = [...buses].sort(
          (a, b) => a.timeToStation - b.timeToStation
        );

        setArrivals(sorted);

        if (sorted.length > 0) setStopName(sorted[0].stopPointName || '');
      } catch (err) {
        console.error(err);
        setArrivals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArrivals();
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{stopName || `Stop ID: ${id}`}</Text>

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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  line: {
    width: 50, // fixed width for bus line
    fontSize: 16,
    fontWeight: '600',
  },
  destination: {
    flex: 1, // takes remaining space
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
  },
  time: {
    width: 60, // fixed width for time
    fontSize: 16,
    color: '#E11D48',
    fontWeight: '600',
    textAlign: 'right',
  },
});
