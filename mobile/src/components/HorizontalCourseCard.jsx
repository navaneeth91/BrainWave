import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../constants/theme';
import { averageRating, courseDuration, lectureCount } from '../utils/format';
import RatingStars from './RatingStars';

/**
 * Compact course card for horizontal scrolling rails (popular / recommended).
 */
function HorizontalCourseCard({ course, onPress, width = 220 }) {
  if (!course) return null;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}>
      <Image
        source={{ uri: course.courseThumbnail }}
        style={styles.thumb}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {course.courseTitle}
        </Text>
        <Text style={styles.instructor} numberOfLines={1}>
          {course.educator && typeof course.educator === 'object' ? course.educator.name || 'Instructor' : 'Instructor'}
        </Text>
        <RatingStars rating={averageRating(course)} />
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>{courseDuration(course)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="play-circle-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>{lectureCount(course)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pressed: { opacity: 0.92 },
  thumb: { width: '100%', height: 110 },
  body: { padding: 12 },
  title: { fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 19 },
  instructor: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: colors.textSecondary },
});

export default memo(HorizontalCourseCard);