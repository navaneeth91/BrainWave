import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../constants/theme';

/**
 * Shared educator header. Always shows a Home affordance so educators can
 * always return to the student home tab — fixing the previous dead-end
 * navigation where the educator area had no path back to Home.
 */
export default function EducatorHeader({ title }) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push('/(tabs)')}
        style={styles.homeBtn}
        accessibilityLabel="Back to home"
      >
        <Ionicons name="home" size={20} color={colors.primaryDark} />
        <Text style={styles.homeText}>Home</Text>
      </Pressable>
      <View style={{ flex: 1 }} />
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  homeText: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  title: { fontSize: 16, fontWeight: '800', color: colors.textMuted },
});