import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/theme';

/**
 * Standard screen shell: safe area + optional scroll + consistent padding.
 * Use <Screen scroll={false}> for FlatList-based screens.
 */
export default function Screen({
  children,
  scroll = true,
  padded = true,
  refreshControl,
  style,
  contentContainerStyle,
}) {
  const body = {
    paddingHorizontal: padded ? 16 : 0,
  };

  if (!scroll) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, style]}>
        <StatusBar style="dark" />
        <View style={[styles.flex, body]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safe, style]}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        contentContainerStyle={[body, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
});