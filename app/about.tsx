import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const appVersion =
    Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* App Title */}
      <Text style={styles.appName}>London Bus Timer</Text>
      <Text style={styles.version}>Version {appVersion}</Text>

      {/* Description */}
      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.text}>
        London Bus Timer helps you quickly find bus routes, stops,
        and live arrival times across London.
      </Text>

      {/* Data Source */}
      <Text style={styles.sectionTitle}>Data Source</Text>
      <Text style={styles.text}>
        Live transport data is provided by Transport for London (TfL)
        using their open API.
      </Text>

      {/* Features */}
      <Text style={styles.sectionTitle}>Features</Text>
      <Text style={styles.text}>• Live bus arrivals</Text>
      <Text style={styles.text}>• Search by bus, stop, or postcode</Text>
      <Text style={styles.text}>• Save favourite stops & routes</Text>

      {/* Credits */}
      <Text style={styles.sectionTitle}>Developer</Text>
      <Text style={styles.text}>
        Developed by Bayonson
      </Text>

      {/* Links */}
      <Text
        style={styles.link}
        onPress={() => Linking.openURL('https://tfl.gov.uk')}
      >
        Visit Transport for London
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  link: {
    marginTop: 20,
    fontSize: 15,
    color: '#007AFF',
  },
});
