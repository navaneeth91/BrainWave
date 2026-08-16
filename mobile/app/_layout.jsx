import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { AppContextProvider } from '../src/context/AppContext';
import { colors } from '../src/constants/theme';

// Clerk publishable key (same test instance used by the existing web client).
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in mobile/.env');
}

// Secure token cache using expo-secure-store (required by Clerk for Expo).
const tokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Persist failures are non-fatal here.
    }
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} tokenCache={tokenCache} afterSignOutUrl="/(auth)/sign-in">
      <AppContextProvider>
        <RootNavigator />
      </AppContextProvider>
    </ClerkProvider>
  );
}

function RootNavigator() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <View style={{ width: 84, height: 84, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(educator)" />
      <Stack.Screen name="(educator)/manage-exam" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="learning/[id]" />
      <Stack.Screen name="exam/[id]" />
      <Stack.Screen name="exam-result/[id]" />
      <Stack.Screen name="certificates/index" />
      <Stack.Screen name="certificates/[id]" />
      <Stack.Screen name="verify-certificate/[id]" />
    </Stack>
  );
}