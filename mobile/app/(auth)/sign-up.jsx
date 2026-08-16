import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import AuthShell from '../../src/components/auth/AuthShell';
import AuthTextField from '../../src/components/auth/AuthTextField';
import Button from '../../src/components/Button';
import Divider from '../../src/components/auth/Divider';
import { colors } from '../../src/constants/theme';
import { getClerkErrorMessage, isValidEmail } from '../../src/utils/clerk';

export default function SignUpScreen() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Full name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!isValidEmail(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    if (!confirm) next.confirm = 'Confirm your password';
    else if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onCreateAccount = async () => {
    if (!validate()) return;
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setFormError(null);
    try {
      // Backend stores name = first_name + " " + last_name (see Clerk webhook).
      const parts = name.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      const result = await signUp.create({ firstName, lastName, emailAddress: email.trim(), password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else if (result.status === 'missing_requirements') {
        await signUp.prepareVerification({ strategy: 'email_code' });
        setFormError('A verification email has been sent. Please finish verification in the email.');
      } else {
        setFormError('We could not create your account. Please try again.');
      }
    } catch (err) {
      setFormError(getClerkErrorMessage(err, 'Unable to create account'));
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
      setFormError('Google sign up was not completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join BrainWave and start learning today"
      footer={
        <Pressable onPress={() => router.replace('/(auth)/sign-in')} style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account? </Text>
          <Text style={styles.switchLink}>Sign in</Text>
        </Pressable>
      }
    >
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <AuthTextField label="Full name" placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name} editable={!loading && !googleLoading} />
      <AuthTextField label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} editable={!loading && !googleLoading} />
      <AuthTextField label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secure autoCapitalize="none" error={errors.password} editable={!loading && !googleLoading} />
      <AuthTextField label="Confirm password" placeholder="Repeat your password" value={confirm} onChangeText={setConfirm} secure autoCapitalize="none" error={errors.confirm} editable={!loading && !googleLoading} />

      <Button title="Create Account" loading={loading} disabled={!isLoaded || googleLoading} onPress={onCreateAccount} style={{ marginTop: 6 }} />

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
  formError: { color: colors.danger, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchText: { color: colors.textSecondary, fontSize: 14 },
  switchLink: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
});