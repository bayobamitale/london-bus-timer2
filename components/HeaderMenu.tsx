import React, { useCallback } from 'react';
import { Menu, IconButton, Divider } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { Brand } from '@/constants/theme';

export default function HeaderMenu() {
  const [visible, setVisible] = React.useState(false);
  const router = useRouter();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  useFocusEffect(
    useCallback(() => {
      setVisible(false);
    }, [])
  );

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <IconButton
          icon="dots-vertical"
          size={22}
          iconColor={Brand.navy}
          onPress={openMenu}
        />
      }
    >
      {/* SETTINGS */}
      <Menu.Item
        leadingIcon="cog"
        title="Settings"
        onPress={() => {
          closeMenu();
          router.push('/settings');
        }}
      />

      <Divider />

      {/* ABOUT */}
      <Menu.Item
        leadingIcon="information-outline"
        title="About"
        onPress={() => {
          closeMenu();
          router.push('/about');
        }}
      />
    </Menu>
  );
}
