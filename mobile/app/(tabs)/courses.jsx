import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Screen from '../../src/components/Screen';
import SearchBar from '../../src/components/SearchBar';
import CourseCard from '../../src/components/CourseCard';
import CourseSkeleton from '../../src/components/CourseSkeleton';
import EmptyState from '../../src/components/EmptyState';
import ErrorState from '../../src/components/ErrorState';
import { useApp } from '../../src/context/AppContext';
import { colors, typography } from '../../src/constants/theme';

export default function CoursesScreen() {
  const router = useRouter();
  const { allCourses, coursesLoading, coursesError, fetchAllCourses, enrolledCourses } = useApp();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const enrolledIds = useMemo(() => new Set((enrolledCourses || []).map((c) => c._id)), [enrolledCourses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCourses;
    return allCourses.filter(
      (c) =>
        c.courseTitle?.toLowerCase().includes(q) ||
        (c.educator && typeof c.educator === 'object' && c.educator.name?.toLowerCase().includes(q))
    );
  }, [query, allCourses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllCourses();
    setRefreshing(false);
  };

  if (coursesLoading && allCourses.length === 0) {
    return (
      <Screen>
        <Text style={typography.h2}>Courses</Text>
        <View style={{ marginTop: 8 }}>
          <CourseSkeleton count={5} />
        </View>
      </Screen>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen scroll={false} padded={false}>
        <View style={styles.header}>
          <Text style={typography.h2}>Courses</Text>
          <Text style={styles.subtitle}>Browse all courses</Text>
          <SearchBar value={query} onChangeText={setQuery} style={{ marginTop: 12 }} />
        </View>

        {coursesError && !coursesLoading ? (
          <View style={styles.flex}>
            <ErrorState message={coursesError} onRetry={fetchAllCourses} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CourseCard
                course={item}
                enrolled={enrolledIds.has(item._id)}
                onPress={() => router.push(`/course/${item._id}`)}
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 32,
              flexGrow: 1,
            }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
            ListEmptyComponent={
              <EmptyState
                icon="search-outline"
                title={query ? 'No courses found' : 'No courses available'}
                subtitle={query ? 'Try a different search term.' : 'Check back soon for new courses.'}
              />
            }
          />
        )}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  flex: { flex: 1 },
});