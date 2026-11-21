import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoadingScreen } from '../components/LoadingScreen';

/**
 * DomainGuard Protected Application Navigator
 * 
 * Enforces route protection at the core navigation boundary.
 * Prevents unauthenticated users from accessing the dashboard.
 * On web, synchronizes browser history/hash while preventing URL spoofing.
 */
export const AppNavigator: React.FC = () => {
  const { status, user } = useAuth();

  // Web URL sync & route protection
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleHashChange = () => {
        const hash = window.location.hash;
        // If an unauthenticated user attempts to navigate to #/dashboard directly, reject it
        if (hash.includes('dashboard') && (!user || status !== 'authenticated')) {
          window.location.hash = '#/login';
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      
      // Update hash to reflect actual authenticated state
      if (status === 'authenticated' && user) {
        window.location.hash = '#/workspace';
      } else if (status === 'signed_out' || status === 'rejected') {
        window.location.hash = '#/login';
      }

      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }
  }, [status, user]);

  if (status === 'initializing') {
    return <LoadingScreen message="Initializing DomainGuard..." />;
  }

  return (
    <View style={styles.container}>
      {status === 'authenticated' && user ? (
        <DashboardScreen />
      ) : (
        <LoginScreen />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
