import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  useWindowDimensions, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GeometricLogo } from '../components/GeometricLogo';
import { StatusBadge } from '../components/StatusBadge';
import { AppButton } from '../components/AppButton';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_DOMAIN } from '../utils/domainValidation';

export const DashboardScreen: React.FC = () => {
  const { user, signOut, refreshSession, status } = useAuth();
  const { width } = useWindowDimensions();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isWideScreen = width >= 768;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleCopy = (text: string, keyName: string) => {
    setCopiedKey(keyName);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  const roleVariant = user?.role === 'admin' ? 'accent' : 'neutral';

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <View style={styles.navInner}>
          <View style={styles.navLeft}>
            <GeometricLogo size={30} />
            <View style={styles.navBrandCol}>
              <Text style={styles.navBrandTitle}>DomainGuard</Text>
              <Text style={styles.navBrandSub}>Identity & Access</Text>
            </View>
            <View style={styles.navDivider} />
            <StatusBadge label={ALLOWED_DOMAIN} variant="accent" size="sm" />
          </View>

          <View style={styles.navRight}>
            <View style={styles.userInfoPill}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.navAvatar} />
              ) : (
                <View style={styles.navAvatarFallback}>
                  <Text style={styles.navAvatarInitials}>{userInitial}</Text>
                </View>
              )}
              {isWideScreen && (
                <View style={styles.navUserMeta}>
                  <Text style={styles.navUserName} numberOfLines={1}>
                    {user?.displayName || user?.email}
                  </Text>
                  <Text style={styles.navUserEmail} numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              )}
            </View>

            <AppButton
              title="Sign Out"
              onPress={handleSignOut}
              variant="outline"
              loading={isSigningOut}
              style={styles.signOutBtn}
            />
          </View>
        </View>
      </View>

      {/* Main Workspace Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageCategory}>Workspace Portal</Text>
              <Text style={styles.pageHeading}>Workspace</Text>
              <Text style={styles.welcomeMessage}>
                Welcome back, <Text style={styles.boldName}>{user?.displayName || 'Colleague'}</Text>. You have authorized access to internal services.
              </Text>
            </View>

            <View style={styles.headerBadges}>
              <StatusBadge label="Verified" variant="success" size="md" />
              <StatusBadge 
                label={`Role: ${user?.role ? user.role.toUpperCase() : 'USER'}`} 
                variant={roleVariant} 
                size="md" 
              />
            </View>
          </View>

          {/* Cards Grid */}
          <View style={[styles.grid, isWideScreen && styles.gridWide]}>
            
            {/* Identity & Session Card */}
            <View style={[styles.card, isWideScreen && styles.cardHalf]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Identity & Verification</Text>
                <StatusBadge label="SSO Active" variant="success" size="sm" />
              </View>

              <View style={styles.profileRow}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.profileAvatarLarge} />
                ) : (
                  <View style={styles.profileAvatarLargeFallback}>
                    <Text style={styles.profileInitialsLarge}>{userInitial}</Text>
                  </View>
                )}
                <View style={styles.profileDetails}>
                  <Text style={styles.profileNameLarge}>
                    {user?.displayName || 'Enterprise User'}
                  </Text>
                  <Text style={styles.profileEmailLarge}>{user?.email}</Text>
                  <View style={styles.profileTagsRow}>
                    <StatusBadge label={`@${ALLOWED_DOMAIN}`} variant="accent" size="sm" />
                    <StatusBadge 
                      label={user?.emailVerified ? 'Email Verified' : 'Unverified'} 
                      variant={user?.emailVerified ? 'success' : 'error'} 
                      size="sm" 
                    />
                  </View>
                </View>
              </View>

              <View style={styles.dataList}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Identity Provider</Text>
                  <Text style={styles.dataValue}>{user?.providerId || 'Google OAuth 2.0'}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Enforced Domain</Text>
                  <Text style={styles.dataValue}>{ALLOWED_DOMAIN}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Assigned Role</Text>
                  <Text style={styles.dataValue}>{user?.role?.toUpperCase() || 'USER'}</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>User ID (UID)</Text>
                  <TouchableOpacity 
                    onPress={() => user?.uid && handleCopy(user.uid, 'uid')}
                    style={styles.copyableRow}
                  >
                    <Text style={styles.dataValueMono} numberOfLines={1}>
                      {user?.uid || 'N/A'}
                    </Text>
                    <Text style={styles.copyHint}>
                      {copiedKey === 'uid' ? 'Copied' : 'Copy'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Last Authentication</Text>
                  <Text style={styles.dataValue}>
                    {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString() : 'Just now'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <AppButton
                  title="Refresh Session"
                  onPress={refreshSession}
                  variant="secondary"
                  style={styles.refreshBtn}
                />
              </View>
            </View>

            {/* Security Boundary & Perimeter Card */}
            <View style={[styles.card, isWideScreen && styles.cardHalf]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Security Perimeter & Boundary</Text>
                <StatusBadge label="Enforced" variant="neutral" size="sm" />
              </View>

              <View style={styles.perimeterNotice}>
                <Text style={styles.perimeterNoticeTitle}>Strict Boundary Enforcement</Text>
                <Text style={styles.perimeterNoticeBody}>
                  DomainGuard actively validates all identity claims on both the client authentication lifecycle and backend Firestore rules. Accounts without an explicit <Text style={styles.boldCode}>@{ALLOWED_DOMAIN}</Text> verified email address are rejected and de-authenticated at once.
                </Text>
              </View>

              <View style={styles.securityChecklist}>
                <View style={styles.securityCheckItem}>
                  <View style={styles.checkIconSuccess} />
                  <View style={styles.checkTextCol}>
                    <Text style={styles.checkTitle}>Google OAuth 2.0 Identity Token</Text>
                    <Text style={styles.checkDesc}>Cryptographically signed by Google Identity Services.</Text>
                  </View>
                </View>

                <View style={styles.securityCheckItem}>
                  <View style={styles.checkIconSuccess} />
                  <View style={styles.checkTextCol}>
                    <Text style={styles.checkTitle}>Google Email Verification Status</Text>
                    <Text style={styles.checkDesc}>Verified identity confirmed by workspace domain registrar.</Text>
                  </View>
                </View>

                <View style={styles.securityCheckItem}>
                  <View style={styles.checkIconSuccess} />
                  <View style={styles.checkTextCol}>
                    <Text style={styles.checkTitle}>Exact Domain Suffix Matching</Text>
                    <Text style={styles.checkDesc}>Protected against domain suffix, prefix, and wildcard injection.</Text>
                  </View>
                </View>

                <View style={styles.securityCheckItem}>
                  <View style={styles.checkIconSuccess} />
                  <View style={styles.checkTextCol}>
                    <Text style={styles.checkTitle}>Firestore Security Rules Perimeter</Text>
                    <Text style={styles.checkDesc}>Backend documents require auth.token.email.matches('.*@hbplus.fit$').</Text>
                  </View>
                </View>
              </View>

              <View style={styles.policySummaryBox}>
                <Text style={styles.policyLabel}>Organization Scope</Text>
                <Text style={styles.policyValue}>HBPlus Internal Portal • Confirmed Authorized Tenant</Text>
              </View>
            </View>

          </View>

          {/* Directory Access Overview (Useful Real Data, No Meaningless Charts) */}
          <View style={styles.cardFull}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Authorized Company Services</Text>
              <Text style={styles.cardSubtitle}>
                Active SSO scopes granted to {user?.email}
              </Text>
            </View>

            <View style={styles.servicesGrid}>
              <View style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>Internal Knowledge Base</Text>
                  <StatusBadge label="Accessible" variant="success" size="sm" />
                </View>
                <Text style={styles.serviceDesc}>Engineering documentation, runbooks, and company wiki.</Text>
              </View>

              <View style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>Enterprise Directory</Text>
                  <StatusBadge label="Accessible" variant="success" size="sm" />
                </View>
                <Text style={styles.serviceDesc}>Employee contact catalog and department hierarchy.</Text>
              </View>

              <View style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>Security Audit Logs</Text>
                  <StatusBadge 
                    label={user?.role === 'admin' ? 'Full Access' : 'Restricted'} 
                    variant={user?.role === 'admin' ? 'accent' : 'neutral'} 
                    size="sm" 
                  />
                </View>
                <Text style={styles.serviceDesc}>
                  {user?.role === 'admin' 
                    ? 'Review SSO sign-ins, IP signatures, and perimeter denials.' 
                    : 'Requires Admin role privileges to inspect company-wide logs.'}
                </Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Global Footer */}
      <View style={styles.dashFooter}>
        <Text style={styles.dashFooterText}>
          DomainGuard SSO Gateway • Connected to {ALLOWED_DOMAIN} Directory • Session ID: {user?.uid.substring(0, 12)}...
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  navBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navInner: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBrandCol: {
    marginLeft: 10,
  },
  navBrandTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  navBrandSub: {
    fontSize: 11,
    color: '#64748B',
  },
  navDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navAvatarInitials: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  navUserMeta: {
    marginLeft: 8,
    maxWidth: 160,
  },
  navUserName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  navUserEmail: {
    fontSize: 11,
    color: '#64748B',
  },
  signOutBtn: {
    height: 34,
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  contentContainer: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  pageHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  welcomeMessage: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  boldName: {
    fontWeight: '600',
    color: '#0F172A',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  gridWide: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHalf: {
    flex: 1,
  },
  cardFull: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  profileAvatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileAvatarLargeFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitialsLarge: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  profileDetails: {
    marginLeft: 14,
    flex: 1,
  },
  profileNameLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  profileEmailLarge: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  profileTagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dataList: {
    gap: 10,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  copyableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dataValueMono: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#334155',
    maxWidth: 140,
  },
  copyHint: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  refreshBtn: {
    height: 36,
  },
  perimeterNotice: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  perimeterNoticeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  perimeterNoticeBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  boldCode: {
    fontWeight: '600',
    color: '#1E293B',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  securityChecklist: {
    gap: 12,
    marginBottom: 16,
  },
  securityCheckItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIconSuccess: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginTop: 5,
    marginRight: 10,
  },
  checkTextCol: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  checkDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 15,
  },
  policySummaryBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    padding: 10,
  },
  policyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
    textTransform: 'uppercase',
  },
  policyValue: {
    fontSize: 12,
    color: '#1E3A8A',
    marginTop: 2,
    fontWeight: '500',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceItem: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  serviceDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  dashFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dashFooterText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
