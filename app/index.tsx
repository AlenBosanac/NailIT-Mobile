import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { role, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    // Mali timeout da Root Layout stigne mountati Stack
    const timer = setTimeout(() => {
      if (!role) {
        router.replace('/(auth)/login' as any);
      } else {
        router.replace('/(tabs)/tasks' as any);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [_hasHydrated, role]);

  // Uvijek prikaži spinner dok čekamo
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );
}