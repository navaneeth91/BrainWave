import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../constants/theme';

/**
 * Accessible button for the BrainWave theme.
 * variants: primary | secondary | outline | ghost | danger
 */
export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
        ? colors.primarySoft
        : variant === 'outline'
          ? 'transparent'
          : variant === 'danger'
            ? colors.danger
            : 'transparent';

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? colors.white
      : variant === 'outline' || variant === 'ghost'
        ? colors.primaryDark
        : colors.primaryDark;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        variant === 'outline' && styles.outline,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primaryDark} />
      ) : (
        <View style={styles.row}>
          {icon}
          {!!title && <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  outline: { borderWidth: 1.5, borderColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
});