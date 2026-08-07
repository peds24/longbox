import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <NativeTabs backgroundColor={Colors.bg} indicatorColor={Colors.surface} tintColor={Colors.accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Reading</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="collection">
        <NativeTabs.Trigger.Label>Comic Box</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="archivebox.fill" md="inventory_2" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
