import { useEffect, useState } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';

import { theme } from '../lib/theme';
import { useReducedMotion } from '../lib/useReducedMotion';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const SHEET_OFFSCREEN = Dimensions.get('window').height;

/**
 * Bottom-sheet chrome shared by every modal picker/editor in the app: a
 * backdrop that fades and sheet content that slides, animated as independent
 * Animated values. RN's built-in `<Modal animationType="slide">` moves the
 * whole modal — backdrop included — as one rigid unit, so the dark overlay
 * snaps in instead of fading; this is the smoother, more natural feel.
 */
export function Sheet({ visible, onClose, children }: SheetProps) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [sheetOffset] = useState(() => new Animated.Value(SHEET_OFFSCREEN));

  // Mount synchronously as soon as `visible` flips true, so the entrance
  // animation below has a rendered sheet to animate on the very next frame.
  const [renderedVisible, setRenderedVisible] = useState(visible);
  if (visible !== renderedVisible) {
    setRenderedVisible(visible);
    if (visible) setMounted(true);
  }

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: reducedMotion ? 0 : 220,
          useNativeDriver: true,
        }),
        Animated.timing(sheetOffset, {
          toValue: 0,
          duration: reducedMotion ? 0 : 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: reducedMotion ? 0 : 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetOffset, {
          toValue: SHEET_OFFSCREEN,
          duration: reducedMotion ? 0 : 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, backdropOpacity, sheetOffset, reducedMotion]);

  if (!mounted) return null;

  return (
    <Modal animationType="none" onRequestClose={onClose} transparent visible={mounted}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetOffset }] }]}>
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    bottom: 0,
    gap: 14,
    left: 0,
    maxHeight: '70%',
    padding: 16,
    paddingBottom: 32,
    position: 'absolute',
    right: 0,
  },
});
