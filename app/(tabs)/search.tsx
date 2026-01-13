import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const isBusNumber = /^[a-zA-Z]?\d+[a-zA-Z]?$/.test(trimmed);

    if (isBusNumber) {
      router.push({
         pathname: '/bus/[line]',
         params: { line: trimmed.toUpperCase() },
      });
    } else {
      router.push({
        pathname: '/results',
        params: { q: trimmed },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Bus number, stop name or postcode"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {/* Helper text */}
      <View style={styles.help}>
        <Text style={styles.helpText}>Examples:</Text>
        <Text style={styles.helpText}>• 24</Text>
        <Text style={styles.helpText}>• Oxford Circus</Text>
        <Text style={styles.helpText}>• SW1A 1AA</Text>
      </View>
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#E11D48',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  help: {
    marginTop: 24,
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
});
