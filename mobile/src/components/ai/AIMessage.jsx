import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../constants/theme';

/**
 * Renders one chat bubble (user or assistant). AI replies are rendered as
 * plain text with basic structural cleanup (headings, lists, code fences are
 * shown as plain text — no HTML is ever injected).
 */
export function AIMessage({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={[styles.row, styles.rowUser]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
        <View style={[styles.avatar, styles.userAvatar]}>
          <Ionicons name="person" size={14} color={colors.textSecondary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, styles.aiAvatar]}>
        <Ionicons name="sparkles" size={14} color={colors.white} />
      </View>
      <View style={[styles.bubble, styles.aiBubble, message.isError && styles.errorBubble]}>
        <Text style={[styles.aiText, message.isError && styles.errorText]}>
          {renderLightMarkdown(message.content)}
        </Text>
      </View>
    </View>
  );
}

/**
 * Very small markdown "renderer": converts **bold**, `code`, and a few list
 * bullets into friendly plain text so model output reads well on a phone.
 */
function renderLightMarkdown(text) {
  let out = String(text || '');

  // Code fences -> keep the content but drop the fence markers.
  out = out.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');

  // Bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '$1');

  // Inline code
  out = out.replace(/`([^`]+)`/g, '$1');

  // Bullet lists (keep bullet char, it reads fine in a Text node)
  out = out.replace(/^\s*[-*•]\s+/gm, '• ');

  return out;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  rowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aiAvatar: { backgroundColor: colors.primary },
  userAvatar: { backgroundColor: '#EEF2F6' },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight, borderBottomLeftRadius: 4 },
  errorBubble: { backgroundColor: colors.dangerSoft, borderColor: '#FECACA' },
  userText: { fontSize: 14, lineHeight: 20, color: colors.white },
  aiText: { fontSize: 14, lineHeight: 20, color: colors.text },
  errorText: { color: '#B91C1C' },
});