import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import RequireAuth from '../../src/components/RequireAuth';
import Screen from '../../src/components/Screen';
import ScreenHeader from '../../src/components/ScreenHeader';
import Button from '../../src/components/Button';
import RatingStars from '../../src/components/RatingStars';
import ErrorState from '../../src/components/ErrorState';
import { useApp } from '../../src/context/AppContext';
import { getCourseById, purchaseCourse, getCourseProgress, getEnrolledCourses, getErrorMessage, FREE_COURSES_MODE } from '../../src/services/api';
import { averageRating, courseDuration, formatCount, formatPrice, lectureCount, progressPercent } from '../../src/utils/format';
import { CURRENCY_SYMBOL } from '../../src/services/api';
import { colors, radius, typography } from '../../src/constants/theme';

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { enrolledCourses, fetchEnrolledCourses } = useApp();

  const [course, setCourse] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  const enrolled = (enrolledCourses || []).some((c) => c._id === id);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { courseData, exam: examData } = await getCourseById(id);
      setCourse(courseData);
      setExam(examData);
      try {
        const prog = await getCourseProgress(id);
        setProgress(prog);
      } catch (e) {
        setProgress(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      const sessionUrl = await purchaseCourse(course._id);
      await fetchEnrolledCourses();
      let nowEnrolled = false;
      try {
        nowEnrolled = (await getEnrolledCourses()).some((c) => c._id === String(id));
      } catch (e) {
        nowEnrolled = false;
      }
      if (nowEnrolled || FREE_COURSES_MODE) {
        router.replace(`/learning/${course._id}`);
      } else if (sessionUrl) {
        await WebBrowser.openBrowserAsync(sessionUrl);
      } else {
        Alert.alert('Almost there', 'Enrollment will be confirmed after payment.');
      }
    } catch (err) {
      Alert.alert('Enrollment failed', getErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Course" onBack={() => router.back()} />
        <Image source={{ uri: '' }} style={{ width: '100%', height: 180, borderRadius: radius.lg, backgroundColor: colors.skeleton }} />
        <View style={{ marginTop: 16 }}><View style={styles.skelLine} /><View style={[styles.skelLine, { width: '60%' }]} /></View>
      </Screen>
    );
  }

  if (error || !course) {
    return (
      <Screen>
        <ScreenHeader title="Course" onBack={() => router.back()} />
        <ErrorState message={error || 'Course not found'} onRetry={load} />
      </Screen>
    );
  }

  const totalLectures = lectureCount(course);
  const instructorName = course.educator && typeof course.educator === 'object' ? course.educator.name || 'Instructor' : 'Instructor';
  const percent = progressPercent(progress?.completedLectures ?? 0, progress?.totalLectures ?? totalLectures);

  return (
    <RequireAuth>
      <Screen contentContainerStyle={{ paddingBottom: 96 }}>
        <ScreenHeader title="Course Details" onBack={() => router.back()} />
        <Image source={{ uri: course.courseThumbnail }} style={styles.hero} contentFit="cover" transition={200} cachePolicy="memory-disk" />

        <Text style={styles.title}>{course.courseTitle}</Text>
        <Text style={styles.instructor}>by {instructorName}</Text>

        <View style={styles.infoRow}>
          <RatingStars rating={averageRating(course)} showValue />
          <Text style={styles.dot}>·</Text>
          <InfoChip icon="people-outline" text={`${formatCount(course.enrolledStudents?.length || 0)} students`} />
        </View>
        <View style={styles.metaRow}>
          <InfoChip icon="time-outline" text={courseDuration(course)} />
          <InfoChip icon="play-circle-outline" text={`${totalLectures} lectures`} />
        </View>
        <View style={styles.chipRow}>
          <Text style={styles.priceTag}>{formatPrice(CURRENCY_SYMBOL, course)}</Text>
        </View>

        <Text style={[typography.h3, styles.sectionTitle]}>Description</Text>
        <Text style={styles.description}>{course.courseDescription || 'No description provided.'}</Text>

        <Text style={[typography.h3, styles.sectionTitle]}>Course Content</Text>
        {(course.courseContent || []).map((chapter, ci) => (
          <ChapterBlock key={chapter.chapterId || ci} chapter={chapter} chapterNumber={ci + 1} />
        ))}

        <View style={{ height: 20 }} />
      </Screen>
      <View style={[styles.sticky, { paddingBottom: 12 + insets.bottom }]}>
        {enrolled ? (
          <>
            <View style={{ flex: 1 }}>
              <Text style={styles.enrolledLabel}>{percent}% complete</Text>
            </View>
            <Button
              title="Continue Learning"
              onPress={() => router.push(`/learning/${course._id}`)}
              icon={<Ionicons name="play" size={18} color={colors.white} />}
              style={{ flex: 2 }}
            />
          </>
        ) : (
          <Button title="Enroll in this Course" loading={enrolling} onPress={onEnroll} style={{ flex: 1 }} />
        )}
      </View>
    </RequireAuth>
  );
}

function InfoChip({ icon, text }) {
  return (
    <View style={styles.infoChip}>
      <Ionicons name={icon} size={13} color={colors.textSecondary} />
      <Text style={styles.infoChipText}>{text}</Text>
    </View>
  );
}

function ChapterBlock({ chapter, chapterNumber }) {
  const [open, setOpen] = useState(false);
  const lectures = chapter.chapterContent || [];
  return (
    <View style={styles.chapter}>
      <Pressable style={styles.chapterHeader} onPress={() => setOpen((o) => !o)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.chapterTitle}>
            Chapter {chapterNumber}: {chapter.chapterTitle}
          </Text>
          <Text style={styles.chapterMeta}>{lectures.length} lecture{lectures.length === 1 ? '' : 's'}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </Pressable>
      {open
        ? lectures.map((lecture, li) => (
            <View key={lecture.lectureId || `${lecture.lectureOrder}-${li}`} style={styles.lectureRow}>
              <Ionicons name="play-circle-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.lectureText} numberOfLines={1}>
                {lecture.lectureTitle}
              </Text>
              <Text style={styles.lectureDur}>{Math.round(lecture.lectureDuration)}m</Text>
            </View>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 180, borderRadius: radius.lg },
  title: { fontSize: 21, fontWeight: '800', color: colors.text, marginTop: 14, lineHeight: 27 },
  instructor: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  dot: { color: colors.textMuted },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipRow: { marginTop: 12 },
  priceTag: { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  sectionTitle: { marginTop: 22, marginBottom: 8 },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  chapter: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight, marginBottom: 10, overflow: 'hidden' },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  chapterTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  chapterMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  lectureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  lectureText: { flex: 1, fontSize: 13, color: colors.text },
  lectureDur: { fontSize: 12, color: colors.textMuted },
  sticky: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  enrolledLabel: { fontSize: 14, fontWeight: '700', color: colors.success },
  skelLine: { height: 16, borderRadius: 6, backgroundColor: colors.skeleton, marginBottom: 8 },
});