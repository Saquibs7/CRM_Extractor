import { describe, test, expect } from '@jest/globals';
import {
  validateCRMStatus,
  validateEmail,
  validateMobile,
  shouldSkipRecord,
} from '../src/utils/crm-rules';

describe('CRM Rules', () => {
  describe('validateCRMStatus', () => {
    test('should accept valid CRM statuses', () => {
      expect(validateCRMStatus('GOOD_LEAD_FOLLOW_UP')).toBe(true);
      expect(validateCRMStatus('DID_NOT_CONNECT')).toBe(true);
      expect(validateCRMStatus('BAD_LEAD')).toBe(true);
      expect(validateCRMStatus('SALE_DONE')).toBe(true);
    });

    test('should reject invalid CRM statuses', () => {
      expect(validateCRMStatus('INVALID')).toBe(false);
      expect(validateCRMStatus('')).toBe(false);
      expect(validateCRMStatus(undefined)).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('should accept valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validateMobile', () => {
    test('should accept valid mobile numbers', () => {
      expect(validateMobile('9876543210')).toBe(true);
      expect(validateMobile('+91-9876543210')).toBe(true);
    });

    test('should reject invalid mobile numbers', () => {
      expect(validateMobile('123')).toBe(false);
      expect(validateMobile('')).toBe(false);
    });
  });

  describe('shouldSkipRecord', () => {
    test('should skip records without email and mobile', () => {
      expect(shouldSkipRecord(undefined, undefined)).toBe(true);
      expect(shouldSkipRecord('', '')).toBe(true);
    });

    test('should not skip records with email', () => {
      expect(shouldSkipRecord('test@example.com', undefined)).toBe(false);
    });

    test('should not skip records with mobile', () => {
      expect(shouldSkipRecord(undefined, '9876543210')).toBe(false);
    });
  });
});
