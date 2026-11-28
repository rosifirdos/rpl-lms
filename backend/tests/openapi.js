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
]);

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
