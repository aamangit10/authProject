import React from 'react';
import { View, StyleSheet } from 'react-native';

interface GeometricLogoProps {
  size?: number;
}

/**
 * DomainGuard Minimal Geometric Mark
 * Inspired by Linear & Raycast: clean geometry, restrained slate & blue palette.
 * Built entirely with React Native primitives for crisp, instant cross-platform rendering.
 */
export const GeometricLogo: React.FC<GeometricLogoProps> = ({ size = 44 }) => {
  const outerSize = size;
  const innerRing = size * 0.72;
  const coreSize = size * 0.36;

  return (
    <View style={[styles.container, { width: outerSize, height: outerSize }]}>
      {/* Outer Squircle Container */}
      <View
        style={[
          styles.outerSquircle,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize * 0.28,
          },
        ]}
      >
        {/* Concentric Guard Perimeter */}
        <View
          style={[
            styles.guardPerimeter,
            {
              width: innerRing,
              height: innerRing,
              borderRadius: innerRing * 0.26,
            },
          ]}
        >
          {/* Keyhole / Domain Core Matrix */}
          <View
            style={[
              styles.coreMark,
              {
                width: coreSize,
                height: coreSize,
                borderRadius: coreSize * 0.22,
              },
            ]}
          >
            <View style={styles.coreDot} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerSquircle: {
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  guardPerimeter: {
    borderWidth: 1.5,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreMark: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
