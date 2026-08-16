import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import SearchBar from '../../src/components/SearchBar';
import CourseCard from '../../src/components/CourseCard';
import HorizontalCourseCard from '../../src/components/HorizontalCourseCard';
import EmptyState from '../../src/components/EmptyState';
import { useApp } from '../../src/context/AppContext';
import useProgressMap from '../../src/hooks/useProgressMap';
import { colors, typography } from '../../src/constants/theme';
import { lectureCount } from '../../src/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const { user, userData, allCourses, coursesLoading, enrolledCourses } = useApp();
  const [query, setQuery] = useState('');

  const { progressMap } = useProgressMap(enrolledCourses);

  const firstName = user?.firstName || userData?.name?.split(' ')[0] || 'there';

  const popular = useMemo(
    () =>
      [...allCourses]
        .sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0))
        .slice(0, 8),
    [allCourses]
  );

  const recommended = useMemo(
    () => [...allCourses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    [allCourses]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allCourses.filter(
      (c) =>
        c.courseTitle?.toLowerCase().includes(q) ||
        (c.educator && typeof c.educator === 'object' && c.educator.name?.toLowerCase().includes(q))
    );
  }, [query, allCourses]);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>What would you like to learn today?</Text>
        </View>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} contentFit="contain" />
      </View>

      <SearchBar value={query} onChangeText={setQuery} style={{ marginBottom: 16 }} />

      {query.trim() ? (
        <View style={{ marginBottom: 8 }}>
          <Text style={[typography.h2, { marginBottom: 12 }]}>
            {results.length} result{results.length === 1 ? '' : 's'}
          </Text>
          {results.length === 0 ? (
            <EmptyState icon="search-outline" title="No courses found" subtitle="Try a different search term." />
          ) : (
            results.map((c) => (
              <CourseCard key={c._id} course={c} onPress={() => router.push(`/course/${c._id}`)} />
            ))
          )}
        </View>
      ) : (
        <>
          {enrolledCourses.length > 0 ? (
            <SectionTitle title="Continue Learning" action="/(tabs)/learning" actionLabel="View all" />
          ) : null}
          {enrolledCourses.map((course) => {
            const p = progressMap[course._id] || { completedLectures: 0, totalLectures: lectureCount(course) };
            return (
              <CourseCard
                key={course._id}
                course={course}
                enrolled
                completedCount={p.completedLectures || 0}
                totalCount={p.totalLectures || lectureCount(course)}
                onPress={() => router.push(`/learning/${course._id}`)}
              />
            );
          })}

          {coursesLoading ? (
            <Text style={styles.loadingText}>Loading courses…</Text>
          ) : allCourses.length > 0 ? (
            <>
              <SectionTitle title="Popular Courses" />
              <FlatList
                horizontal
                data={popular}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <HorizontalCourseCard course={item} onPress={() => router.push(`/course/${item._id}`)} />
                )}
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 24 }}
              />

              <SectionTitle title="Recommended for You" />
              <FlatList
                horizontal
                data={recommended}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <HorizontalCourseCard course={item} onPress={() => router.push(`/course/${item._id}`)} />
                )}
                showsHorizontalScrollIndicator={false}
              />
            </>
          ) : (
            <EmptyState
              icon="book-outline"
              title="No courses yet"
              subtitle="Check back later for new courses from our educators."
            />
          )}
        </>
      )}

<View style={styles.footerNote}>
        <Ionicons name="sparkles" size={14} color={colors.primary} />
        <Text style={styles.footerNoteText}>BrainWave — learn anything, anywhere.</Text>
      </View>
    </Screen>
  );
}
      function SectionTitle({ title, action, actionLabel }) {
  const router = useRouter();
  return (
    <View style={styles.sectionHeader}>
      <Text style={typography.h2}>{title}</Text>
      {action && actionLabel ? (
        <Text style={styles.sectionAction} onPress={() => router.push(action)}>
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.text },
  subGreeting: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  logo: { width: 44, height: 44 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionAction: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  loadingText: { color: colors.textSecondary, textAlign: 'center', paddingVertical: 40 },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 24,
  },
  footerNoteText: { fontSize: 12, color: colors.textMuted },
});