import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { useAuth } from '../../src/auth/AuthProvider';
import { Button } from '../../src/components/Button';
import { Sheet } from '../../src/components/Sheet';
import { TextField } from '../../src/components/TextField';
import { showToast } from '../../src/components/Toast';
import { errorMessage } from '../../src/lib/errors';
import { formatDate } from '../../src/lib/format';
import { theme } from '../../src/lib/theme';

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

// Mirrors the contract (API.md §6, PATCH /auth/me): name 1–80, nothing else.
const nameSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80, 'At most 80 characters'),
});

type NameValues = z.infer<typeof nameSchema>;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    // signOut always ends in the signedOut state; this screen unmounts with it.
    await signOut();
  };

  const avatarInitials = user ? initials(user.name) : '';

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        {avatarInitials ? (
          <Text style={styles.avatarText}>{avatarInitials}</Text>
        ) : (
          <Ionicons color={theme.accent} name="person" size={36} />
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal details</Text>
          <Pressable
            accessibilityLabel="Edit personal details"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        </View>
        <DetailRow label="Name" value={user?.name ?? ''} />
        <DetailRow label="Email" value={user?.email ?? ''} />
        <DetailRow label="Member since" value={user ? formatDate(user.createdAt) : ''} />
      </View>

      <View style={styles.signOut}>
        <Button
          title="Sign out"
          variant="destructive"
          onPress={onSignOut}
          loading={signingOut}
        />
      </View>

      {user ? <EditNameSheet onClose={() => setEditing(false)} visible={editing} /> : null}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

function EditNameSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user, updateName } = useAuth();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NameValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  const close = () => {
    reset({ name: user?.name ?? '' });
    onClose();
  };

  const onSave = handleSubmit(async ({ name }) => {
    try {
      await updateName(name);
      showToast('Name updated');
      onClose();
    } catch (error) {
      showToast(errorMessage(error));
    }
  });

  return (
    <Sheet onClose={close} visible={visible}>
      <Text style={styles.cardTitle}>Edit personal details</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            autoComplete="name"
            error={errors.name?.message}
            label="Name"
            onBlur={onBlur}
            onChangeText={onChange}
            textContentType="name"
            value={value}
          />
        )}
      />
      <TextField
        editable={false}
        hint="Email can’t be changed"
        label="Email"
        value={user?.email ?? ''}
      />
      <Button loading={isSubmitting} onPress={onSave} title="Save" />
    </Sheet>
  );
}

const AVATAR = 88;

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.accentTint,
    borderRadius: AVATAR / 2,
    height: AVATAR,
    justifyContent: 'center',
    width: AVATAR,
  },
  avatarText: {
    color: theme.accent,
    fontSize: 30,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: theme.background,
    flex: 1,
    gap: 24,
    padding: 24,
  },
  editLabel: {
    color: theme.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: theme.textMuted,
    fontSize: 15,
  },
  rowValue: {
    color: theme.text,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  signOut: {
    marginTop: 'auto',
  },
});
