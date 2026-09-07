import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import EducatorHeader from '../../src/components/EducatorHeader';
import { useApp } from '../../src/context/AppContext';
import { colors, radius, typography } from '../../src/constants/theme';

export default function EducatorProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { userData } = useApp();
  const [signingOut, setSigningOut] = useState(false);

  const name = user?.fullName || userData?.name || 'Educator';
  const email = user?.primaryEmailAddress?.emailAddress || userData?.email || '';
  const imageUrl = user?.imageUrl || userData?.imageUrl || null;

  const onSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <EducatorHeader title="Studio" />
      <Text style={[typography.h2, { marginBottom: 16 }]}>Educator Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={40} color={colors.primary} />
          )}
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="ribbon" size={14} color={colors.primaryDark} />
          <Text style={styles.roleText}>Educator</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Mobile educator tools</Text>
        <Text style={styles.infoText}>You can access your dashboard, courses, and enrolled students from mobile. Additional creation and exam management flows can be added using the existing backend APIs.</Text>
      </View>

      <Pressable style={[styles.menuRow, styles.signOut]} onPress={onSignOut}>
        <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        <Text style={[styles.menuLabel, { color: colors.danger }]}>{signingOut ? 'Signing out…' : 'Sign Out'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', paddingVertical: 20, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderLight, marginBottom: 20 },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatar: { width: 84, height: 84 },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, marginTop: 10 },
  roleText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  infoCard: { backgroundColor: colors.infoSoft, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: '#DBEAFE', marginBottom: 16 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  infoText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 10 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  signOut: { backgroundColor: colors.dangerSoft, borderColor: '#FECACA', marginTop: 8 },
});