import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RequireAuth from '../../src/components/RequireAuth';
import Screen from '../../src/components/Screen';
import ScreenHeader from '../../src/components/ScreenHeader';
import Button from '../../src/components/Button';
import ProgressBar from '../../src/components/ProgressBar';
import VideoPlayer from '../../src/components/VideoPlayer';
import ErrorState from '../../src/components/ErrorState';
import { useApp } from '../../src/context/AppContext';
import { getEnrolledCourses, getCourseProgress, updateCourseProgress, getCourseById, getExamByCourse, getErrorMessage } from '../../src/services/api';
import { flattenLectures, lectureCount, progressPercent } from '../../src/utils/format';
import { colors, radius, typography } from '../../src/constants/theme';

export default function LearningDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchEnrolledCourses } = useApp();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openChapters, setOpenChapters] = useState({});
  const [marking, setMarking] = useState(false);
  const [examData, setExamData] = useState(null);

  const lectures = useMemo(() => flattenLectures(course), [course]);
  const totalLectures = course ? lectureCount(course) : 0;
  const completed = progress?.completedLectures ?? 0;
  const percent = progressPercent(completed, totalLectures);
  const completedIds = useMemo(() => new Set(progress?.lectureCompleted || []), [progress]);

  const currentIndex = useMemo(() => {
    const idx = lectures.findIndex((l) => l.lectureId === currentId);
    return idx >= 0 ? idx : 0;
  }, [lectures, currentId]);

  const current = lectures[currentIndex];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let found = null;
      try {
        const list = await getEnrolledCourses();
        found = list.find((c) => c._id === String(id)) || null;
      } catch {
        found = null;
      }

      if (!found) {
        const { courseData } = await getCourseById(id);
        found = courseData;
      }

      setCourse(found);

      let prog = null;
      try {
        prog = await getCourseProgress(String(id));
      } catch {
        prog = null;
      }
      setProgress(prog);

      try {
        const exam = await getExamByCourse(String(id));
        setExamData(exam || null);
      } catch {
        setExamData(null);
      }

      const lectureList = flattenLectures(found);
      const firstIncomplete = lectureList.find((l) => !(prog?.lectureCompleted || []).includes(l.lectureId));
      setCurrentId(firstIncomplete?.lectureId || lectureList[0]?.lectureId || null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onMarkComplete = async () => {
    if (!course || !current) return;
    setMarking(true);
    try {
      await updateCourseProgress(course._id, current.lectureId);
      const prog = await getCourseProgress(course._id);
      setProgress(prog);
      await fetchEnrolledCourses();
    } catch (err) {
      Alert.alert('Could not update progress', getErrorMessage(err));
    } finally {
      setMarking(false);
    }
  };

  const goPrev = () => currentIndex > 0 && setCurrentId(lectures[currentIndex - 1].lectureId);
  const goNext = () => currentIndex < lectures.length - 1 && setCurrentId(lectures[currentIndex + 1].lectureId);

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Learning" onBack={() => router.back()} />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Loading your course…</Text>
      </Screen>
    );
  }

  if (error || !course) {
    return (
      <Screen>
        <ScreenHeader title="Learning" onBack={() => router.back()} />
        <ErrorState message={error || 'Course not found'} onRetry={load} />
      </Screen>
    );
  }

  return (
    <RequireAuth>
      <Screen>
        <ScreenHeader title={course.courseTitle || 'Learning'} onBack={() => router.back()} />

        <View style={styles.progressWrap}>
          <ProgressBar percent={percent} showLabel />
          <Text style={styles.progressText}>{completed} of {totalLectures} lectures completed</Text>
        </View>

        <View style={styles.currentCard}>
          <Text style={styles.lectureNum}>Now playing</Text>
          <Text style={styles.lectureTitle}>{current?.lectureTitle || 'No lecture selected'}</Text>
          {current?.lectureUrl ? <VideoPlayer lectureUrl={current.lectureUrl} style={{ marginTop: 12 }} /> : <Text style={styles.noVideo}>This lecture video is unavailable.</Text>}
          <View style={styles.navRow}>
            <Button title="Previous" variant="outline" disabled={currentIndex === 0} onPress={goPrev} style={{ flex: 1 }} />
            <Button title={completedIds.has(current?.lectureId) ? 'Completed' : 'Mark Complete'} loading={marking} disabled={!current || completedIds.has(current?.lectureId)} onPress={onMarkComplete} style={{ flex: 1 }} />
            <Button title="Next" disabled={currentIndex >= lectures.length - 1} onPress={goNext} style={{ flex: 1 }} />
          </View>
        </View>

        <Text style={[typography.h3, styles.sectionTitle]}>Course Content</Text>
        {(course.courseContent || []).map((chapter, chapterIndex) => {
          const isOpen = !!openChapters[chapter.chapterId || chapterIndex];
          return (
            <View key={chapter.chapterId || chapterIndex} style={styles.chapter}>
              <Pressable
                style={styles.chapterHeader}
                onPress={() => setOpenChapters((prev) => ({ ...prev, [chapter.chapterId || chapterIndex]: !isOpen }))}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.chapterTitle}>{chapter.chapterTitle}</Text>
                  <Text style={styles.chapterMeta}>
                    {(chapter.chapterContent || []).length} lectures · {(chapter.chapterContent || []).filter((l) => completedIds.has(l.lectureId)).length} completed
                  </Text>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
              </Pressable>
              {isOpen
                ? (chapter.chapterContent || []).map((lecture, li) => {
                    const done = completedIds.has(lecture.lectureId);
                    const active = current?.lectureId === lecture.lectureId;
                    return (
                      <Pressable key={lecture.lectureId || li} style={[styles.lectureRow, active && styles.lectureActive]} onPress={() => setCurrentId(lecture.lectureId)}>
                        <Ionicons name={done ? 'checkmark-circle' : active ? 'play-circle' : 'play-circle-outline'} size={18} color={done ? colors.success : active ? colors.primary : colors.textSecondary} />
                        <Text style={[styles.lectureText, active && styles.lectureTextActive]} numberOfLines={1}>{lecture.lectureTitle}</Text>
                        <Text style={styles.lectureDur}>{Math.round(lecture.lectureDuration)}m</Text>
                      </Pressable>
                    );
                  })
                : null}
            </View>
          );
        })}

        {examData ? (
          <View style={styles.examCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="document-text-outline" size={20} color={colors.primaryDark} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Final Exam</Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 19 }} numberOfLines={2}>{examData.title}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <ExamChip label="Time limit" value={`${examData.timeLimit} min`} />
              <ExamChip label="Attempts" value={`${examData.maxAttempts}`} />
              <ExamChip label="Pass mark" value={`${examData.passingScore}%`} />
            </View>
            <Button title={progress?.completed ? 'Take Final Exam' : 'Complete Course to Unlock Exam'} disabled={!progress?.completed} onPress={() => router.push(`/exam/${examData._id}`)} style={{ marginTop: 14 }} />
          </View>
        ) : null}
      </Screen>
    </RequireAuth>
  );
}

function ExamChip({ label, value }) {
  return (
    <View style={styles.examChip}>
      <Text style={styles.examChipLabel}>{label}</Text>
      <Text style={styles.examChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginTop: 12 },
  progressText: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  currentCard: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 16, marginTop: 16 },
  lectureNum: { fontSize: 12, fontWeight: '700', color: colors.primaryDark, textTransform: 'uppercase' },
  lectureTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 4 },
  noVideo: { marginTop: 12, color: colors.textSecondary, fontSize: 14 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  sectionTitle: { marginTop: 24, marginBottom: 10 },
  chapter: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight, marginBottom: 10, overflow: 'hidden' },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  chapterTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  chapterMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  lectureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.borderLight },
  lectureActive: { backgroundColor: '#FFF7ED' },
  lectureText: { flex: 1, fontSize: 13, color: colors.text },
  lectureTextActive: { color: colors.primaryDark, fontWeight: '700' },
  lectureDur: { fontSize: 12, color: colors.textMuted },
  examCard: { marginTop: 20, backgroundColor: colors.infoSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: '#DBEAFE', padding: 16 },
  examChip: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 8, alignItems: 'center' },
  examChipLabel: { fontSize: 11, color: colors.textSecondary },
  examChipValue: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 2 },
});