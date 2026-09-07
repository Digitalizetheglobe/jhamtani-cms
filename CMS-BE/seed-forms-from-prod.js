/**
 * Fetch missing form definitions from production API and seed local MongoDB.
 * Usage: node seed-forms-from-prod.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { MongoClient, ObjectId } = require('mongodb');

// ── Load .env ──────────────────────────────────────────────────────────────
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const eq = line.indexOf('=');
  if (eq === -1) return;
  envVars[line.substring(0, eq).trim()] = line.substring(eq + 1).trim();
});

const MONGO_URI = envVars.MONGO_URI;
if (!MONGO_URI) { console.error('ERROR: MONGO_URI not in .env'); process.exit(1); }

const PROD_BASE = 'https://api.risingspaces.in/api/forms';

// ── All form IDs used across the website ──────────────────────────────────
const FORM_IDS = [
  { id: '6936a35d0125596fef84aa08', label: 'Home Contact / Contact page' },
  { id: '6936a8c20125596fef84aa8f', label: 'EnquiryForm (floating)' },
  { id: '6936acdd0125596fef84ab05', label: 'Win-vestor' },
  { id: '6936b1410125596fef84abe9', label: 'Own-edge' },
  { id: '6936b24b0125596fef84ac51', label: 'Red-stone' },
  { id: '6936b2d00125596fef84ac9e', label: 'Eco-town' },
  { id: '6936b5080125596fef84ad56', label: 'Mountville' },
  { id: '6936bab80125596fef84adeb', label: '18-aangan' },
  { id: '6936bd270125596fef84ae8e', label: 'Channel-partner' },
  { id: '695f8288030d49e1aabe8b68', label: 'Codename Joy Estate' },
  { id: '68d66887c476888712e48f84', label: 'Win-vestor contact' },
];

// ── HTTP fetch helper ──────────────────────────────────────────────────────
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: null, raw: data });
        }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Request timed out')));
  });
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Seeding Forms from Production ===\n');

  // 1. Connect to local MongoDB
  console.log('Connecting to local MongoDB...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected.\n');

  const db = client.db();
  const col = db.collection('dynamicforms');

  const results = { fetched: 0, inserted: 0, skipped: 0, failed: [] };

  for (const { id, label } of FORM_IDS) {
    process.stdout.write(`Fetching [${label}] (${id})... `);

    // Check if already exists locally
    const existing = await col.findOne({ _id: new ObjectId(id) });
    if (existing) {
      console.log('⏭️  Already in DB, skipping.');
      results.skipped++;
      continue;
    }

    // Fetch from production
    let res;
    try {
      res = await fetchJson(`${PROD_BASE}/${id}`);
    } catch (err) {
      console.log(`❌ Network error: ${err.message}`);
      results.failed.push({ id, label, reason: err.message });
      continue;
    }

    if (res.status !== 200 || !res.body?.data) {
      const reason = res.body?.message || `HTTP ${res.status}`;
      console.log(`❌ ${reason}`);
      results.failed.push({ id, label, reason });
      continue;
    }

    results.fetched++;
    const formData = res.body.data;

    // Ensure _id is an ObjectId when inserting
    formData._id = new ObjectId(id);

    try {
      await col.insertOne(formData);
      console.log(`✅ Inserted ("${formData.title || formData.name || 'N/A'}")`);
      results.inserted++;
    } catch (err) {
      console.log(`❌ Insert failed: ${err.message}`);
      results.failed.push({ id, label, reason: err.message });
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n=== Summary ===');
  console.log(`  Fetched from prod : ${results.fetched}`);
  console.log(`  Inserted locally  : ${results.inserted}`);
  console.log(`  Already existed   : ${results.skipped}`);
  console.log(`  Failed            : ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed forms (will need manual seeding):');
    results.failed.forEach(f => console.log(`  ❌ [${f.label}] ${f.id} — ${f.reason}`));
  }

  // ── Final DB state ───────────────────────────────────────────────────────
  const all = await col.find({}, { projection: { _id: 1, title: 1, page: 1, isActive: 1 } }).toArray();
  console.log(`\nTotal forms in local DB: ${all.length}`);
  all.forEach(f => console.log(`  ✅ ${f._id}  "${f.title || 'N/A'}"  page="${f.page || 'N/A'}"  active=${f.isActive}`));

  await client.close();
  console.log('\nDone.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
