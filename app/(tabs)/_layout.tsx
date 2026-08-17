import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '@/constants/theme';
import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: Brand.surface },
        headerTitleStyle: { color: Brand.navy, fontWeight: '800', fontSize: 18 },
        headerShadowVisible: false,
        tabBarActiveTintColor: Brand.red,
        tabBarInactiveTintColor: Brand.textMuted,
        tabBarButton: (props) => <HapticTab {...(props as any)} />,
        tabBarStyle: {
          backgroundColor: Brand.surface,
          borderTopColor: Brand.border,
          height: 66,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: focused ? 'home' : 'home-outline',
            search: focused ? 'search' : 'search-outline',
            nearby: focused ? 'location' : 'location-outline',
            favourites: focused ? 'star' : 'star-outline',
            details: focused ? 'list' : 'list-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'help-circle-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:'Home'
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title:'Search'
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title:'Nearby'
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title:'Favourites'
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title:'Details'
        }}
      />
    </Tabs>
  );
}
