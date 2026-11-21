import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { GeometricLogo } from './GeometricLogo';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Verifying security perimeter...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <GeometricLogo size={48} />
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.message}>{message}</Text>
        </View>
        <Text style={styles.subtext}>DomainGuard Identity Gate</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  message: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  subtext: {
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
