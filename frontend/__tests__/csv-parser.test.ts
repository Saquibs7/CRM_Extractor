import { describe, test, expect } from '@jest/globals';
import { parseCSV, validateCSV, downloadCSV } from '@/lib/csv-parser';

// Mock Papa Parse
jest.mock('papaparse', () => ({
  parse: jest.fn((file, options) => {
    // Mock implementation
    options.complete({
      data: [
        { email: 'test@example.com', name: 'Test User' },
      ],
      meta: { fields: ['email', 'name'] },
    });
  }),
  unparse: jest.fn((data) => 'email,name\ntest@example.com,Test User'),
}));

describe('CSV Parser', () => {
  test('should validate CSV with headers and data', () => {
    const headers = ['email', 'name'];
    const data = [{ email: 'test@example.com', name: 'Test' }];
    
    expect(validateCSV(headers, data)).toBe(true);
  });

  test('should reject CSV with no headers', () => {
    const headers: string[] = [];
    const data = [{ email: 'test@example.com' }];
    
    expect(validateCSV(headers, data)).toBe(false);
  });

  test('should reject CSV with no data', () => {
    const headers = ['email', 'name'];
    const data: any[] = [];
    
    expect(validateCSV(headers, data)).toBe(false);
  });
});
