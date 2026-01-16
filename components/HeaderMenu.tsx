import React, { useState } from 'react';
import { View } from 'react-native';
import { Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HeaderMenu() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  return (
    <View>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            onPress={() => setVisible(true)}
          />
        }
      >
        <Menu.Item
          title="About"
          onPress={() => {
            setVisible(false);
            router.push('/about');
          }}
        />
        {/*<Menu.Item
          title="How to use"
          onPress={() => {
            setVisible(false);
            router.push('/help');
          }}
        />
        <Menu.Item
          title="Privacy"
          onPress={() => {
            setVisible(false);
            router.push('/privacy');
          }}
        />*/}
      </Menu>
    </View>
  );
}
