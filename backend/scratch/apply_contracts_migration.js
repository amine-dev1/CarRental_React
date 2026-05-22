import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, '../migrations/002_contracts.sql');

async function migrate() {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('Applying migration 002_contracts.sql...');
  
  try {
    await pool.query(sql);
    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
