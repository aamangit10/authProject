/**
 * DomainGuard — Strict Domain Validation Utilities
 * 
 * Enforces company boundary validation for Google SSO accounts.
 * Primary domain: hbplus.fit
 */

export const ALLOWED_DOMAIN = 'hbplus.fit';
export const ALLOWED_DOMAIN_SUFFIX = `@${ALLOWED_DOMAIN}`;

/**
 * Normalizes email by removing leading/trailing whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
}

/**
 * Safely extracts the domain part of an email address.
 * Rejects malformed addresses, multiple '@' symbols, or missing domain parts.
 */
export function extractDomain(email: string | null | undefined): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  // Split on '@' and ensure exactly two parts (user and domain)
  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return null;
  }

  const [username, domain] = parts;
  if (!username || !domain) {
    return null;
  }

  // Domain cannot contain whitespace, slashes, or invalid characters
  if (/\s|[/\\:]/.test(domain)) {
    return null;
  }

  return domain;
}

/**
 * Validates that an email belongs STRICTLY to the target company domain.
 * 
 * Rules:
 * 1. Email must not be empty or non-string.
 * 2. Normalizes casing and whitespace.
 * 3. Must have exactly one '@' separator.
 * 4. The domain must match targetDomain exactly (e.g. 'hbplus.fit').
 *    - Rejects subdomains (e.g. 'employee@sub.hbplus.fit')
 *    - Rejects suffix spoofing (e.g. 'aman@fakehbplus.fit', 'aman@hbplus.fit.evil.com')
 *    - Rejects prefix spoofing (e.g. 'aman@attackerhbplus.fit')
 * 5. Uses strict endsWith(`@${targetDomain}`) check in combination with exact domain match.
 */
export function validateCompanyDomain(
  email: string | null | undefined,
  targetDomain: string = ALLOWED_DOMAIN
): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }

  const cleanTargetDomain = targetDomain.trim().toLowerCase();
  const expectedSuffix = `@${cleanTargetDomain}`;

  // 1. Must end with exact @domain
  if (!normalized.endsWith(expectedSuffix)) {
    return false;
  }

  // 2. Validate exact domain part matches to prevent any sneaky regex/character bypasses
  const domainPart = extractDomain(normalized);
  if (domainPart !== cleanTargetDomain) {
    return false;
  }

  // 3. Username must not be empty
  const username = normalized.substring(0, normalized.length - expectedSuffix.length);
  if (!username || username.trim().length === 0) {
    return false;
  }

  return true;
}

export interface DomainValidationResult {
  isValid: boolean;
  normalizedEmail: string;
  domain: string | null;
  error?: string;
}

/**
 * Comprehensive account verification check for Google SSO tokens.
 */
export function validateVerifiedGoogleAccount(account: {
  email: string | null | undefined;
  emailVerified: boolean | undefined;
}): DomainValidationResult {
  const normalized = normalizeEmail(account.email);
  const domain = extractDomain(normalized);

  if (!normalized) {
    return {
      isValid: false,
      normalizedEmail: '',
      domain: null,
      error: 'Email address was not provided by Google.',
    };
  }

  // Verified email check
  if (!account.emailVerified) {
    return {
      isValid: false,
      normalizedEmail: normalized,
      domain,
      error: 'Access restricted. Google account email is not verified.',
    };
  }

  // Exact domain check
  const isDomainAllowed = validateCompanyDomain(normalized, ALLOWED_DOMAIN);
  if (!isDomainAllowed) {
    return {
      isValid: false,
      normalizedEmail: normalized,
      domain,
      error: 'Access restricted. Please login using your official domain email.',
    };
  }

  return {
    isValid: true,
    normalizedEmail: normalized,
    domain,
  };
}
