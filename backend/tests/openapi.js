/**
 * Utilitas validasi kontrak OpenAPI untuk suite pengujian.
 *
 * Berbeda dengan pencocokan substring pada berkas mentah, helper di sini
 * benar-benar mem-parse dokumen YAML menjadi objek dan memvalidasi
 * strukturnya, termasuk integritas seluruh `$ref` di dalamnya.
 */
import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';

/** Lokasi kanonik dokumen kontrak OpenAPI. */
export const OPENAPI_PATH = new URL('../docs/openapi.yaml', import.meta.url);

/** Metode HTTP yang dianggap sebagai operasi mutasi (wajib punya requestBody). */
export const MUTATING_METHODS = ['post', 'put', 'patch'];

/** Operasi mutasi yang memang tidak menerima body (mis. refresh/logout berbasis token). */
export const BODYLESS_MUTATIONS = new Set([
  'post /auth/refresh',
  'post /auth/logout',
  'post /meetings/{meetingId}/attendance/close',
  'post /attendance/{sessionId}/check-in',
  'post /quizzes/{id}/attempts',
  'post /quiz-attempts/{attemptId}/submit',
  'patch /notifications/read-all',
  'patch /notifications/{id}/read',
]);

/**
 * Operasi unggah berkas yang body-nya sah menggunakan `multipart/form-data`
 * alih-alih `application/json`.
 */
export const MULTIPART_MUTATIONS = new Map([
  ['post /profile/avatar', 'multipart/form-data'],
  ['post /meetings/{meetingId}/materials', 'multipart/form-data'],
  ['post /meetings/{meetingId}/assignments', 'multipart/form-data'],
  ['put /assignments/{id}', 'multipart/form-data'],
  ['post /assignments/{assignmentId}/submissions', 'multipart/form-data'],
]);

/** Successful operations that return a streamed file instead of ApiResponse JSON. */
export const BINARY_SUCCESS_RESPONSES = new Map([
  ['get /materials/{id}/download', 'application/octet-stream'],
  ['get /assignments/{id}/download', 'application/octet-stream'],
  ['get /submissions/{id}/download', 'application/octet-stream'],
  ['get /profile/avatar', 'image/png'],
  ['get /quizzes/{id}/attempts/export', 'text/csv'],
]);

/**
 * Daftar kanonik seluruh operasi API yang wajib terdokumentasi di
 * `docs/openapi.yaml` (penjaga coverage — Workstream C).
 *
 * Setiap endpoint backend harus terdaftar di sini; `tests/phase6.test.js`
 * memvalidasi dua arah:
 *   1. setiap operasi pada daftar ini ada di dokumen;
 *   2. setiap operasi di dokumen terdaftar di sini (tidak ada yang terlewat).
 *
 * Saat menambah endpoint baru (mis. MVP 4), tambahkan barisnya di sini
 * sekaligus dengan definisi path di YAML.
 */
