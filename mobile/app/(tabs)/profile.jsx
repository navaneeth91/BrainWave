import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import { useApp } from '../../src/context/AppContext';
import { colors, radius, typography } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { isEducator, userData, becomeEducator, becomingEducator } = useApp();
  const [signingOut, setSigningOut] = useState(false);

  const name = user?.fullName || userData?.name || 'Student';
  const email = user?.primaryEmailAddress?.emailAddress || userData?.email || '';
  const imageUrl = user?.imageUrl || userData?.imageUrl || null;

  const onSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out of BrainWave?', [
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

  const onBecomeEducator = () => {
    Alert.alert(
      'Become an educator',
      'Switch your account to educator mode? This uses the existing BrainWave backend role update API.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            const result = await becomeEducator();
            if (result.success) {
              Alert.alert('Success', 'Your account is now an educator account.', [
                { text: 'Open Studio', onPress: () => router.replace('/(educator)/dashboard') },
              ]);
            } else {
              Alert.alert('Unable to update role', result.error || 'Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <Text style={[typography.h2, { marginBottom: 16 }]}>Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatar} contentFit="cover" transition={150} />
          ) : (
            <Ionicons name="person" size={40} color={colors.primary} />
          )}
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name={isEducator ? 'ribbon' : 'school'} size={14} color={colors.primaryDark} />
          <Text style={styles.roleText}>{isEducator ? 'Educator' : 'Student'}</Text>
        </View>
      </View>

      {isEducator ? (
        <View style={styles.educatorCard}>
          <Ionicons name="easel" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.educatorTitle}>Educator Studio</Text>
            <Text style={styles.educatorText}>
              Access your educator dashboard and course management tools on mobile.
            </Text>
          </View>
        </View>
      ) : (
        <Pressable style={styles.educatorCard} onPress={onBecomeEducator}>
          <Ionicons name="ribbon-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.educatorTitle}>{becomingEducator ? 'Updating role…' : 'Become an Educator'}</Text>
            <Text style={styles.educatorText}>
              Publish courses and manage students using the existing educator role system.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      )}

      {isEducator ? <MenuRow icon="grid-outline" label="Educator Studio" onPress={() => router.push('/(educator)/dashboard')} /> : null}

      <MenuRow icon="play-circle-outline" label="My Learning" onPress={() => router.push('/(tabs)/learning')} />
      <MenuRow icon="ribbon-outline" label="Certificates" onPress={() => router.push('/certificates')} />
      <MenuRow
        icon="information-circle-outline"
        label="About BrainWave"
        onPress={() =>
          Alert.alert('BrainWave', `BrainWave LMS\nVersion 1.0.0\nRole: ${isEducator ? 'Educator' : 'Student'}`)
        }
      />
      <MenuRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => Alert.alert('Privacy Policy', 'Your data is handled securely with Clerk authentication.')} />

      <Pressable style={[styles.menuRow, styles.signOut]} onPress={onSignOut}>
        <Ionicons name="log-out-outline" size={22} color={colors.danger} />
        <Text style={[styles.menuLabel, { color: colors.danger }]}>{signingOut ? 'Signing out…' : 'Sign Out'}</Text>
      </Pressable>
    </Screen>
  );
}

function MenuRow({ icon, label, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.textSecondary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
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
  educatorCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.infoSoft, borderRadius: radius.lg, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#DBEAFE' },
  educatorTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  educatorText: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 19 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 10 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  pressed: { opacity: 0.85 },
  signOut: { backgroundColor: colors.dangerSoft, borderColor: '#FECACA', marginTop: 8 },
});