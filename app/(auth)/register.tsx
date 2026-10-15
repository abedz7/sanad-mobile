import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { useAuth } from '../../src/auth/AuthProvider';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { errorMessage } from '../../src/lib/errors';
import { theme } from '../../src/lib/theme';

// Mirrors the server's policy (API.md §3.3); the common-password list and
// "must not equal email" checks stay server-side and surface as field errors.
const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80, 'At most 80 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email')
    .max(254, 'At most 254 characters')
    .email('Enter a valid email'),
  password: z
    .string()
    .min(10, 'At least 10 characters')
    .max(128, 'At most 128 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { register } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await register(values.name, values.email, values.password);
    } catch (error) {
      setServerError(errorMessage(error));
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          accessibilityIgnoresInvertColors
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Create account</Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Name"
              autoComplete="name"
              textContentType="name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Password"
              autoCapitalize="none"
              autoComplete="new-password"
              secureToggle
              textContentType="newPassword"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
              hint="10–128 characters; common passwords are rejected"
            />
          )}
        />

        {serverError ? (
          <View accessibilityRole="alert" style={styles.serverError}>
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

        <Button title="Create account" onPress={onSubmit} loading={isSubmitting} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" style={styles.link}>
            Sign in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  flex: {
    backgroundColor: theme.background,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: theme.textMuted,
    fontSize: 15,
  },
  link: {
    color: theme.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  logo: {
    alignSelf: 'center',
    height: 160,
    resizeMode: 'contain',
    width: 160,
  },
  serverError: {
    backgroundColor: theme.dangerTint,
    borderRadius: 10,
    padding: 12,
  },
  serverErrorText: {
    color: theme.danger,
    fontSize: 14,
  },
  title: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});
