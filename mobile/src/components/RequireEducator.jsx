import React from 'react';
import { Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

/**
 * Guards a screen so it only renders for educator users.
 * Redirects to the home tab if the current user is not an educator.
 */
export default function RequireEducator({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isEducator } = useApp();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 84, height: 84, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="school" size={40} color={colors.primary} />
          </View>
          <Text style={{ color: colors.textSecondary }}>Checking permissions…</Text>
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!isEducator) {
    // Non-educators should not see educator screens. Redirect to student home.
    return <Redirect href="/(tabs)" />;
  }

  return children;
}
