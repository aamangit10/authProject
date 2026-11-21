import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GeometricLogo } from '../components/GeometricLogo';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { StatusBadge } from '../components/StatusBadge';
import { AppButton } from '../components/AppButton';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_DOMAIN } from '../utils/domainValidation';
import { getMissingSupabaseKeys } from '../config/supabaseConfig';

export const LoginScreen: React.FC = () => {
  const { 
    signInWithGoogle, 
    status, 
    error, 
    rejectionDetails, 
    clearError, 
    isConfigured,
    testLoginWithEmail 
  } = useAuth();

  const [customTestEmail, setCustomTestEmail] = useState('');
  const [showDevPanel, setShowDevPanel] = useState(!isConfigured);

  const isAuthenticating = status === 'authenticating';
  const isRejected = status === 'rejected' || Boolean(error);
  const missingKeys = getMissingSupabaseKeys();

  const handleTestEmailSubmit = () => {
    if (customTestEmail.trim() && testLoginWithEmail) {
      testLoginWithEmail(customTestEmail.trim());
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainWrapper}>
          
          {/* Top Brand Tag */}
          <View style={styles.topHeader}>
            <View style={styles.brandRow}>
              <GeometricLogo size={28} />
              <Text style={styles.brandTitle}>DomainGuard</Text>
            </View>
            <StatusBadge label={ALLOWED_DOMAIN} variant="accent" size="sm" />
          </View>

          {/* Center Card */}
          <View style={styles.card}>
            
            {/* Header info */}
            <View style={styles.cardHeader}>
              <View style={styles.iconCenter}>
                <GeometricLogo size={42} />
              </View>
              <Text style={styles.heading}>Sign in to your workspace</Text>
              <Text style={styles.subheading}>
                Use your official company Google account to continue.
              </Text>
            </View>

            {/* Error / Rejection Banner */}
            {isRejected && (
              <View style={styles.errorBanner}>
                <View style={styles.errorHeader}>
                  <View style={styles.errorIconDot} />
                  <Text style={styles.errorTitle}>Access Denied</Text>
                </View>
                <Text style={styles.errorMessage}>
                  {error || 'Access restricted. Please login using your official domain email.'}
                </Text>
                {rejectionDetails?.email ? (
                  <View style={styles.rejectionDetailRow}>
                    <Text style={styles.rejectionDetailLabel}>Attempted Account:</Text>
                    <Text style={styles.rejectionDetailValue}>{rejectionDetails.email}</Text>
                  </View>
                ) : null}
                <View style={styles.errorActionRow}>
                  <TouchableOpacity 
                    onPress={clearError}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryText}>Try another account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Google Authentication Trigger */}
            <View style={styles.authSection}>
              <GoogleSignInButton
                onPress={signInWithGoogle}
                loading={isAuthenticating}
                disabled={isAuthenticating}
              />
            </View>

            {/* Domain Enforcement Callout */}
            <View style={styles.domainInfoBox}>
              <View style={styles.domainInfoTop}>
                <Text style={styles.domainInfoLabel}>Enforced Domain Perimeter</Text>
                <StatusBadge label="Strict Suffix" variant="success" size="sm" />
              </View>
              <Text style={styles.domainInfoDescription}>
                Only verified identities ending in <Text style={styles.domainCode}>@{ALLOWED_DOMAIN}</Text> are authorized to enter. External mailboxes (Gmail, Yahoo, iCloud) are automatically rejected at the security boundary.
              </Text>
            </View>

            {/* Missing Supabase notice (if running without configured .env) */}
            {!isConfigured && (
              <View style={styles.configNotice}>
                <View style={styles.configNoticeHeader}>
                  <StatusBadge label="Setup Notice" variant="warning" size="sm" />
                  <TouchableOpacity onPress={() => setShowDevPanel(!showDevPanel)}>
                    <Text style={styles.toggleDevText}>
                      {showDevPanel ? 'Hide Test Perimeter' : 'Show Test Perimeter'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.configNoticeText}>
                  Supabase URL and anon key are not yet detected in .env. You can evaluate the strict domain verification boundary using the interactive validator below.
                </Text>

                {showDevPanel && (
                  <View style={styles.devPanel}>
                    <Text style={styles.devPanelTitle}>Quick Domain Verification Runner</Text>
                    <Text style={styles.devPanelSubtitle}>
                      Click an address or enter a custom email to test validation:
                    </Text>

                    <View style={styles.quickAccountsRow}>
                      <TouchableOpacity
                        style={styles.quickAccountBtnAllowed}
                        onPress={() => testLoginWithEmail?.('aman@hbplus.fit', 'Aman Kumar')}
                      >
                        <Text style={styles.quickAccountAllowedText}>aman@hbplus.fit</Text>
                        <Text style={styles.allowedTag}>Allowed (Admin)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.quickAccountBtnAllowed}
                        onPress={() => testLoginWithEmail?.('employee@hbplus.fit', 'Jane Employee')}
                      >
                        <Text style={styles.quickAccountAllowedText}>employee@hbplus.fit</Text>
                        <Text style={styles.allowedTag}>Allowed (User)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.quickAccountBtnRejected}
                        onPress={() => testLoginWithEmail?.('aman@gmail.com', 'Aman (Personal)')}
                      >
                        <Text style={styles.quickAccountRejectedText}>aman@gmail.com</Text>
                        <Text style={styles.rejectedTag}>Rejected</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.quickAccountBtnRejected}
                        onPress={() => testLoginWithEmail?.('user@yahoo.com', 'Yahoo User')}
                      >
                        <Text style={styles.quickAccountRejectedText}>user@yahoo.com</Text>
                        <Text style={styles.rejectedTag}>Rejected</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.quickAccountBtnRejected}
                        onPress={() => testLoginWithEmail?.('aman@fakehbplus.fit', 'Attacker')}
                      >
                        <Text style={styles.quickAccountRejectedText}>aman@fakehbplus.fit</Text>
                        <Text style={styles.rejectedTag}>Rejected</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Custom Email Input */}
                    <View style={styles.customInputRow}>
                      <TextInput
                        style={styles.customEmailInput}
                        placeholder="Enter email to test (e.g. test@hbplus.fit)"
                        placeholderTextColor="#94A3B8"
                        value={customTestEmail}
                        onChangeText={setCustomTestEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onSubmitEditing={handleTestEmailSubmit}
                      />
                      <AppButton
                        title="Test"
                        onPress={handleTestEmailSubmit}
                        variant="secondary"
                        style={styles.customTestBtn}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Subtle Security Notes */}
            <View style={styles.securityFooterNote}>
              <Text style={styles.securityNoteText}>
                Enterprise Single Sign-On (SSO) enforced with Supabase OAuth 2.0. Protected against spoofing, unverified emails, and domain manipulation.
              </Text>
            </View>
          </View>

          {/* Page Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerCopyright}>
              DomainGuard © 2026 {ALLOWED_DOMAIN}
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Security Policy</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Directory Terms</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>System Status</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCenter: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorIconDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginRight: 6,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    letterSpacing: -0.1,
    textTransform: 'uppercase',
  },
  errorMessage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#991B1B',
    lineHeight: 18,
  },
  rejectionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  rejectionDetailLabel: {
    fontSize: 11,
    color: '#B91C1C',
    marginRight: 6,
  },
  rejectionDetailValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7F1D1D',
  },
  errorActionRow: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  retryButton: {
    paddingVertical: 2,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#B91C1C',
    textDecorationLine: 'underline',
  },
  authSection: {
    marginBottom: 18,
  },
  domainInfoBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  domainInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  domainInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  domainInfoDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  domainCode: {
    fontWeight: '600',
    color: '#1E293B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  configNotice: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  configNoticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  toggleDevText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  configNoticeText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  devPanel: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  devPanelTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 2,
  },
  devPanelSubtitle: {
    fontSize: 11,
    color: '#92400E',
    marginBottom: 8,
  },
  quickAccountsRow: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 10,
  },
  quickAccountBtnAllowed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  quickAccountAllowedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#065F46',
  },
  allowedTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  quickAccountBtnRejected: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  quickAccountRejectedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#991B1B',
  },
  rejectedTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DC2626',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  customEmailInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#0F172A',
  },
  customTestBtn: {
    height: 36,
    paddingHorizontal: 12,
  },
  securityFooterNote: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginTop: 4,
  },
  securityNoteText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 15,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 12,
    color: '#64748B',
  },
  footerDot: {
    marginHorizontal: 8,
    color: '#CBD5E1',
    fontSize: 10,
  },
});
