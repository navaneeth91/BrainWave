import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RequireAuth from '../../src/components/RequireAuth';
import Screen from '../../src/components/Screen';
import ScreenHeader from '../../src/components/ScreenHeader';
import Button from '../../src/components/Button';
import ErrorState from '../../src/components/ErrorState';
import { startExam, getExamForStudent, submitExam, getErrorMessage } from '../../src/services/api';
import { colors, radius, typography } from '../../src/constants/theme';

export default function ExamScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const attemptRef = useRef(attempt);
  attemptRef.current = attempt;
  const submittedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const attemptData = await startExam(String(id));
      setAttempt(attemptData);
      const data = await getExamForStudent(String(id));
      setExam(data.exam);
      setQuestions(data.questions || []);

      // Server-based timer (same as the web client).
      if (data.exam?.timeLimit && attemptData?.startedAt) {
        const startedAt = new Date(attemptData.startedAt).getTime();
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const total = Number(data.exam.timeLimit) * 60;
        setTimeLeft(Math.max(0, total - elapsed));
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setError('This exam is not available yet. Complete the course first.');
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Countdown timer + auto-submit on timeout.
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      if (!submittedRef.current) onSubmit(true);
      return;
    }
    const t = setInterval(() => setTimeLeft((v) => (v === null ? 0 : Math.max(0, v - 1))), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const onSubmit = async (timedOut = false) => {
    if (submittedRef.current) return;
    const attemptId = attemptRef.current?.attemptId;
    const att = answersRef.current;
    if (!attemptId) {
      Alert.alert('Error', 'Exam attempt not found');
      return;
    }
    if (!timedOut) {
      const unanswered = questions.length - Object.keys(att).length;
      if (unanswered > 0) {
        Alert.alert(
          'Submit exam?',
          `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`,
          [
            { text: 'Keep Working', style: 'cancel' },
            { text: 'Submit', style: 'destructive', onPress: () => doSubmit(attemptId, att) },
          ]
        );
        return;
      }
    }
    doSubmit(attemptId, att);
  };

  const doSubmit = async (attemptId, att) => {
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const formatted = Object.entries(att).map(([qid, selectedOption]) => ({ questionId: qid, selectedOption }));
      const data = await submitExam(String(id), attemptId, formatted);
      if (data.result?.attemptId) {
        router.replace(`/exam-result/${data.result.attemptId}`);
      } else {
        router.back();
      }
    } catch (err) {
      submittedRef.current = false;
      setSubmitting(false);
      Alert.alert('Submission failed', getErrorMessage(err));
    }
  };

  const formatTime = (s) => {
    if (s === null || s === undefined) return '--:--';
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  const pick = (qid, idx) => setAnswers((p) => ({ ...p, [qid]: idx }));

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Exam" onBack={() => router.back()} />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Preparing your exam…</Text>
      </Screen>
    );
  }

  if (error || !exam) {
    return (
      <Screen>
        <ScreenHeader title="Exam" onBack={() => router.back()} />
        <ErrorState message={error || 'Unable to load exam'} />
      </Screen>
    );
  }

  const q = questions[current];
  const answered = Object.keys(answers).length;

  return (
    <RequireAuth>
      <Screen contentContainerStyle={{ paddingBottom: 40 }}>
        <ScreenHeader
          title={exam.title || 'Exam'}
          onBack={() => router.back()}
          right={
            <View style={styles.timer}>
              <Ionicons name="time-outline" size={15} color={timeLeft <= 60 ? colors.danger : colors.primaryDark} />
              <Text style={[styles.timerText, timeLeft <= 60 && { color: colors.danger }]}>{formatTime(timeLeft)}</Text>
            </View>
          }
        />

        {exam.description ? <Text style={styles.desc}>{exam.description}</Text> : null}

        <Text style={styles.qCounter}>
          Question {current + 1} of {questions.length}
        </Text>

        {q ? (
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{q.questionText}</Text>

            {(q.options || []).map((option, idx) => {
              const selected = answers[q._id] === idx;
              return (
                <Pressable
                  key={`${q._id}-${idx}`}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => pick(q._id, idx)}
                >
                  <View style={[styles.optionLetter, selected && styles.optionLetterSelected]}>
                    <Text style={[styles.optionLetterText, selected && { color: colors.white }]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.primaryDark} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.navRow}>
          <Button title="Previous" variant="outline" disabled={current === 0} onPress={() => setCurrent((c) => Math.max(0, c - 1))} style={{ flex: 1 }} />
          {current < questions.length - 1 ? (
            <Button title="Next" onPress={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))} style={{ flex: 1 }} />
          ) : (
            <Button title="Submit Exam" variant="danger" loading={submitting} onPress={() => onSubmit(false)} style={{ flex: 1 }} />
          )}
        </View>

        <Text style={styles.answered}>
          Answered {answered} of {questions.length} questions
        </Text>
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  timerText: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  desc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 12 },
  qCounter: { fontSize: 13, fontWeight: '700', color: colors.primaryDark, textTransform: 'uppercase', marginBottom: 10 },
  questionCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderLight, padding: 16 },
  questionText: { fontSize: 17, fontWeight: '700', color: colors.text, lineHeight: 24, marginBottom: 16 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 10 },
  optionSelected: { borderColor: colors.primaryDark, backgroundColor: '#FFF7ED' },
  optionLetter: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEF2F6', alignItems: 'center', justifyContent: 'center' },
  optionLetterSelected: { backgroundColor: colors.primaryDark },
  optionLetterText: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  optionText: { flex: 1, fontSize: 15, color: colors.text },
  optionTextSelected: { color: colors.primaryDark, fontWeight: '600' },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  answered: { textAlign: 'center', color: colors.textSecondary, fontSize: 13, marginTop: 16 },
});