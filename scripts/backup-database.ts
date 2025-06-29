#!/usr/bin/env npx tsx

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = join(process.cwd(), 'backups');
const DB_PATH = join(process.cwd(), 'prisma', 'dev.db');

function ensureBackupDir() {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function createBackup(description?: string) {
  ensureBackupDir();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const desc = description ? `_${description.replace(/[^a-zA-Z0-9-_]/g, '_')}` : '';
  const backupFileName = `backup_${timestamp}${desc}.db`;
  const backupPath = join(BACKUP_DIR, backupFileName);
  
  try {
    // Copy the SQLite database file
    copyFileSync(DB_PATH, backupPath);
    
    // Create a SQL dump as well for additional safety
    const sqlDumpPath = backupPath.replace('.db', '.sql');
    execSync(`sqlite3 "${DB_PATH}" .dump > "${sqlDumpPath}"`);
    
    console.log('✅ Database backup created successfully:');
    console.log(`   SQLite file: ${backupFileName}`);
    console.log(`   SQL dump: ${backupFileName.replace('.db', '.sql')}`);
    console.log(`   Location: ${BACKUP_DIR}`);
    
    return {
      dbFile: backupPath,
      sqlFile: sqlDumpPath,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const description = process.argv[2];
  createBackup(description);
}

export { createBackup };
