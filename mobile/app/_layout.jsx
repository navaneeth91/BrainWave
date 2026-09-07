import React from 'react';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { AppContextProvider } from '../src/context/AppContext';
import BrandedSplash from '../src/components/BrandedSplash';

// Clerk publishable key (same test instance used by the existing web client).
// Fallback keeps the value available even when .env is not bundled
// (publishable keys are public identifiers, safe to embed).
const PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_c3RyaWtpbmctcmFtLTQyLmNsZXJrLmFjY291bnRzLmRldiQ';

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
    return <BrandedSplash />;
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