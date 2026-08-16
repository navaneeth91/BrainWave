import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../constants/theme';

/**
 * Slim horizontal progress bar.
 */
export default function ProgressBar({ percent = 0, height = 8, color = colors.primary, showLabel }) {
  const safe = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { height, width: `${safe}%`, backgroundColor: color }]} />
      </View>
      {showLabel ? <Text style={styles.label}>{safe}%</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start' },
  track: {
    width: '100%',
    backgroundColor: '#EDF1F6',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: { borderRadius: radius.pill },
  label: { marginTop: 4, fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
});