import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../constants/theme';
import { Pressable } from 'react-native';

/** Skeleton loading placeholder rows for course lists. */
export function CourseSkeleton({ count = 3 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.thumb} />
          <View style={styles.body}>
            <View style={[styles.line, { width: '90%' }]} />
            <View style={[styles.line, { width: '60%', height: 12 }]} />
            <View style={[styles.line, { width: '40%', height: 12 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default CourseSkeleton;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  thumb: { width: 96, height: 84, backgroundColor: colors.skeleton },
  body: { flex: 1, padding: 12, gap: 8, justifyContent: 'center' },
  line: { height: 14, borderRadius: 6, backgroundColor: colors.skeleton },
});