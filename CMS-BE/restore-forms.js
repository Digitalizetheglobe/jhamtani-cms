/**
 * Restore dynamicforms collection from BSON backup file.
 * Usage: node restore-forms.js
 */
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const BSON = require('bson');

// Load .env manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const eqIndex = line.indexOf('=');
  if (eqIndex === -1) return;
  const key = line.substring(0, eqIndex).trim();
  const value = line.substring(eqIndex + 1).trim();
  envVars[key] = value;
});

const MONGO_URI = envVars.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI not found in .env');
  process.exit(1);
}

const BSON_FILE = path.join(__dirname, 'backup', 'risingcms', 'dynamicforms.bson');

/**
 * Parse a mongodump BSON file into an array of documents.
 * mongodump writes documents as consecutive BSON documents in a single file.
 * Each document is prefixed with a 4-byte little-endian int32 size.
 */
function parseBsonFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const docs = [];
  let offset = 0;

  while (offset < buffer.length) {
    // Read the 4-byte document size (little-endian)
    const docSize = buffer.readInt32LE(offset);
    if (docSize <= 0 || offset + docSize > buffer.length) {
      console.warn(`Warning: unexpected BSON document size ${docSize} at offset ${offset}. Stopping.`);
      break;
    }
    const docBuffer = buffer.slice(offset, offset + docSize);
    const doc = BSON.deserialize(docBuffer);
    docs.push(doc);
    offset += docSize;
  }

  return docs;
}

async function main() {
  console.log('=== DynamicForms Restore Script ===\n');

  // 1. Parse the BSON file
  console.log(`Reading BSON file: ${BSON_FILE}`);
  if (!fs.existsSync(BSON_FILE)) {
    console.error(`ERROR: BSON file not found at ${BSON_FILE}`);
    process.exit(1);
  }

  const docs = parseBsonFile(BSON_FILE);
  console.log(`Found ${docs.length} document(s) in backup.\n`);

  if (docs.length === 0) {
    console.log('No documents to restore.');
    process.exit(0);
  }

  // Print what we found
  docs.forEach((doc, i) => {
    console.log(`  [${i + 1}] _id: ${doc._id}  |  title: "${doc.title || doc.name || 'N/A'}"  |  page: "${doc.page || 'N/A'}"`);
  });
  console.log('');

  // 2. Connect to MongoDB
  console.log(`Connecting to MongoDB...`);
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected successfully.\n');

  const db = client.db(); // Uses the DB from the connection string
  const collection = db.collection('dynamicforms');

  // 3. Check existing documents
  const existingCount = await collection.countDocuments();
  console.log(`Existing documents in 'dynamicforms' collection: ${existingCount}\n`);

  // 4. Restore documents (upsert to avoid duplicates)
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const doc of docs) {
    try {
      const result = await collection.replaceOne(
        { _id: doc._id },
        doc,
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        console.log(`  ✅ Inserted: ${doc._id} ("${doc.title || doc.name || 'N/A'}")`);
        inserted++;
      } else if (result.modifiedCount > 0) {
        console.log(`  🔄 Updated: ${doc._id} ("${doc.title || doc.name || 'N/A'}")`);
        updated++;
      } else {
        console.log(`  ⏭️  Unchanged: ${doc._id} ("${doc.title || doc.name || 'N/A'}")`);
      }
    } catch (err) {
      console.error(`  ❌ Error restoring ${doc._id}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n=== Restore Complete ===`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated:  ${updated}`);
  console.log(`  Errors:   ${errors}`);

  // 5. Verify final state
  const finalCount = await collection.countDocuments();
  console.log(`  Total documents in collection: ${finalCount}\n`);

  // List all form IDs in the DB now
  const allForms = await collection.find({}, { projection: { _id: 1, title: 1, page: 1 } }).toArray();
  console.log('Current forms in database:');
  allForms.forEach(f => {
    console.log(`  - ${f._id}  |  "${f.title || 'N/A'}"  |  page: "${f.page || 'N/A'}"`);
  });

  await client.close();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
