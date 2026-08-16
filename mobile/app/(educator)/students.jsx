import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { getEnrolledStudentsData, getErrorMessage } from '../../src/services/api';
import { colors, radius, typography } from '../../src/constants/theme';
import ErrorState from '../../src/components/ErrorState';
import EmptyState from '../../src/components/EmptyState';

export default function EducatorStudentsScreen() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await getEnrolledStudentsData();
      setStudents(list || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setStudents([]);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((item) => {
      const studentName = item.student?.name?.toLowerCase() || '';
      const courseTitle = item.courseTitle?.toLowerCase() || '';
      return studentName.includes(q) || courseTitle.includes(q);
    });
  }, [students, query]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => `${item.student?._id || item.student?.name || 'student'}-${index}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={typography.h2}>Students</Text>
            <Text style={styles.subtitle}>View enrollments across your educator courses.</Text>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by student or course"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
            </View>
            {error ? <ErrorState message={error} onRetry={load} /> : null}
          </View>
        }
        ListEmptyComponent={!loading ? <EmptyState icon="people-outline" title="No enrolled students" subtitle="Student enrollments will appear here once learners purchase your courses." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.student?.imageUrl ? (
              <Image source={{ uri: item.student.imageUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={18} color={colors.primaryDark} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.student?.name || 'Student'}</Text>
              <Text style={styles.meta}>{item.courseTitle}</Text>
              <Text style={styles.meta}>Enrolled {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : ''}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.skeleton },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  name: { fontSize: 14, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});