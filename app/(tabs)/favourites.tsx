import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFavorites } from '@/context/favoritesContext';
import { Brand } from '@/constants/theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, removeFavorite } = useFavorites();

  const handleRemove = (id: string) => {
    Alert.alert(
      'Remove favourite',
      'Are you sure you want to remove this favourite?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFavorite(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="star-outline" size={34} color={Brand.red} />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyText}>Favourite stops and routes will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.eyebrow}>QUICK ACCESS</Text>
              <Text style={styles.heading}>Your favourites</Text>
            </View>
          }
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
                color={Brand.red}
              />
              <View style={styles.itemText}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{item.type === 'stop' ? 'Bus stop' : 'Bus route'}</Text>
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={(event) => {
                  event.stopPropagation();
                  handleRemove(item.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title} from favourites`}
              >
                <Ionicons name="trash-outline" size={19} color={Brand.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.cream, padding: 16 },
  header: { paddingTop: 6, marginBottom: 18 },
  eyebrow: { color: Brand.red, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  heading: { color: Brand.navy, fontSize: 28, fontWeight: '800', marginTop: 6 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    position: 'relative',
  },
  itemText: { marginLeft: 12, flex: 1 },
  title: { color: Brand.navy, fontSize: 16, fontWeight: '700' },
  meta: { color: Brand.textMuted, fontSize: 12, marginTop: 3, textTransform: 'capitalize' },
  removeBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FDECEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { color: Brand.navy, fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptyText: { textAlign: 'center', color: Brand.textMuted, marginTop: 6, fontSize: 14 },
});
