import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

/** Header bar for detail screens with a back button and title. */
export default function ScreenHeader({ title, subtitle, onBack, right }) {
  return (
    <Pressable onPress={onBack} style={styles.row} hitSlop={10}>
      <Ionicons name="chevron-back" size={24} color={colors.text} />
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}> · {subtitle}</Text> : null}
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, flexShrink: 1 },
  subtitle: { fontSize: 14, color: colors.textSecondary, flexShrink: 1 },
});