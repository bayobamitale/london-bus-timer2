import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFavorites } from '@/context/favoritesContext';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, removeFavorite } = useFavorites();

  const handleRemove = (id: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this favorite?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFavorite(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>No favorites added yet</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                if (item.type === 'stop' && item.stopId) {
                  router.push(`/stop/${item.stopId}`);
                } else if (item.type === 'bus' && item.line) {
                  router.push(`/bus/${item.line}`);
                }
              }}
            >
              <Ionicons
                name={item.type === 'stop' ? 'location-outline' : 'bus-outline'}
                size={22}
                color="#333"
              />
              <Text style={styles.title}>{item.title}</Text>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#ff3b30" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 14,
    borderRadius: 10,
    position: 'relative',
  },
  title: { marginLeft: 10, fontSize: 16, fontWeight: '500', flex: 1 },
  removeBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 20, fontSize: 16 },
});
