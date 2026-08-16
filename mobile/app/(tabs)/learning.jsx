import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Screen from '../../src/components/Screen';
import Button from '../../src/components/Button';
import ProgressBar from '../../src/components/ProgressBar';
import CourseSkeleton from '../../src/components/CourseSkeleton';
import EmptyState from '../../src/components/EmptyState';
import { useApp } from '../../src/context/AppContext';
import useProgressMap from '../../src/hooks/useProgressMap';
import { colors, radius, typography } from '../../src/constants/theme';
import { lectureCount, progressPercent } from '../../src/utils/format';

export default function LearningScreen() {
  const router = useRouter();
  const { enrolledCourses, enrolledLoading, pullToRefresh } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const { progressMap, reload } = useProgressMap(enrolledCourses);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await pullToRefresh();
    await reload();
    setRefreshing(false);
  }, [pullToRefresh, reload]);

  if (enrolledLoading && enrolledCourses.length === 0) {
    return (
      <Screen>
        <Text style={typography.h2}>My Learning</Text>
        <View style={{ marginTop: 12 }}>
          <CourseSkeleton count={4} />
        </View>
      </Screen>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen scroll={false} padded={false}>
        <View style={styles.header}>
          <Text style={typography.h2}>My Learning</Text>
          <Text style={styles.subtitle}>{enrolledCourses.length} course{enrolledCourses.length === 1 ? '' : 's'} enrolled</Text>
        </View>

        <FlatList
          data={enrolledCourses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
          ListEmptyComponent={
            <EmptyState
              icon="school-outline"
              title="You haven't enrolled in any courses yet"
              subtitle="Explore the course catalog and start learning today."
              action={
                <Button title="Browse Courses" onPress={() => router.push('/(tabs)/courses')} style={{ marginTop: 12, minWidth: 180 }} />
              }
            />
          }
          renderItem={({ item }) => (
            <EnrolledCourseCard course={item} progress={progressMap[item._id]} onPress={() => router.push(`/learning/${item._id}`)} />
          )}
        />
      </Screen>
    </SafeAreaView>
  );
}

function EnrolledCourseCard({ course, progress, onPress }) {
  const total = lectureCount(course);
  const completed = progress?.completedLectures ?? 0;
  const remaining = Math.max(0, total - completed);
  const percent = progressPercent(completed, total);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={{ uri: course.courseThumbnail }} style={styles.thumb} contentFit="cover" transition={150} cachePolicy="memory-disk" />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {course.courseTitle}
          </Text>
          <Text style={styles.progressText}>
            {completed} of {total} lectures completed
          </Text>
          <ProgressBar percent={percent} showLabel />
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.remainingText}>{remaining > 0 ? `${remaining} lecture${remaining > 1 ? 's' : ''} remaining` : 'Course completed 🎉'}</Text>
        <Pressable style={styles.continue} onPress={onPress}>
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="play" size={14} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 12 },
  thumb: { width: 88, height: 80, borderRadius: radius.md },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  progressText: { fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  remainingText: { fontSize: 12, color: colors.textSecondary },
  continue: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill },
  continueText: { color: colors.white, fontSize: 13, fontWeight: '700' },
});