import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RequireAuth from '../../src/components/RequireAuth';
import Screen from '../../src/components/Screen';
import ScreenHeader from '../../src/components/ScreenHeader';
import Button from '../../src/components/Button';
import ErrorState from '../../src/components/ErrorState';
import { getExamAttemptResult, generateCertificate, getErrorMessage } from '../../src/services/api';
import { colors, radius, typography } from '../../src/constants/theme';

export default function ExamResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getExamAttemptResult(String(id));
      setResult(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onCertificate = async () => {
    if (!result?.courseId) return;
    setGenerating(true);
    try {
      await generateCertificate(result.courseId);
      Alert.alert('Certificate ready', 'Your certificate has been generated.', [
        { text: 'OK', onPress: () => router.push('/certificates') },
      ]);
    } catch (err) {
      Alert.alert('Certificate unavailable', getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Result" onBack={() => router.back()} />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Loading your result…</Text>
      </Screen>
    );
  }

  if (error || !result) {
    return (
      <Screen>
        <ScreenHeader title="Result" onBack={() => router.back()} />
        <ErrorState message={error || 'Result not found'} />
      </Screen>
    );
  }

  const correct = result.score || 0;
  const incorrect = Math.max(0, (result.totalMarks || 0) - correct);
  const percent = Math.round(result.percentage ?? 0);
  const passed = !!result.passed;

  return (
    <RequireAuth>
      <Screen>
        <ScreenHeader title="Exam Result" onBack={() => router.back()} />

        <View style={[styles.scoreCard, passed ? styles.cardPass : styles.cardFail]}>
          <Ionicons name={passed ? 'trophy' : 'alert-circle'} size={48} color={passed ? colors.success : colors.danger} />
          <Text style={styles.bigPercent}>{percent}%</Text>
          <Text style={[styles.statusLabel, { color: passed ? colors.success : colors.danger }]}>
            {passed ? 'Congratulations! You passed!' : 'Not passed this time'}
          </Text>
          <Text style={styles.examTitle}>{result.examTitle || 'Exam'}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="Your Score" value={`${correct} / ${result.totalMarks || 0}`} />
          <StatBox label="Correct" value={`${correct}`} good />
          <StatBox label="Incorrect" value={`${incorrect}`} bad />
        </View>

        <View style={styles.infoCard}>
          <Row label="Percentage" value={`${percent}%`} />
          <Row label="Passing Score" value={`${result.passingScore}%`} />
          <Row label="Result" value={passed ? 'Passed' : 'Failed'} />
        </View>

        {passed ? (
          <Button
            title="Get Certificate"
            loading={generating}
            onPress={onCertificate}
            icon={<Ionicons name="ribbon" size={18} color={colors.white} />}
            style={{ marginTop: 16 }}
          />
        ) : null}

        <Button
          title="Retry Exam"
          variant="outline"
          onPress={() => result.examId && router.replace(`/exam/${result.examId}`)}
          style={{ marginTop: 10 }}
        />
      </Screen>
    </RequireAuth>
  );
}

function StatBox({ label, value, good, bad }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, good && { color: colors.success }, bad && { color: colors.danger }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreCard: { alignItems: 'center', borderRadius: radius.xl, padding: 28, marginBottom: 20, borderWidth: 1 },
  cardPass: { backgroundColor: colors.successSoft, borderColor: '#BBF7D0' },
  cardFail: { backgroundColor: colors.dangerSoft, borderColor: '#FECACA' },
  bigPercent: { fontSize: 44, fontWeight: '900', color: colors.text, marginTop: 8 },
  statusLabel: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  examTitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center', paddingVertical: 16 },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  infoCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderLight, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowValue: { fontSize: 14, fontWeight: '700', color: colors.text },
});