import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolveMailTransport, MAIL } from '../src/config/env.js';

/**
 * Suite unit R-02: resolusi transport email fail-fast (Fase 0).
 *
 * `resolveMailTransport` adalah fungsi murni sehingga seluruh kombinasi
 * environment dapat diuji tanpa `child_process` maupun database:
 *
 * | NODE_ENV    | MAIL_TRANSPORT | Perilaku                                    |
 * |-------------|----------------|---------------------------------------------|
 * | test        | apa pun        | `memory`                                    |
 * | production  | tidak diset    | default `smtp`; gagal bila SMTP_HOST kosong |
 * | production  | log            | diizinkan + console.warn kebocoran token    |
 * | production  | smtp           | gagal bila SMTP_HOST kosong                 |
 * | development | tidak diset    | `log`                                       |
 */
describe('R-02: resolusi transport email fail-fast', () => {
  test('NODE_ENV=test dipaksa memory apa pun nilai MAIL_TRANSPORT', () => {
    for (const mailTransport of [undefined, '', 'smtp', 'log', 'memory', ' nonsense ']) {
      assert.equal(
        resolveMailTransport({ nodeEnv: 'test', mailTransport, smtpHost: '' }),
        'memory',
        `test harus selalu memory (mailTransport=${mailTransport})`
      );
    }
  });

  test('production tanpa MAIL_TRANSPORT default ke smtp dan gagal bila SMTP_HOST kosong', () => {
    assert.equal(
      resolveMailTransport({ nodeEnv: 'production', mailTransport: undefined, smtpHost: 'smtp.kampus.ac.id' }),
      'smtp'
    );
    assert.throws(() => resolveMailTransport({ nodeEnv: 'production', mailTransport: undefined, smtpHost: '' }), /SMTP_HOST/);
    assert.throws(() => resolveMailTransport({ nodeEnv: 'production', mailTransport: undefined }), /SMTP_HOST/);
  });

  test('production dengan MAIL_TRANSPORT=smtp tetap gagal bila SMTP_HOST kosong', () => {
    assert.equal(
      resolveMailTransport({ nodeEnv: 'production', mailTransport: 'smtp', smtpHost: 'smtp.kampus.ac.id' }),
      'smtp'
    );
    assert.throws(() => resolveMailTransport({ nodeEnv: 'production', mailTransport: 'smtp', smtpHost: '' }), /SMTP_HOST/);
  });

  test('production dengan MAIL_TRANSPORT=log diizinkan tetapi memunculkan console.warn', () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (message) => warnings.push(message);
    try {
      assert.equal(
        resolveMailTransport({ nodeEnv: 'production', mailTransport: 'log', smtpHost: '' }),
        'log'
      );
    } finally {
      console.warn = originalWarn;
    }

    assert.equal(warnings.length, 1, 'harus tepat satu peringatan');
    assert.match(warnings[0], /production/i);
    assert.match(warnings[0], /token reset|log/i);
  });

  test('production dengan MAIL_TRANSPORT=memory diizinkan tetapi memunculkan console.warn', () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (message) => warnings.push(message);
    try {
      assert.equal(
        resolveMailTransport({ nodeEnv: 'production', mailTransport: 'memory', smtpHost: '' }),
        'memory'
      );
    } finally {
      console.warn = originalWarn;
    }

    assert.equal(warnings.length, 1, 'harus tepat satu peringatan');
    assert.match(warnings[0], /production/i);
  });

  test('production dengan nilai tidak valid jatuh ke default smtp (fail-fast)', () => {
    assert.equal(
      resolveMailTransport({ nodeEnv: 'production', mailTransport: 'print', smtpHost: 'smtp.kampus.ac.id' }),
      'smtp'
    );
    assert.throws(() => resolveMailTransport({ nodeEnv: 'production', mailTransport: 'print', smtpHost: '' }), /SMTP_HOST/);
  });

  test('development tanpa MAIL_TRANSPORT tetap log (perilaku lama)', () => {
    assert.equal(resolveMailTransport({ nodeEnv: 'development', mailTransport: undefined, smtpHost: '' }), 'log');
    assert.equal(resolveMailTransport({ nodeEnv: 'development', mailTransport: '', smtpHost: '' }), 'log');
  });

  test('development dengan nilai tidak valid jatuh ke log (perilaku lama)', () => {
    assert.equal(
      resolveMailTransport({ nodeEnv: 'development', mailTransport: 'print', smtpHost: '' }),
      'log'
    );
  });

  test('development dengan MAIL_TRANSPORT=smtp tanpa SMTP_HOST tetap ditolak', () => {
    assert.equal(
      resolveMailTransport({ nodeEnv: 'development', mailTransport: 'smtp', smtpHost: 'localhost' }),
      'smtp'
    );
    assert.throws(() => resolveMailTransport({ nodeEnv: 'development', mailTransport: 'smtp', smtpHost: '' }), /SMTP_HOST/);
  });

  test('nilai MAIL_TRANSPORT dinormalisasi (spasi dan huruf besar)', () => {
    assert.equal(
      resolveMailTransport({ nodeEnv: 'development', mailTransport: ' SMTP ', smtpHost: 'localhost' }),
      'smtp'
    );
    assert.equal(resolveMailTransport({ nodeEnv: 'development', mailTransport: '  LOG  ' }), 'log');
  });

  test('runtime efektif pada pengujian adalah memory (MAIL.TRANSPORT)', () => {
    assert.equal(MAIL.TRANSPORT, 'memory');
  });
});
