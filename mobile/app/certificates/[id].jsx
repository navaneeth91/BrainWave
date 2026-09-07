import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RequireAuth from '../../src/components/RequireAuth';
import Screen from '../../src/components/Screen';
import ScreenHeader from '../../src/components/ScreenHeader';
import Button from '../../src/components/Button';
import ErrorState from '../../src/components/ErrorState';
import { getCertificateById, getErrorMessage } from '../../src/services/api';
import { formatDate } from '../../src/utils/format';
import { colors, radius } from '../../src/constants/theme';

export default function CertificateDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cert = await getCertificateById(String(id));
      setCertificate(cert);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onShare = async () => {
    if (!certificate) return;
    const text = [
      'BrainWave Certificate',
      `Course: ${certificate.courseTitle}`,
      `Student: ${certificate.studentName}`,
      `Certificate ID: ${certificate.certificateId}`,
      `Verification Code: ${certificate.verificationCode}`,
      `Issued: ${formatDate(certificate.issuedAt)}`,
      `Issued by: ${certificate.ceoName}`,
    ].join('\n');
    try {
      await Share.share({ message: text, title: 'BrainWave Certificate' });
    } catch (err) {
      Alert.alert('Share failed', 'Could not share this certificate.');
    }
  };

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Certificate" onBack={() => router.back()} />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Loading certificate...</Text>
      </Screen>
    );
  }

  if (error || !certificate) {
    return (
      <Screen>
        <ScreenHeader title="Certificate" onBack={() => router.back()} />
        <ErrorState message={error || 'Certificate not found'} onRetry={load} />
      </Screen>
    );
  }

  return (
    <RequireAuth>
      <Screen>
        <ScreenHeader title="Certificate" onBack={() => router.back()} />

        <View style={styles.certCard}>
          <Text style={styles.brand}>BrainWave LMS</Text>
          <Text style={styles.certTitle}>Certificate of Completion</Text>
          <Text style={styles.presented}>This certifies that</Text>
          <Text style={styles.student}>{certificate.studentName}</Text>
          <Text style={styles.presented}>has successfully completed the course</Text>
          <Text style={styles.courseT}>{certificate.courseTitle}</Text>
          <View style={styles.divider} />
          <Row label="Issued" value={formatDate(certificate.issuedAt)} />
          <Row label="Certificate ID" value={certificate.certificateId} />
          <Row label="Verification Code" value={certificate.verificationCode} />
          <Text style={styles.sign}>- {certificate.ceoName || 'Navaneeth Siliveri'}</Text>
        </View>

        <Button title="Share Certificate" variant="outline" icon={<Ionicons name="share-outline" size={18} color={colors.primaryDark} />} onPress={onShare} style={{ marginTop: 16 }} />
        <Button title="Verify Certificate" variant="secondary" icon={<Ionicons name="shield-checkmark-outline" size={18} color={colors.primaryDark} />} onPress={() => router.push(`/verify-certificate/${certificate.certificateId}`)} style={{ marginTop: 10 }} />
      </Screen>
    </RequireAuth>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  certCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  brand: { fontSize: 16, fontWeight: '900', color: colors.primaryDark, letterSpacing: 1 },
  certTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 14, textAlign: 'center' },
  presented: { fontSize: 12, color: colors.textSecondary, marginTop: 12 },
  student: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 6, textAlign: 'center' },
  courseT: { fontSize: 16, fontWeight: '700', color: colors.primaryDark, marginTop: 6, textAlign: 'center' },
  divider: { height: 1, width: '100%', backgroundColor: colors.border, marginVertical: 18 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.text, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  sign: { fontSize: 13, color: colors.textSecondary, marginTop: 10 },
});