import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import RequireAuth from '../../src/components/RequireAuth';
import Screen from '../../src/components/Screen';
import Button from '../../src/components/Button';
import EmptyState from '../../src/components/EmptyState';
import ErrorState from '../../src/components/ErrorState';
import { getUserCertificates, getErrorMessage } from '../../src/services/api';
import { formatDate } from '../../src/utils/format';
import { colors, radius, typography } from '../../src/constants/theme';

export default function CertificatesScreen() {
  const router = useRouter();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getUserCertificates();
      setCertificates(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <RequireAuth>
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.background }}>
        <Screen scroll={false} padded={false}>
          <View style={styles.header}>
            <Ionicons name="chevron-back" size={24} color={colors.text} onPress={() => router.back()} />
            <Text style={[typography.h2, { marginLeft: 8 }]}>My Certificates</Text>
          </View>

          {loading && certificates.length === 0 ? (
            <Text style={styles.loading}>Loading certificates…</Text>
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : (
            <FlatList
              data={certificates}
              keyExtractor={(item) => item.certificateId}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, flexGrow: 1 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
              ListEmptyComponent={
                <EmptyState
                  icon="ribbon-outline"
                  title="No certificates yet"
                  subtitle="Complete a course and pass its final exam to earn a certificate."
                  action={<Button title="Browse Courses" onPress={() => router.push('/(tabs)/courses')} style={{ marginTop: 12, minWidth: 180 }} />}
                />
              }
              renderItem={({ item }) => (
                <CertificateCard certificate={item} onPress={() => router.push(`/certificates/${item.certificateId}`)} />
              )}
            />
          )}
        </Screen>
      </SafeAreaView>
    </RequireAuth>
  );
}

function CertificateCard({ certificate, onPress }) {
  const course = certificate.courseId || {};
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: course.courseThumbnail }} style={styles.thumb} contentFit="cover" transition={150} cachePolicy="memory-disk" />
      <View style={{ flex: 1 }}>
        <Text style={styles.courseTitle} numberOfLines={2}>{certificate.courseTitle || course.courseTitle}</Text>
        <Text style={styles.meta}>{certificate.certificateId}</Text>
        <Text style={styles.meta}>Issued {formatDate(certificate.issuedAt)}</Text>
        <Text style={[styles.meta, { color: colors.primaryDark }]}>View certificate →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  loading: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
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
  thumb: { width: 72, height: 72, borderRadius: radius.md },
  courseTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
});