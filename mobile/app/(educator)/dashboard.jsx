import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getEducatorDashboardData, getErrorMessage, CURRENCY_SYMBOL } from '../../src/services/api';
import { colors, radius, typography } from '../../src/constants/theme';
import ErrorState from '../../src/components/ErrorState';
import Button from '../../src/components/Button';
import StatCard from '../../src/components/educator/StatCard';

export default function EducatorDashboardScreen() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getEducatorDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const totalCourses = dashboardData?.totalCourses || 0;
  const totalEarnings = dashboardData?.totalEarnings || 0;
  const enrolledStudentsData = dashboardData?.enrolledStudentsData || [];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        contentContainerStyle={styles.content}
      >
        <Text style={typography.h2}>Educator Dashboard</Text>
        <Text style={styles.subtitle}>Monitor your courses, students, and earnings.</Text>

        {error ? <ErrorState message={error} onRetry={load} /> : null}

        <View style={styles.statsRow}>
          <StatCard label="Courses" value={totalCourses} icon="book-outline" color={colors.primaryDark} loading={loading && !dashboardData} />
          <StatCard label="Students" value={enrolledStudentsData.length} icon="people-outline" color={colors.warning} loading={loading && !dashboardData} />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Earnings" value={`${CURRENCY_SYMBOL}${Number(totalEarnings).toLocaleString()}`} icon="wallet-outline" color={colors.success} loading={loading && !dashboardData} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Enrollments</Text>
          {enrolledStudentsData.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="school-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyText}>No student enrollments yet.</Text>
            </View>
          ) : (
            enrolledStudentsData.slice(0, 8).map((item, index) => (
              <View key={`${item.courseTitle}-${index}`} style={styles.studentCard}>
                <View style={styles.studentIcon}><Ionicons name="person" size={16} color={colors.primaryDark} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{item.student?.name || 'Student'}</Text>
                  <Text style={styles.studentCourse}>{item.courseTitle}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Button title="Refresh Dashboard" onPress={load} style={{ marginTop: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 28 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    marginBottom: 8,
  },
  studentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentName: { fontSize: 14, fontWeight: '700', color: colors.text },
  studentCourse: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});