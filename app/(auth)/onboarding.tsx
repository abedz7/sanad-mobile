import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { markOnboardingSeen } from '../../src/lib/onboarding';
import { theme } from '../../src/lib/theme';

const FEATURES = [
  {
    icon: 'create-outline',
    text: 'Create a ticket and attach photos of the problem',
  },
  {
    icon: 'trending-up-outline',
    text: 'Follow its status from open to resolved',
  },
  {
    icon: 'chatbubbles-outline',
    text: 'Talk to support in the ticket, any time',
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const finish = async () => {
    // The flag is best-effort: failing to persist it only replays onboarding.
    try {
      await markOnboardingSeen();
    } catch {
      // ignore — see above
    }
    router.replace('/(auth)/sign-in');
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 24, paddingTop: insets.top }]}>
      {page === 0 ? (
        <Pressable
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
          onPress={finish}
          style={[styles.skip, { top: insets.top + 8 }]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      ) : null}

      <ScrollView
        horizontal
        onMomentumScrollEnd={onScroll}
        pagingEnabled
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
      >
        <View style={[styles.slide, { width }]}>
          <Image
            accessibilityIgnoresInvertColors
            source={require('../../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Sanad means support</Text>
          <Text style={styles.subtitle}>
            Report a problem, attach photos, and follow it until it’s fixed.
          </Text>
        </View>

        <View style={[styles.slide, { width }]}>
          <View style={styles.features}>
            {FEATURES.map(({ icon, text }) => (
              <View key={icon} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons color={theme.accent} name={icon} size={24} />
                </View>
                <Text style={styles.featureText}>{text}</Text>
              </View>
            ))}
          </View>
          <View style={styles.cta}>
            <Button onPress={finish} title="Get started" />
          </View>
        </View>
      </ScrollView>

      <View style={styles.dots}>
        {[0, 1].map((index) => (
          <View key={index} style={[styles.dot, page === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cta: {
    alignSelf: 'stretch',
    marginTop: 40,
  },
  dot: {
    backgroundColor: theme.border,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: theme.accent,
    width: 20,
  },
  dots: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
  },
  featureIcon: {
    alignItems: 'center',
    backgroundColor: theme.accentTint,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  featureText: {
    color: theme.text,
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  features: {
    alignSelf: 'stretch',
    gap: 24,
  },
  logo: {
    height: 120,
    resizeMode: 'contain',
    width: 120,
  },
  screen: {
    backgroundColor: theme.background,
    flex: 1,
  },
  skip: {
    padding: 16,
    position: 'absolute',
    right: 8,
    zIndex: 1,
  },
  skipText: {
    color: theme.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    padding: 32,
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  title: {
    color: theme.text,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
});
