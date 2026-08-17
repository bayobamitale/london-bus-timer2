import * as Haptics from 'expo-haptics';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

type HapticTabProps = ComponentProps<typeof Pressable> & {
  pressColor?: string;
  pressOpacity?: number;
};

export function HapticTab({ pressColor, pressOpacity, ...props }: HapticTabProps) {
  return (
    <Pressable
      {...props}
      android_ripple={pressColor ? { color: pressColor, borderless: true } : undefined}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
