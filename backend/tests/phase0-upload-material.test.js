import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { uploadMaterial } from '../src/middlewares/upload.middleware.js';
import { errorHandler } from '../src/middlewares/error.middleware.js';

/**
 * Fase 0 MVP 2 — Middleware `uploadMaterial` (BR-007, BR-009).
 *
 * Endpoint materi baru mendarat pada Fase 3, jadi middleware ini diuji pada
 * aplikasi Express minimal yang berdiri sendiri: tanpa autentikasi, tanpa
 * database, dan tanpa rate limiter global. Berkas hanya ditahan di memory
 * storage — suite ini tidak menulis apa pun ke `storage/private/materials/`,
 * sehingga tidak meninggalkan artefak uji.
 *
 * Pola permintaan mengikuti suite avatar pada `phase2.test.js` (fetch +
 * FormData), agar perilaku multipart yang diuji identik dengan produksi.
 */

let server;
let baseUrl;

/** Buffer kecil agar hemat memori; isinya tidak diperiksa middleware. */
const SMALL_PDF = Buffer.from('%PDF-1.4\n% konten materi uji Fase 0\n');

/**
 * Mengirim satu berkas ke endpoint uji.
 *
 * @param {{field?: string, filename: string, contentType?: string, content?: Buffer}} part
 * @returns {Promise<Response>}
 */
function upload({ field = 'file', filename, contentType = 'application/octet-stream', content = SMALL_PDF }) {
  const formData = new FormData();
  formData.append(field, new Blob([content], { type: contentType }), filename);

  return fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });
}

describe('Fase 0: Middleware uploadMaterial (BR-007, BR-009)', () => {
  before(async () => {
    const app = express();
    app.post('/upload', uploadMaterial, (req, res) => {
      res.json({
        success: true,
        data: {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          size: req.file.size,
        },
      });
    });
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Ekstensi berkas yang diizinkan (.pdf/.docx/.xlsx/.zip)', () => {
    for (const filename of ['materi.pdf', 'modul.docx', 'nilai.xlsx', 'arsip.zip', 'HURUF-BESAR.PDF']) {
      test(`menerima berkas ${filename}`, async () => {
        const res = await upload({ filename });
        const json = await res.json();

        assert.equal(res.status, 200, `"${filename}" seharusnya diterima`);
        assert.equal(json.success, true);
        assert.equal(json.data.fieldname, 'file');
        assert.equal(json.data.originalname, filename);
        assert.equal(json.data.size, SMALL_PDF.length);
      });
    }
  });

  describe('2. Penolakan format berkas di luar whitelist', () => {
    for (const filename of ['materi.txt', 'gambar.jpg', 'skrip.exe', 'tanpa-ekstensi']) {
      test(`menolak berkas ${filename} dengan 400`, async () => {
        const res = await upload({ filename, contentType: 'text/plain' });
        const json = await res.json();

        assert.equal(res.status, 400, `"${filename}" seharusnya ditolak`);
        assert.equal(json.success, false);
        assert.match(json.message, /Format berkas tidak didukung/i);
        assert.match(json.message, /\.pdf, \.docx, \.xlsx, atau \.zip/i);
      });
    }
  });

  describe('3. Batas ukuran 10MB (BR-007)', () => {
    test('menolak berkas melebihi 10MB dengan pesan batas yang benar', async () => {
      const oversized = Buffer.alloc(10 * 1024 * 1024 + 1024, 0x61);
      const res = await upload({ filename: 'materi-besar.pdf', contentType: 'application/pdf', content: oversized });
      const json = await res.json();

      assert.equal(res.status, 400);
      assert.equal(json.success, false);
      assert.match(json.message, /maksimal 10MB/i);
    });
  });

  describe('4. Berkas wajib diunggah', () => {
    test('menolak request tanpa berkas dengan 400', async () => {
      const formData = new FormData();
      formData.append('title', 'Modul 1');

      const res = await fetch(`${baseUrl}/upload`, { method: 'POST', body: formData });
      const json = await res.json();

      assert.equal(res.status, 400);
      assert.equal(json.success, false);
      assert.match(json.message, /wajib diunggah/i);
    });
  });

  describe('5. Nama field multipart', () => {
    test('menolak berkas pada field selain "file" dengan 400', async () => {
      const res = await upload({ field: 'materi', filename: 'materi.pdf', contentType: 'application/pdf' });
      const json = await res.json();

      assert.equal(res.status, 400);
      assert.equal(json.success, false);
      assert.match(json.message, /Kesalahan unggah berkas/i);
    });
  });
});