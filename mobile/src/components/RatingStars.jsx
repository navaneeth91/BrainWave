import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

/** Star rating with optional numeric value. */
export default function RatingStars({ rating = 0, size = 14, showValue = false, valueStyle }) {
  const r = Math.round(Number(rating) || 0);
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    stars.push(
      <Ionicons
        key={i}
        name={i <= r ? 'star' : 'star-outline'}
        size={size}
        color={i <= r ? '#F59E0B' : '#D1D5DB'}
        style={{ marginRight: 1 }}
      />
    );
  }
  return (
    <View style={styles.row}>
      <View style={styles.stars}>{stars}</View>
      {showValue ? <Text style={[styles.value, valueStyle]}>{Number(rating).toFixed(1)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stars: { flexDirection: 'row', alignItems: 'center' },
  value: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
});