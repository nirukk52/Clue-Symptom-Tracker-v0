/**
 * BackgroundBlobs - Decorative pastel blob shapes for onboarding screens
 * 
 * Why it exists: Creates the Podia-inspired visual atmosphere with soft, 
 * blurred shapes that add depth without competing with content.
 * 
 * Reference: all-ui-images-and-code/onboarding-screen-1-what_are_you_managing?_1/code.html
 */

import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface BackgroundBlobsProps {
  /** Custom opacity for all blobs (default: 0.2) */
  opacity?: number;
}

export function BackgroundBlobs({ opacity = 0.2 }: BackgroundBlobsProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Orange/Peach blob - top left */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity, scale: 1 }}
        transition={{ type: 'timing', duration: 800, delay: 100 }}
        style={[styles.blob, styles.orangeBlob]}
      />

      {/* Purple blob - top right */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity, scale: 1 }}
        transition={{ type: 'timing', duration: 800, delay: 200 }}
        style={[styles.blob, styles.purpleBlob]}
      />

      {/* Blue blob - bottom right */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity, scale: 1 }}
        transition={{ type: 'timing', duration: 800, delay: 300 }}
        style={[styles.blob, styles.blueBlob]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orangeBlob: {
    top: -50,
    left: -30,
    width: 160,
    height: 160,
    backgroundColor: '#E8974F', // accent-peach
  },
  purpleBlob: {
    top: '20%',
    right: -50,
    width: 256,
    height: 256,
    backgroundColor: '#D0BDF4', // accent-purple
  },
  blueBlob: {
    bottom: -50,
    right: 20,
    width: 192,
    height: 192,
    backgroundColor: '#A4C8D8', // accent-blue
  },
});

