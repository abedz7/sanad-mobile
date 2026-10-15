import { useEffect, useState } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '../lib/useReducedMotion';

/**
 * Wraps a screen's content with one opacity reveal on mount — the single
 * page-load animation each screen gets; nothing inside should animate in on
 * top of it.
 */
export function FadeIn({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(reducedMotion ? 1 : 0));

  useEffect(() => {
    if (reducedMotion) return;
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [opacity, reducedMotion]);

  return <Animated.View style={[{ flex: 1, opacity }, style]}>{children}</Animated.View>;
}
