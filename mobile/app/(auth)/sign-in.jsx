import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import AuthShell from '../../src/components/auth/AuthShell';
import AuthTextField from '../../src/components/auth/AuthTextField';
import Button from '../../src/components/Button';
import Divider from '../../src/components/auth/Divider';
import { colors } from '../../src/constants/theme';
import { getClerkErrorMessage, isValidEmail } from '../../src/utils/clerk';

export default function SignInScreen() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSignIn = async () => {
    if (!validate()) return;
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setFormError(null);
    try {
      const result = await signIn.create({ identifier: email.trim(), password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setFormError('We could not complete sign in. Please try again.');
      }
    } catch (err) {
      setFormError(getClerkErrorMessage(err, 'Unable to sign in'));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    setFormError(null);
    try {
      const { createdSessionId, setActive: activate } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/'),
      });
      if (createdSessionId) {
        await activate({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err) {
      setFormError('Google sign in was not completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue learning with BrainWave"
      footer={
        <Pressable onPress={() => router.push('/(auth)/sign-up')} style={styles.switchRow}>
          <Text style={styles.switchText}>New to BrainWave? </Text>
          <Text style={styles.switchLink}>Create an account</Text>
        </Pressable>
      }
    >
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <AuthTextField
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
        editable={!loading && !googleLoading}
      />

      <AuthTextField
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secure
        autoCapitalize="none"
        error={errors.password}
        editable={!loading && !googleLoading}
      />

      <Button title="Sign In" loading={loading} disabled={!isLoaded || googleLoading} onPress={onSignIn} style={{ marginTop: 6 }} />
      <Button
        title="Forgot password?"
        onPress={() => router.push('/(auth)/sign-in')}
        variant="ghost"
        style={{ marginTop: 4, minHeight: 36 }}
      />

      <Divider label="or" />

      <Button
        title="Continue with Google"
        variant="outline"
        loading={googleLoading}
        disabled={loading}
        onPress={onGoogle}
        icon={<Ionicons name="logo-google" size={18} color={colors.primaryDark} />}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  formError: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchText: { color: colors.textSecondary, fontSize: 14 },
  switchLink: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
});