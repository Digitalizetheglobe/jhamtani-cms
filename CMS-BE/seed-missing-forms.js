/**
 * Seed all missing DynamicForm documents into MongoDB.
 * Uses the exact _id values and field names expected by the website frontend.
 * Usage: node seed-missing-forms.js
 */
const fs   = require('fs');
const path = require('path');
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

// ── Helper to build a simple field ────────────────────────────────────────
const field = (name, label, type, required = true, extra = {}) => ({
  name, label, type,
  placeholder: `Enter ${label.toLowerCase()}`,
  validation: { required },
  isActive: true,
  order: 0,
  ...extra
});

const now = new Date();

// ── Form definitions ───────────────────────────────────────────────────────
// Fields match EXACTLY what each page's handleSubmit() sends in `data: {}`
const FORMS = [

  // ── contact/page.tsx & home/ContactSection/page.tsx ─────────────────────
  // sends: { name, email, phone_number, m }
  {
    _id: new ObjectId('6936a35d0125596fef84aa08'),
    title: 'Contact Form',
    description: 'General contact enquiry form',
    page: 'contact',
    fields: [
      field('name',         'Full Name',    'text',     true),
      field('email',        'Email',        'email',    true),
      field('phone_number', 'Phone Number', 'text',     true),
      field('m',            'Message',      'textarea', true),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── EnquiryForm.tsx (floating button on all pages) ──────────────────────
  // sends: { full_name, email, phone, preferred_location, property_type, message_ }
  {
    _id: new ObjectId('6936a8c20125596fef84aa8f'),
    title: 'General Enquiry Form',
    description: 'Floating enquiry form for real estate enquiries',
    page: 'enquiry',
    fields: [
      field('full_name',          'Full Name',           'text',     true),
      field('email',              'Email',               'email',    true),
      field('phone',              'Phone',               'text',     true),
      field('preferred_location', 'Preferred Location',  'text',     false),
      { name: 'property_type', label: 'Property Type', type: 'select', isActive: true, order: 0,
        validation: { required: true },
        options: [
          { label: 'Plotting',     value: 'plotting' },
          { label: 'Residential',  value: 'residential' },
          { label: 'Commercial',   value: 'commercial' },
        ]
      },
      field('message_',           'Message',             'textarea', true),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── win-vestor/page.tsx ──────────────────────────────────────────────────
  // sends: { full_name, phone_number, email_address, message }
  {
    _id: new ObjectId('6936acdd0125596fef84ab05'),
    title: 'Win-Vestor Enquiry',
    description: 'Interest form for Win-Vestor project',
    page: 'win-vestor',
    fields: [
      field('full_name',     'Full Name',    'text',     true),
      field('phone_number',  'Phone Number', 'text',     true),
      field('email_address', 'Email',        'email',    false),
      field('message',       'Message',      'textarea', false),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── own-edge/page.tsx ────────────────────────────────────────────────────
  // sends: { full_name, phone_number, email_address, message }
  {
    _id: new ObjectId('6936b1410125596fef84abe9'),
    title: 'Own-Edge Enquiry',
    description: 'Interest form for Own-Edge project',
    page: 'own-edge',
    fields: [
      field('full_name',     'Full Name',    'text',     true),
      field('phone_number',  'Phone Number', 'text',     true),
      field('email_address', 'Email',        'email',    false),
      field('message',       'Message',      'textarea', false),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── red-stone/page.tsx ───────────────────────────────────────────────────
  // sends: { full_name, phone_number, email_address, message }
  {
    _id: new ObjectId('6936b24b0125596fef84ac51'),
    title: 'Red-Stone Enquiry',
    description: 'Interest form for Red-Stone project',
    page: 'red-stone',
    fields: [
      field('full_name',     'Full Name',    'text',     true),
      field('phone_number',  'Phone Number', 'text',     true),
      field('email_address', 'Email',        'email',    false),
      field('message',       'Message',      'textarea', false),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── eco-town/page.tsx ────────────────────────────────────────────────────
  // sends: { full_name, phone_number_, email_address, message }  ← note phone_number_ with underscore
  {
    _id: new ObjectId('6936b2d00125596fef84ac9e'),
    title: 'Eco-Town Enquiry',
    description: 'Interest form for Eco-Town project',
    page: 'eco-town',
    fields: [
      field('full_name',     'Full Name',    'text',     true),
      field('phone_number_', 'Phone Number', 'text',     true),
      field('email_address', 'Email',        'email',    false),
      field('message',       'Message',      'textarea', false),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── mountville/page.tsx ──────────────────────────────────────────────────
  // sends: { full_name, phone_number, email_address, message }
  {
    _id: new ObjectId('6936b5080125596fef84ad56'),
    title: 'Mountville Enquiry',
    description: 'Interest form for Mountville project',
    page: 'mountville',
    fields: [
      field('full_name',     'Full Name',    'text',     true),
      field('phone_number',  'Phone Number', 'text',     true),
      field('email_address', 'Email',        'email',    false),
      field('message',       'Message',      'textarea', false),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── 18-aangan/page.tsx ───────────────────────────────────────────────────
  // sends: { full_name, phone_number, email_address, m }  ← note `m` not `message`
  {
    _id: new ObjectId('6936bab80125596fef84adeb'),
    title: '18 Aangan Enquiry',
    description: 'Interest form for 18 Aangan project',
    page: '18-aangan',
    fields: [
      field('full_name',     'Full Name',    'text',     true),
      field('phone_number',  'Phone Number', 'text',     true),
      field('email_address', 'Email',        'email',    false),
      field('m',             'Message',      'textarea', false),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── channel-partner/page.tsx ─────────────────────────────────────────────
  // sends: { full_name, phone_number, email_address, message }
  {
    _id: new ObjectId('6936bd270125596fef84ae8e'),
    title: 'Channel Partner Enquiry',
    description: 'Channel partner registration form',
    page: 'channel-partner',
    fields: [
      field('full_name',     'Full Name',    'text',     true),
      field('phone_number',  'Phone Number', 'text',     true),
      field('email_address', 'Email',        'email',    false),
      field('message',       'Message',      'textarea', false),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── codename-joy-estate/page.tsx ─────────────────────────────────────────
  // sends: { full_name, phone_number, email_address, message }
  {
    _id: new ObjectId('695f8288030d49e1aabe8b68'),
    title: 'Codename Joy Estate Enquiry',
    description: 'Interest form for Codename Joy Estate project',
    page: 'codename-joy-estate',
    fields: [
      field('full_name',     'Full Name',    'text',     true),
      field('phone_number',  'Phone Number', 'text',     true),
      field('email_address', 'Email',        'email',    false),
      field('message',       'Message',      'textarea', false),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },

  // ── win-vestor/contact.tsx ───────────────────────────────────────────────
  // sends: { full_name, phone_number, email_address, message }
  {
    _id: new ObjectId('68d66887c476888712e48f84'),
    title: 'Win-Vestor Contact Form',
    description: 'Dedicated contact form for Win-Vestor page',
    page: 'win-vestor-contact',
    fields: [
      field('full_name',     'Full Name',    'text',     true),
      field('phone_number',  'Phone Number', 'text',     true),
      field('email_address', 'Email',        'email',    false),
      field('message',       'Message',      'textarea', false),
    ],
    emailSettings: { sendEmailOnSubmission: false, recipientEmails: [] },
    isActive: true, createdAt: now, updatedAt: now
  },
];

// ── Run ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Seeding Missing DynamicForms ===\n');
  console.log(`Forms to seed: ${FORMS.length}\n`);

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected to MongoDB.\n');

  const col = client.db().collection('dynamicforms');

  let inserted = 0, skipped = 0, errors = 0;

  for (const form of FORMS) {
    const existing = await col.findOne({ _id: form._id });
    if (existing) {
      console.log(`⏭️  Skip    [${form.page}] ${form._id} — already exists`);
      skipped++;
      continue;
    }
    try {
      await col.insertOne(form);
      console.log(`✅ Inserted [${form.page}] ${form._id} — "${form.title}"`);
      inserted++;
    } catch (err) {
      console.log(`❌ Error   [${form.page}] ${form._id} — ${err.message}`);
      errors++;
    }
  }

  console.log('\n=== Done ===');
  console.log(`  Inserted : ${inserted}`);
  console.log(`  Skipped  : ${skipped}`);
  console.log(`  Errors   : ${errors}`);

  const all = await col.find({}, { projection: { _id: 1, title: 1, page: 1 } }).toArray();
  console.log(`\nTotal forms in DB: ${all.length}`);
  all.forEach(f => console.log(`  ✅ ${f._id}  "${f.title}"  (${f.page})`));

  await client.close();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
