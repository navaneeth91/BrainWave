import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../constants/theme';
import { averageRating, courseDuration, formatCount, formatPrice, lectureCount, progressPercent } from '../utils/format';
import { CURRENCY_SYMBOL } from '../services/api';
import RatingStars from './RatingStars';
import ProgressBar from './ProgressBar';

/**
 * Vertical course card used in the course list and continue-learning rows.
 */
function CourseCard({
  course,
  onPress,
  enrolled = false,
  completedCount = 0,
  totalCount = 0,
  compact = false,
}) {
  if (!course) return null;
  const instructorName =
    course.educator && typeof course.educator === 'object' ? course.educator.name || 'Instructor' : 'Instructor';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        source={{ uri: course.courseThumbnail }}
        style={[styles.thumb, compact && styles.thumbCompact]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={[styles.body]}>
        <View style={styles.catRow}>
          <Text style={styles.price}>{formatPrice(CURRENCY_SYMBOL, course)}</Text>
          {enrolled ? (
            <View style={styles.enrolledBadge}>
              <Ionicons name="checkmark-circle" size={13} color={colors.success} />
              <Text style={styles.enrolledText}>Enrolled</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {course.courseTitle}
        </Text>

        <Text style={styles.instructor} numberOfLines={1}>
          {instructorName}
        </Text>

        <RatingStars rating={averageRating(course)} showValue />

        <View style={styles.metaRow}>
          <Meta icon="time-outline" text={courseDuration(course)} />
          <Meta icon="play-circle-outline" text={`${lectureCount(course)} lectures`} />
          <Meta icon="people-outline" text={formatCount(course.enrolledStudents?.length || 0)} />
        </View>

        {enrolled ? (
          <View style={{ marginTop: 8 }}>
            <ProgressBar percent={progressPercent(completedCount, totalCount)} showLabel />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function Meta({ icon, text }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={colors.textSecondary} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  thumb: { width: '100%', height: 168 },
  thumbCompact: { height: 132 },
  body: { padding: 14 },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  price: { fontSize: 16, fontWeight: '800', color: colors.primaryDark },
  enrolledBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  enrolledText: { fontSize: 12, fontWeight: '600', color: colors.success },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, lineHeight: 20, marginTop: 2 },
  instructor: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textSecondary },
});

export default memo(CourseCard);