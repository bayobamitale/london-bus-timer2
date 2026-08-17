import { Text, StyleSheet, ScrollView, Linking, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/constants/theme';

export default function AboutScreen() {
  const appVersion =
    Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Ionicons name="bus" size={34} color="#fff" />
        </View>
        <Text style={styles.appName}>London Bus Timer</Text>
        <Text style={styles.version}>Version {appVersion}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.text}>
          London Bus Timer helps you quickly find bus routes, stops,
          and live arrival times across London.
        </Text>

        <Text style={styles.sectionTitle}>Data source</Text>
        <Text style={styles.text}>
          Live transport data is provided by Transport for London (TfL)
          using their open API.
        </Text>

        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.text}>• Live bus arrivals</Text>
        <Text style={styles.text}>• Search by bus, stop, or postcode</Text>
        <Text style={styles.text}>• Save favourite stops & routes</Text>

        <Text style={styles.sectionTitle}>Developer</Text>
        <Text style={styles.text}>Developed by Bayonson</Text>
      </View>

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
    flexGrow: 1,
    padding: 20,
    backgroundColor: Brand.cream,
  },
  hero: { alignItems: 'center', paddingVertical: 24 },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: Brand.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    color: Brand.navy,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: Brand.textMuted,
  },
  card: {
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 18,
    padding: 18,
  },
  sectionTitle: {
    color: Brand.navy,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: Brand.textMuted,
  },
  link: {
    marginTop: 18,
    fontSize: 15,
    color: Brand.red,
    fontWeight: '700',
    textAlign: 'center',
  },
});
