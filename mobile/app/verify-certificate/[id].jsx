import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import ScreenHeader from '../../src/components/ScreenHeader';
import Button from '../../src/components/Button';
import ErrorState from '../../src/components/ErrorState';
import { verifyCertificate, getErrorMessage } from '../../src/services/api';
import { formatDate } from '../../src/utils/format';
import { colors, radius } from '../../src/constants/theme';

/**
 * Public certificate verification screen — mirrors the web
 * /verify-certificate/:certificateId page using the same backend endpoint.
 */
export default function VerifyCertificateScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cert = await verifyCertificate(String(id));
      setCertificate(cert);
    } catch (err) {
      setError(getErrorMessage(err, 'This certificate could not be verified.'));
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Verify Certificate" onBack={() => router.back()} />
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Verifying certificate…
        </Text>
      </Screen>
    );
  }

  if (error || !certificate) {
    return (
      <Screen>
        <ScreenHeader title="Verify Certificate" onBack={() => router.back()} />
        <ErrorState message={error || 'Certificate not valid'} onRetry={load} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Verify Certificate" onBack={() => router.back()} />

      <View style={styles.validBadge}>
        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
        <Text style={styles.validText}>Valid BrainWave certificate</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.courseTitle}>{certificate.courseTitle}</Text>
        <Row label="Student" value={certificate.studentName} />
        <Row label="Certificate ID" value={certificate.certificateId} />
        <Row label="Verification Code" value={certificate.verificationCode} />
        <Row label="Issued" value={formatDate(certificate.issuedAt)} />
        <Row label="Issued by" value={certificate.ceoName || 'BrainWave'} />
      </View>
    </Screen>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  validBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 14,
    marginBottom: 16,
  },
  validText: { fontSize: 14, fontWeight: '700', color: colors.success },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  courseTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 14, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: 13, color: colors.textSecondary },
  rowValue: { fontSize: 13, fontWeight: '700', color: colors.text, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
});