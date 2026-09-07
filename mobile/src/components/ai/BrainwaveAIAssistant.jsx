import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBrainwaveAI, MAX_MESSAGE_LENGTH } from '../../hooks/useBrainwaveAI';
import { AIMessage } from './AIMessage';
import { AIQuickActions } from './AIQuickActions';
import { colors, radius } from '../../constants/theme';

/**
 * BrainWave AI Learning Assistant — mounted on the Student Player.
 * Shows a floating "Ask BrainWave AI" button, and opens a chat bottom sheet
 * that talks to the existing backend endpoint POST /api/ai/chat.
 */
export default function BrainwaveAIAssistant({ courseData, currentLecture }) {
  const courseId = courseData?._id;
  const lectureId = currentLecture?.lectureId;
  const hasLecture = Boolean(lectureId);

  const { isOpen, open, close, messages, sendMessage, isLoading, resetChat } =
    useBrainwaveAI({ courseId, lectureId });

  if (!courseId) return null;

  return (
    <>
      {!isOpen ? (
        <Pressable
          onPress={open}
          accessibilityLabel="Ask BrainWave AI"
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <Ionicons name="sparkles" size={20} color={colors.white} />
          <Text style={styles.fabText}>Ask AI</Text>
        </Pressable>
      ) : null}

      {isOpen ? (
        <AIChatSheet
          onClose={close}
          onSend={sendMessage}
          onReset={resetChat}
          messages={messages}
          isLoading={isLoading}
          hasLecture={hasLecture}
          courseTitle={courseData?.courseTitle}
          currentLectureTitle={currentLecture?.lectureTitle}
        />
      ) : null}
    </>
  );
}

function AIChatSheet({
  onClose,
  onSend,
  onReset,
  messages,
  isLoading,
  hasLecture,
  courseTitle,
  currentLectureTitle,
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (!input.trim() || isLoading || !hasLecture) return;
    const text = input.trim();
    setInput('');
    onSend(text);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd?.({ animated: true });
  }, [messages, isLoading]);

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close assistant" />
      <KeyboardAvoidingView style={styles.sheet} behavior="padding" pointerEvents="box-none">
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <Ionicons name="sparkles" size={18} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>BrainWave AI</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {currentLectureTitle ? `Learning: ${currentLectureTitle}` : 'Select a lecture to start'}
            </Text>
          </View>
          <Pressable onPress={onReset} style={styles.iconBtn} accessibilityLabel="New chat">
            <Ionicons name="refresh" size={20} color={colors.white} />
          </Pressable>
          <Pressable onPress={onClose} style={styles.iconBtn} accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={colors.white} />
          </Pressable>
        </View>

        {courseTitle ? (
          <View style={styles.contextChip}>
            <Ionicons name="book" size={13} color={colors.primaryDark} />
            <Text style={styles.contextText} numberOfLines={1}>{courseTitle}</Text>
          </View>
        ) : null}

        <ScrollView style={styles.body} ref={scrollRef} contentContainerStyle={styles.bodyContent}>
          {messages.length === 0 ? (
            <View style={styles.welcome}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="sparkles" size={24} color={colors.primary} />
              </View>
              <Text style={styles.welcomeTitle}>Hi! I'm BrainWave AI</Text>
              <Text style={styles.welcomeText}>
                I can help you understand this course and lecture. Try asking:{'\n'}• "Explain this topic simply"{'\n'}• "Give me an example"{'\n'}• "What are the important points?"
              </Text>
              <View style={{ marginTop: 10 }}>
                <AIQuickActions onSelect={(p) => { setInput(''); onSend(p); }} disabled={!hasLecture || isLoading} />
              </View>
              {!hasLecture ? (
                <View style={styles.lectureHint}>
                  <Text style={styles.lectureHintText}>
                    Select a lecture from the curriculum first so I know what you are learning.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            messages.map((message) => <AIMessage key={message.id} message={message} />)
          )}
          {isLoading ? (
            <View style={styles.typingRow}>
              <View style={styles.aiMini}>
                <Ionicons name="sparkles" size={13} color={colors.white} />
              </View>
              <ActivityIndicator color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.typingText}>BrainWave AI is thinking…</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={(t) => setInput(t.slice(0, MAX_MESSAGE_LENGTH))}
            placeholder={hasLecture ? 'Ask about this course…' : 'Select a lecture first'}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            editable={hasLecture && !isLoading}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || isLoading || !hasLecture}
            style={[styles.sendBtn, (!input.trim() || isLoading || !hasLecture) && styles.sendBtnDisabled]}
            accessibilityLabel="Send"
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  fabPressed: { opacity: 0.9 },
  fabText: { color: colors.white, fontSize: 13, fontWeight: '700' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  sheet: {
    flexDirection: 'column',
    minHeight: 380,
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
  },
  headerBrand: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: colors.white, fontSize: 16, fontWeight: '800' },
  headerSubtitle: { color: '#FFEDD5', fontSize: 12, marginTop: 2 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginHorizontal: 16,
    marginTop: 10,
  },
  contextText: { flex: 1, fontSize: 12, color: colors.primaryDark, fontWeight: '600' },
  body: { flexGrow: 1 },
  bodyContent: { paddingHorizontal: 16, paddingVertical: 10 },
  welcome: { alignItems: 'flex-start', paddingTop: 12 },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 10 },
  welcomeText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginTop: 6 },
  lectureHint: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
  },
  lectureHintText: { fontSize: 12, color: '#B45309', lineHeight: 18 },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiMini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingText: { fontSize: 12, color: colors.textSecondary },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 96,
    borderRadius: radius.lg,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingTop: 10,
    color: colors.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendBtnDisabled: { opacity: 0.4 },
});