import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useApp } from '../src/context/AppContext';
import { colors } from '../src/constants/theme';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isEducator } = useApp();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Everyone lands on the Home tab. Educators reach their studio from Home
  // (or from Profile), so there is always a clear path back to Home.
  return <Redirect href="/(tabs)" />;
}