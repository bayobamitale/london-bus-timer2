import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Text,
  Switch,
  List,
  Divider,
  Button,
} from 'react-native-paper';
import * as Location from 'expo-location';
import { useFavorites } from '@/context/favoritesContext';

export default function SettingsScreen() {
  const { clearFavorites, favorites } = useFavorites();

  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Toggle location (example only – real permission handled elsewhere)
  const toggleLocation = async () => {
    if (locationEnabled) {
      setLocationEnabled(false);
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }
      setLocationEnabled(true);
    }
  };

  // Confirm clear favorites
  const confirmClearFavorites = () => {
    if (favorites.length === 0) {
      Alert.alert('No favorites', 'You have no favorites to clear.');
      return;
    }

    Alert.alert(
      'Clear favorites?',
      'This will remove all your saved favorites.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearFavorites,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Settings
      </Text>

      {/* LOCATION */}
      <List.Section>
        <List.Subheader>Location</List.Subheader>

        <List.Item
          title="Use current location"
          description="Show nearby bus stops"
          left={(props) => <List.Icon {...props} icon="map-marker" />}
          right={() => (
            <Switch
              value={locationEnabled}
              onValueChange={toggleLocation}
            />
          )}
        />
      </List.Section>

      <Divider />

      {/* NOTIFICATIONS */}
      <List.Section>
        <List.Subheader>Notifications</List.Subheader>

        <List.Item
          title="Bus arrival alerts"
          description="Notify when buses are close"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
        />
      </List.Section>

      <Divider />

      {/* FAVORITES */}
      <List.Section>
        <List.Subheader>Favorites</List.Subheader>

        <List.Item
          title="Clear all favorites"
          description={`${favorites.length} saved`}
          left={(props) => <List.Icon {...props} icon="star-remove" />}
          onPress={confirmClearFavorites}
        />
      </List.Section>
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
    fontWeight: '700',
    marginBottom: 8,
  },
});
