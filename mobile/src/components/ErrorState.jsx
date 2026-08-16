import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import Button from './Button';

/** Error state with a friendly message and retry action. Never shows stack traces. */
export default function ErrorState({ message = 'Something went wrong', onRetry, style }) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-offline-outline" size={34} color={colors.danger} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Button title="Try Again" onPress={onRetry} style={{ marginTop: 16, alignSelf: 'stretch' }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});