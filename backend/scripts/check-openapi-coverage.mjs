// Skrip verifikasi cakupan dokumentasi OpenAPI vs endpoint yang diuji
import fs from 'fs';

const yamlContent = fs.readFileSync('./docs/openapi.yaml', 'utf8');
const docPaths = new Set(
  [...yamlContent.matchAll(/^  (\/[a-zA-Z0-9\/\-{}]+):\s*$/gm)].map((m) => m[1])
);

const testFiles = ['phase2', 'phase3', 'phase4', 'phase5', 'phase6'].map(
  (f) => `./tests/${f}.test.js`
);

const allEndpoints = new Set();

// Cocokkan `fetch(`${baseUrl}/...`)` termasuk yang memuat segmen variabel
// (mis. `${baseUrl}/api/v1/users/${userId}/roles`).
const reTemplate = /fetch\(`\$\{baseUrl\}([^`]*)`/g;
// Cocokkan `fetch(baseUrl + '...')` (gaya penulisan fase 3).
const reConcat = /fetch\(baseUrl \+ '([^']*)'/g;
// Segmen variabel selain baseUrl di dalam path (mis. ${testFakultasId}).
const reVarSegment = /\$\{[^}]+\}/;

for (const f of testFiles) {
  const c = fs.readFileSync(f, 'utf8');
  for (const m of c.matchAll(reTemplate)) allEndpoints.add(m[1]);
  for (const m of c.matchAll(reConcat)) allEndpoints.add(m[1]);
}

const normalized = new Set();
for (const ep of allEndpoints) {
  const base = ep.split('?')[0];
  const segs = base.split('/').map((s) => {
    // Segmen variabel template, mis. ${testFakultasId}
    if (reVarSegment.test(s)) return '{id}';
    // UUID literal, mis. 550e8400-e29b-41d4-a716-446655440000
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return '{id}';
    return s;
  });
  const joined = segs.join('/');
  // Abaikan path yang tidak lengkap (hanya placeholder tanpa prefix /api atau /health).
  if (/^\/(api|health)/.test(joined)) {
    normalized.add(joined);
  }
}

// Endpoint alias konseptual SRS Bab 32 (didokumentasikan di info.description),
// bukan path tersendiri di OpenAPI.
const SRS_ALIASES = new Set([
  '/api/login',
  '/api/logout',
  '/api/profile',
  '/api/calendar',
  '/api/dashboard',
  '/api/portal/modules',
  // route fixture untuk menguji penanganan 404
  '/api/v1/nonexistent',
]);

const missing = [...normalized].filter((ep) => {
  if (SRS_ALIASES.has(ep)) return false;
  if (ep === '/health' || ep === '/api/v1') return false;
  const asId = ep.replace(/\/[^\/]+$/, '/{id}');
  return !docPaths.has(ep) && !docPaths.has(asId);
});

console.log('Documented paths in OpenAPI      :', docPaths.size);
console.log('Unique endpoints exercised in tests:', normalized.size);
console.log('Undocumented endpoints           :', missing.length);
if (missing.length) {
  console.log(missing.join('\n'));
  process.exitCode = 1;
} else {
  console.log('=> ALL TESTED ENDPOINTS ARE DOCUMENTED');
}
