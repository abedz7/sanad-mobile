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

// Sign-in only checks presence; password rules are enforced at registration.
const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await signIn(values.email, values.password);
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
        <Text style={styles.title}>Sign in</Text>

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
              autoComplete="current-password"
              secureTextEntry
              textContentType="password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        {serverError ? (
          <View accessibilityRole="alert" style={styles.serverError}>
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

        <Button title="Sign in" onPress={onSubmit} loading={isSubmitting} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Sanad? </Text>
          <Link href="/(auth)/register" style={styles.link}>
            Create an account
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
    height: 72,
    resizeMode: 'contain',
    width: 72,
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