export const REQUIRED_OPERATIONS = Object.freeze([
  // === MVP 1 — Auth & Profil ===
  ['/auth/login', 'post'],
  ['/auth/refresh', 'post'],
  ['/auth/logout', 'post'],
  ['/auth/forgot-password', 'post'],
  ['/auth/reset-password', 'post'],
  ['/auth/reset-password/validate', 'get'],
  ['/auth/reset-password/validate', 'post'],
  ['/auth/change-password', 'put'],
  ['/profile', 'get'],
  ['/profile', 'put'],
  ['/profile/avatar', 'post'],
  ['/profile/avatar', 'get'],
  ['/profile/password', 'put'],
  // === MVP 1 — Admin: pengguna, mata kuliah, kelas, enrollment, audit ===
  ['/admin/users', 'get'],
  ['/admin/users', 'post'],
  ['/admin/users/{id}', 'get'],
  ['/admin/users/{id}', 'put'],
  ['/admin/users/{id}/status', 'patch'],
  ['/admin/users/{id}/reset-password', 'put'],
  ['/admin/courses', 'get'],
  ['/admin/courses', 'post'],
  ['/admin/courses/{id}', 'get'],
  ['/admin/courses/{id}', 'put'],
  ['/admin/courses/{id}', 'delete'],
  ['/admin/classes', 'get'],
  ['/admin/classes', 'post'],
  ['/admin/classes/{id}', 'get'],
  ['/admin/classes/{id}', 'put'],
  ['/admin/classes/{id}', 'delete'],
  ['/admin/enrollments', 'post'],
  ['/admin/enrollments/{id}', 'delete'],
  ['/admin/classes/{classId}/enrollments', 'get'],
  ['/admin/classes/{classId}/available-students', 'get'],
  ['/admin/config', 'get'],
  ['/admin/config', 'put'],
  ['/admin/audit-logs', 'get'],
  ['/admin/audit-logs/{id}', 'get'],
  ['/dashboard', 'get'],
  ['/classes', 'get'],
  ['/classes/{id}', 'get'],
  // === MVP 2 — Pertemuan, materi, presensi ===
  ['/classes/{classId}/meetings', 'get'],
  ['/classes/{classId}/attendance-recap', 'get'],
  ['/meetings/{id}', 'get'],
  ['/meetings/{id}', 'put'],
  ['/meetings/{meetingId}/materials', 'post'],
  ['/meetings/{meetingId}/attendance/open', 'post'],
  ['/meetings/{meetingId}/attendance/close', 'post'],
  ['/attendance/{sessionId}/check-in', 'post'],
  ['/attendance/{sessionId}/records', 'get'],
  ['/attendance/records/{id}', 'put'],
  ['/materials/{id}', 'put'],
  ['/materials/{id}', 'delete'],
  ['/materials/{id}/download', 'get'],
  // === MVP 3 — Tugas & submission ===
  ['/meetings/{meetingId}/assignments', 'post'],
  ['/classes/{classId}/assignments', 'get'],
  ['/assignments/{id}', 'get'],
  ['/assignments/{id}', 'put'],
  ['/assignments/{id}', 'delete'],
  ['/assignments/{id}/download', 'get'],
  ['/assignments/{assignmentId}/submissions', 'get'],
  ['/assignments/{assignmentId}/submissions', 'post'],
  ['/assignments/{assignmentId}/submission', 'get'],
  ['/submissions/{id}/download', 'get'],
  ['/submissions/{id}/grade', 'put'],
  // === MVP 4 - Timeline, kuis, notifikasi ===
  ['/timeline', 'get'],
  ['/meetings/{meetingId}/quizzes', 'post'],
  ['/classes/{classId}/quizzes', 'get'],
  ['/quizzes/{id}', 'get'],
  ['/quizzes/{id}', 'put'],
  ['/quizzes/{id}', 'delete'],
  ['/quizzes/{id}/publish', 'patch'],
  ['/quizzes/{id}/questions', 'post'],
  ['/quizzes/{id}/questions/{questionId}', 'put'],
  ['/quizzes/{id}/questions/{questionId}', 'delete'],
  ['/quizzes/{id}/attempts', 'get'],
  ['/quizzes/{id}/attempts', 'post'],
  ['/quizzes/{id}/attempts/export', 'get'],
  ['/quiz-attempts/{attemptId}', 'get'],
  ['/quiz-attempts/{attemptId}/answers', 'put'],
  ['/quiz-attempts/{attemptId}/submit', 'post'],
  ['/quiz-attempts/{attemptId}/grade', 'put'],
  ['/notifications', 'get'],
  ['/notifications/unread-count', 'get'],
  ['/notifications/read-all', 'patch'],
  ['/notifications/{id}/read', 'patch'],
]);

/**
 * Operasi yang dapat diakses tanpa token (publik atau auth opsional).
 * Operasi di luar daftar ini wajib mendeklarasikan `security: bearerAuth`.
 */
export const PUBLIC_OPERATIONS = Object.freeze(
  new Set([
    'post /auth/login',
    'post /auth/refresh',
    'post /auth/logout',
    'post /auth/forgot-password',
    'post /auth/reset-password',
    'get /auth/reset-password/validate',
    'post /auth/reset-password/validate',
  ])
);

/**
 * Membaca dan mem-parse `docs/openapi.yaml` menjadi objek JavaScript.
 *
 * @returns {Promise<object>} dokumen OpenAPI ter-parse
 */
export async function loadOpenApiDocument() {
  const source = await readFile(OPENAPI_PATH, 'utf8');
  return parseYaml(source);
}

/**
 * Menelusuri seluruh nilai `$ref` di dalam dokumen (rekursif).
 *
 * @param {unknown} node simpul awal penelusuran
 * @param {string[]} refs akumulator
 * @returns {string[]} seluruh pointer `$ref` yang ditemukan
 */
export function collectRefs(node, refs = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, refs);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') refs.push(value);
      else collectRefs(value, refs);
    }
  }
  return refs;
}

