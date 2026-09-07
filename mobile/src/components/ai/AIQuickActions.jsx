import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../constants/theme';
import { QUICK_ACTIONS } from './quickActions';

const ACTION_ICONS = {
  explain: 'bulb-outline',
  summarize: 'document-text-outline',
  example: 'sparkles',
  points: 'star-outline',
  quiz: 'help-buoy-outline',
};

export function AIQuickActions({ onSelect, disabled = false }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 4 }}
    >
      <View style={styles.row}>
        {QUICK_ACTIONS.map((action) => {
          const icon = ACTION_ICONS[action.id] || 'sparkles';
          return (
            <Pressable
              key={action.id}
              disabled={disabled}
              onPress={() => onSelect(action.prompt)}
              style={[styles.chip, disabled && styles.chipDisabled]}
            >
              <Ionicons name={icon} size={14} color={colors.primaryDark} />
              <Text style={styles.chipText}>{action.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipDisabled: { opacity: 0.5 },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.primaryDark },
});