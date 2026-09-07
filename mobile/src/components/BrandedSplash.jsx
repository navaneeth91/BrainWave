import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

// Branded launch screen shown while Clerk restores the session.
// Mirrors the native splash (logo + BrainWave + Made by Navaneeth)
// so the hand-off is visually seamless.
export default function BrandedSplash() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/splash-brainwave.png')}
        style={styles.brand}
        resizeMode="contain"
      />
      <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    width: 300,
    height: 400,
  },
  loader: {
    marginTop: -40,
  },
});
