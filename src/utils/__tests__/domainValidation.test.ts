import { 
  normalizeEmail, 
  extractDomain, 
  validateCompanyDomain, 
  validateVerifiedGoogleAccount,
  ALLOWED_DOMAIN 
} from '../domainValidation';

describe('DomainGuard — Strict Domain Validation Tests', () => {
  describe('normalizeEmail', () => {
    it('normalizes casing and trims whitespace', () => {
      expect(normalizeEmail('  Aman@HbPlus.Fit  ')).toBe('aman@hbplus.fit');
      expect(normalizeEmail('EMPLOYEE@HBPLUS.FIT')).toBe('employee@hbplus.fit');
    });

    it('handles empty, null, and undefined values safely', () => {
      expect(normalizeEmail('')).toBe('');
      expect(normalizeEmail(null)).toBe('');
      expect(normalizeEmail(undefined)).toBe('');
    });
  });

  describe('extractDomain', () => {
    it('extracts valid domain from normalized email', () => {
      expect(extractDomain('aman@hbplus.fit')).toBe('hbplus.fit');
      expect(extractDomain('user@gmail.com')).toBe('gmail.com');
    });

    it('rejects malformed email addresses with multiple @ symbols', () => {
      expect(extractDomain('aman@hbplus.fit@attacker.com')).toBeNull();
      expect(extractDomain('user@@hbplus.fit')).toBeNull();
    });

    it('rejects email addresses with missing domain or username', () => {
      expect(extractDomain('@hbplus.fit')).toBeNull();
      expect(extractDomain('aman@')).toBeNull();
      expect(extractDomain('just-text')).toBeNull();
    });
  });

  describe('validateCompanyDomain', () => {
    // Official cases specified in requirements
    it('allows official company domain emails', () => {
      expect(validateCompanyDomain('aman@hbplus.fit')).toBe(true);
      expect(validateCompanyDomain('employee@hbplus.fit')).toBe(true);
      expect(validateCompanyDomain('security.officer@hbplus.fit')).toBe(true);
      expect(validateCompanyDomain('first.last+tag@hbplus.fit')).toBe(true);
    });

    it('handles uppercase and whitespace correctly', () => {
      expect(validateCompanyDomain('AMAN@HBPLUS.FIT')).toBe(true);
      expect(validateCompanyDomain('  employee@hbplus.fit  ')).toBe(true);
      expect(validateCompanyDomain('\taman@hbplus.fit\n')).toBe(true);
    });

    it('rejects external consumer providers (gmail, yahoo, etc.)', () => {
      expect(validateCompanyDomain('aman@gmail.com')).toBe(false);
      expect(validateCompanyDomain('user@yahoo.com')).toBe(false);
      expect(validateCompanyDomain('test@outlook.com')).toBe(false);
    });

    it('rejects spoofing attempts with domain suffix mutations', () => {
      expect(validateCompanyDomain('aman@fakehbplus.fit')).toBe(false);
      expect(validateCompanyDomain('aman@hbplus.fit.fake.com')).toBe(false);
      expect(validateCompanyDomain('aman@hbplus.fit.evil.io')).toBe(false);
      expect(validateCompanyDomain('aman@not-hbplus.fit.com')).toBe(false);
      expect(validateCompanyDomain('aman@hbplus.fitness')).toBe(false);
    });

    it('rejects spoofing attempts with nested @ symbols', () => {
      expect(validateCompanyDomain('aman@hbplus.fit@evil.com')).toBe(false);
      expect(validateCompanyDomain('evil@attacker.com@hbplus.fit')).toBe(false);
    });

    it('rejects subdomains if strict exact domain is required', () => {
      expect(validateCompanyDomain('aman@sub.hbplus.fit')).toBe(false);
      expect(validateCompanyDomain('aman@dev.hbplus.fit')).toBe(false);
    });

    it('rejects empty or invalid inputs', () => {
      expect(validateCompanyDomain('')).toBe(false);
      expect(validateCompanyDomain(null)).toBe(false);
      expect(validateCompanyDomain(undefined)).toBe(false);
      expect(validateCompanyDomain('@hbplus.fit')).toBe(false);
    });
  });

  describe('validateVerifiedGoogleAccount', () => {
    it('accepts verified user with valid @hbplus.fit email', () => {
      const result = validateVerifiedGoogleAccount({
        email: 'aman@hbplus.fit',
        emailVerified: true,
      });

      expect(result.isValid).toBe(true);
      expect(result.normalizedEmail).toBe('aman@hbplus.fit');
      expect(result.domain).toBe('hbplus.fit');
      expect(result.error).toBeUndefined();
    });

    it('rejects unverified email even if domain matches', () => {
      const result = validateVerifiedGoogleAccount({
        email: 'aman@hbplus.fit',
        emailVerified: false,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not verified');
    });

    it('rejects unauthorized domain with exact user-facing message', () => {
      const result = validateVerifiedGoogleAccount({
        email: 'aman@gmail.com',
        emailVerified: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Access restricted. Please login using your official domain email.');
    });

    it('rejects missing email cleanly', () => {
      const result = validateVerifiedGoogleAccount({
        email: null,
        emailVerified: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