/**
 * Mengikuti sebuah pointer JSON lokal (mis. `#/components/schemas/ApiResponse`)
 * terhadap dokumen akar.
 *
 * @param {object} document dokumen OpenAPI
 * @param {string} pointer pointer lokal berbasis `#/`
 * @returns {unknown} nilai yang ditunjuk, atau `undefined` bila tidak ada
 */
export function resolveJsonPointer(document, pointer) {
  if (typeof pointer !== 'string' || !pointer.startsWith('#/')) return undefined;
  return pointer
    .slice(2)
    .split('/')
    .reduce((current, token) => {
      if (current === null || typeof current !== 'object') return undefined;
      const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
      return Object.prototype.hasOwnProperty.call(current, key) ? current[key] : undefined;
    }, document);
}

/**
 * Mengumpulkan seluruh operasi HTTP pada `document.paths`.
 *
 * @param {object} document dokumen OpenAPI
 * @returns {Array<{path: string, method: string, operation: object, pathItem: object}>}
 */
export function listOperations(document) {
  const operations = [];
  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!pathItem || typeof pathItem !== 'object') continue;
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!MUTATING_METHODS.includes(method) && method !== 'get' && method !== 'delete') continue;
      operations.push({ path, method, operation, pathItem });
    }
  }
  return operations;
}

/**
 * Menyelesaikan parameter sebuah operasi, mengikuti `$ref` bila ada.
 *
 * @param {object} document dokumen OpenAPI
 * @param {object} entry hasil `listOperations`
 * @returns {Array<object>} daftar parameter yang sudah ter-resolve
 */
export function resolveOperationParameters(document, entry) {
  const raw = [...(entry.pathItem?.parameters ?? []), ...(entry.operation?.parameters ?? [])];
  return raw.map((parameter) =>
    parameter && parameter.$ref ? resolveJsonPointer(document, parameter.$ref) : parameter
  );
}

/**
 * Me-resolve `$ref` lalu menggabungkan seluruh cabang `allOf` menjadi satu
 * skema datar (`properties` dan `required`). Tanpa ini, respons berbentuk
 * `allOf: [ApiResponse, { data }]` tidak memperlihatkan properti envelope
 * `success`/`message` kepada pemeriksa kontrak.
 *
 * @param {object} document dokumen OpenAPI
 * @param {object} schema skema masukan (boleh `$ref` maupun `allOf`)
 * @param {Set<string>} visited pointer `$ref` yang sedang ditelusuri (guard siklus)
 * @returns {object|undefined} skema yang sudah digabung
 */
export function flattenSchema(document, schema, visited = new Set()) {
  if (!schema || typeof schema !== 'object') return schema;

  let resolved = schema;
  if (typeof schema.$ref === 'string') {
    if (visited.has(schema.$ref)) return schema;
    resolved = resolveJsonPointer(document, schema.$ref);
    if (!resolved) return schema;
    visited = new Set([...visited, schema.$ref]);
  }

  if (!Array.isArray(resolved.allOf)) {
    return resolved;
  }

  const { allOf, ...base } = resolved;
  const merged = {
    ...base,
    properties: { ...(base.properties ?? {}) },
    required: [...(base.required ?? [])],
  };

  for (const branch of allOf) {
    // Set baru per cabang: guard siklus tetap aktif tanpa saling memblokir
    // bila dua cabang merujuk komponen yang sama.
    const flattened = flattenSchema(document, branch, new Set(visited));
    if (!flattened || typeof flattened !== 'object') continue;

    for (const [key, value] of Object.entries(flattened)) {
      if (key === 'properties' || key === 'required') continue;
      if (merged[key] === undefined) merged[key] = value;
    }
    Object.assign(merged.properties, flattened.properties ?? {});
    for (const field of flattened.required ?? []) {
      if (!merged.required.includes(field)) merged.required.push(field);
    }
  }

  if (merged.required.length === 0) delete merged.required;
  if (Object.keys(merged.properties).length === 0) delete merged.properties;
  return merged;
}

/**
 * Mencari skema JSON di dalam sebuah blok `content`, mengikuti `$ref`, lalu
 * meratakan `allOf` agar seluruh properti envelope dan data terlihat.
 *
 * @param {object} document dokumen OpenAPI
 * @param {object} container objek yang memiliki properti `content`
 * @param {string} mediaType tipe media yang dicari
 * @returns {object|undefined} skema ter-resolve
 */
export function resolveContentSchema(document, container, mediaType = 'application/json') {
  const schema = container?.content?.[mediaType]?.schema;
  if (!schema) return undefined;
  return flattenSchema(document, schema);
}
