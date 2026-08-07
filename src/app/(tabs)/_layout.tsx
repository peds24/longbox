import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <NativeTabs backgroundColor={Colors.bg} indicatorColor={Colors.surface} tintColor={Colors.accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Reading</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="read">
        <NativeTabs.Trigger.Label>Read</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checkmark.circle.fill" md="check_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
