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
export const BODYLESS_MUTATIONS = new Set(['post /auth/refresh', 'post /auth/logout']);

/**
 * Operasi unggah berkas yang body-nya sah menggunakan `multipart/form-data`
 * alih-alih `application/json`.
 */
export const MULTIPART_MUTATIONS = new Map([['post /profile/avatar', 'multipart/form-data']]);

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
 * Mencari skema JSON di dalam sebuah blok `content`, mengikuti `$ref` satu level.
 *
 * @param {object} document dokumen OpenAPI
 * @param {object} container objek yang memiliki properti `content`
 * @param {string} mediaType tipe media yang dicari
 * @returns {object|undefined} skema ter-resolve
 */
export function resolveContentSchema(document, container, mediaType = 'application/json') {
  const schema = container?.content?.[mediaType]?.schema;
  if (!schema) return undefined;
  return schema.$ref ? resolveJsonPointer(document, schema.$ref) : schema;
}
