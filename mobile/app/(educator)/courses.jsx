import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getEducatorCourses, getErrorMessage, CURRENCY_SYMBOL } from '../../src/services/api';
import { colors, radius, typography } from '../../src/constants/theme';
import ErrorState from '../../src/components/ErrorState';
import EmptyState from '../../src/components/EmptyState';
import { formatPrice } from '../../src/utils/format';

export default function EducatorCoursesScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await getEducatorCourses();
      setCourses(list || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setCourses([]);
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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={typography.h2}>My Courses</Text>
            <Text style={styles.subtitle}>Courses created under your educator account.</Text>
            {error ? <ErrorState message={error} onRetry={load} /> : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="book-outline"
              title="No courses created yet"
              subtitle="Course creation is only available where supported by the existing backend APIs."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/(educator)/manage-exam?courseId=${item._id}`)}>
            <Image source={{ uri: item.courseThumbnail }} style={styles.thumb} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={2}>{item.courseTitle}</Text>
              <Text style={styles.meta}>{item.enrolledStudents?.length || 0} students enrolled</Text>
              <Text style={styles.meta}>{item.isPublished ? 'Published' : 'Unpublished'}</Text>
              <Text style={styles.price}>{formatPrice(CURRENCY_SYMBOL, item)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 24, flexGrow: 1 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    marginBottom: 12,
  },
  thumb: { width: 88, height: 72, borderRadius: radius.md, backgroundColor: colors.skeleton },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  price: { fontSize: 14, fontWeight: '800', color: colors.primaryDark, marginTop: 4 },
});