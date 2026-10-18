import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswordComplexity } from '../src/utils/password.js';

describe('Fase 3 Improvements - Validasi & Rate Limiting Optimization', () => {

  // =========================================================================
  // 1. Password Complexity Validation Tests
  // =========================================================================
  describe('1. Validasi Kompleksitas Password (SRS Bab 35)', () => {

    test('Password yang kuat lolos semua validasi', () => {
      const strongPassword = 'SecurePass123!';
      const result = validatePasswordComplexity(strongPassword);

      assert.equal(result.isValid, true);
      assert.match(result.message, /memenuhi semua persyaratan/i);
    });

    test('Password terlalu pendek (kurang dari 8 karakter)', () => {
      const result = validatePasswordComplexity('Short1!');
      assert.equal(result.isValid, false);
      assert.match(result.message, /minimal 8 karakter/i);
    });

    test('Password tanpa huruf besar', () => {
      const result = validatePasswordComplexity('password123!');
      assert.equal(result.isValid, false);
      assert.match(result.message, /huruf besar/i);
    });

    test('Password tanpa huruf kecil', () => {
      const result = validatePasswordComplexity('PASSWORD123!');
      assert.equal(result.isValid, false);
      assert.match(result.message, /huruf kecil/i);
    });

    test('Password tanpa angka', () => {
      const result = validatePasswordComplexity('Password!');
      assert.equal(result.isValid, false);
      assert.match(result.message, /angka/i);
    });

    test('Password tanpa simbol spesial', () => {
      const result = validatePasswordComplexity('Password123');
      assert.equal(result.isValid, false);
      // Password123 gagal karena tidak ada simbol, bukan karena password umum
      assert.match(result.message, /simbol khusus/i);
    });

    test('Password umum tetap diblokir oleh requirements validation', () => {
      // Password umum seperti 'password123' gagal karena tidak memenuhi requirements
      // (tidak ada huruf besar, tidak ada simbol) bukan karena "password umum"
      const commonPasswords = [
        { password: 'password123', expectedError: /huruf besar.*simbol khusus/i },
        { password: '12345678', expectedError: /huruf besar.*huruf kecil.*simbol khusus/i },
        { password: 'admin123', expectedError: /huruf besar.*simbol khusus/i },
        { password: 'qwerty123', expectedError: /huruf besar.*simbol khusus/i }
      ];

      commonPasswords.forEach(({ password, expectedError }) => {
        const result = validatePasswordComplexity(password);
        assert.equal(result.isValid, false);
        assert.match(result.message, expectedError);
      });
    });

    test('Edge cases: null, undefined, empty string', () => {
      assert.equal(validatePasswordComplexity(null).isValid, false);
      assert.equal(validatePasswordComplexity(undefined).isValid, false);
      assert.equal(validatePasswordComplexity('').isValid, false);
    });
  });
});

// Rate limiting tests akan diintegrasikan dalam test fase 3 utama
// Audit log error handling tests akan diintegrasikan dalam test fase 3 utama