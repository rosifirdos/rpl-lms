import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUDIT_ENTITIES,
  AUDIT_ENTITY_VALUES,
  isKnownAuditEntity,
  normalizeAuditEntity,
} from '../src/constants/auditEntities.js';

/**
 * Fase 0 MVP 2 — Konvensi penamaan `audit_logs.entity`.
 *
 * Tujuan suite ini: mengunci konvensi (huruf kecil, jamak) sebelum Fase 2–5
 * dikerjakan paralel, sehingga filter `GET /api/admin/audit-logs?entity=`
 * tetap berfungsi seragam untuk entitas baru.
 */

describe('Fase 0: Konvensi Penamaan entity pada audit_logs', () => {
  test('seluruh nilai entity memakai huruf kecil tanpa spasi', () => {
    for (const value of AUDIT_ENTITY_VALUES) {
      assert.equal(value, value.toLowerCase(), `"${value}" harus huruf kecil`);
      assert.doesNotMatch(value, /\s/, `"${value}" tidak boleh mengandung spasi`);
      assert.equal(value, value.trim());
    }
  });

  test('entitas MVP 1 mengikuti penamaan yang sudah dipakai produksi', () => {
    assert.equal(AUDIT_ENTITIES.USERS, 'users');
    assert.equal(AUDIT_ENTITIES.COURSES, 'courses');
    assert.equal(AUDIT_ENTITIES.CLASSES, 'classes');
    assert.equal(AUDIT_ENTITIES.ENROLLMENTS, 'enrollments');
  });

  test('entitas MVP 2 mengikuti konvensi jamak yang disepakati Fase 0', () => {
    assert.equal(AUDIT_ENTITIES.MEETINGS, 'meetings');
    assert.equal(AUDIT_ENTITIES.MATERIALS, 'materials');
    assert.equal(AUDIT_ENTITIES.ATTENDANCE_SESSIONS, 'attendance_sessions');
    assert.equal(AUDIT_ENTITIES.ATTENDANCE_RECORDS, 'attendance_records');
  });

  test('nama entitas baru memakai bentuk jamak (bukan tunggal)', () => {
    const newEntities = [
      AUDIT_ENTITIES.MEETINGS,
      AUDIT_ENTITIES.MATERIALS,
      AUDIT_ENTITIES.ATTENDANCE_SESSIONS,
      AUDIT_ENTITIES.ATTENDANCE_RECORDS,
    ];

    for (const entity of newEntities) {
      assert.match(entity, /s$/, `"${entity}" harus berbentuk jamak`);
    }
  });

  test('normalizeAuditEntity menurunkan kapitalisasi dan memangkas spasi', () => {
    assert.equal(normalizeAuditEntity('Meetings'), 'meetings');
    assert.equal(normalizeAuditEntity('  MATERIALS  '), 'materials');
    assert.equal(normalizeAuditEntity(null), '');
    assert.equal(normalizeAuditEntity(undefined), '');
  });

  test('isKnownAuditEntity mengenali entitas lama maupun baru', () => {
    assert.equal(isKnownAuditEntity('users'), true);
    assert.equal(isKnownAuditEntity('Meetings'), true);
    assert.equal(isKnownAuditEntity('attendance_sessions'), true);
    assert.equal(isKnownAuditEntity('meeting'), false);
    assert.equal(isKnownAuditEntity('attendanceSession'), false);
  });

  test('tidak ada nilai entity yang duplikat', () => {
    assert.equal(new Set(AUDIT_ENTITY_VALUES).size, AUDIT_ENTITY_VALUES.length);
  });
});
