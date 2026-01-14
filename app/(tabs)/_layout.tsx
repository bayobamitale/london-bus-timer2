import { Tabs } from 'expo-router';
import React from 'react';

//import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  //const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor:'#E11D48',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          switch (route.name){
            case 'index':
              iconName = 'home';
              break;
            case 'search':
              iconName = 'search';
              break;
            case 'nearby':
              iconName = 'location';
              break;
            case 'favourites':
              iconName = 'star';
              break;
            case 'more':
              iconName = 'ellipsis-horizontal';
              break;
            default:
              iconName = 'help';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
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
        name="more"
        options={{
          title:'More'
        }}
      />
    </Tabs>
    
  );
}
