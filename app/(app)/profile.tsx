import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../src/auth/AuthProvider';
import { Button } from '../../src/components/Button';
import { theme } from '../../src/lib/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const onSignOut = async () => {
    setSigningOut(true);
    // signOut always ends in the signedOut state; this screen unmounts with it.
    await signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <Button
        title="Sign out"
        variant="destructive"
        onPress={onSignOut}
        loading={signingOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
  container: {
    backgroundColor: theme.background,
    flex: 1,
    gap: 24,
    padding: 24,
  },
  email: {
    color: theme.textMuted,
    fontSize: 15,
  },
  name: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '600',
  },
});
