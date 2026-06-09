/**
 * Run this ONCE if you're seeing duplicate key errors on custom_alias.
 * It drops the old broken index and lets Mongoose recreate the correct sparse+unique one.
 * 
 * Usage: node fix-indexes.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urlsnip');
  console.log('✅ Connected');

  const db = mongoose.connection.db;
  const collection = db.collection('urls');

  // List current indexes
  const indexes = await collection.indexes();
  console.log('Current indexes:', indexes.map(i => ({ name: i.name, key: i.key, unique: i.unique, sparse: i.sparse })));

  // Drop any bad custom_alias index (not sparse)
  for (const idx of indexes) {
    if (idx.key?.custom_alias !== undefined && !idx.sparse) {
      console.log(`Dropping bad index: ${idx.name}`);
      await collection.dropIndex(idx.name);
    }
  }

  // Also null out any stored null/empty values (fix existing bad data)
  const result = await collection.updateMany(
    { custom_alias: { $in: [null, '', ' '] } },
    { $unset: { custom_alias: '' } }
  );
  console.log(`✅ Cleaned ${result.modifiedCount} documents with null/empty aliases`);

  console.log('✅ Done. Restart the server — Mongoose will recreate the correct index.');
  process.exit(0);
}

fixIndexes().catch(err => { console.error(err); process.exit(1); });
