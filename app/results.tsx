import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ResultsScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>
        Search Results
      </Text>

      <Text style={{ marginTop: 12, color: '#666' }}>
        Results for: {q}
      </Text>
    </View>
  );
}
