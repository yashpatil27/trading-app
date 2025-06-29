#!/usr/bin/env npx tsx

import { execSync } from 'child_process';
import { existsSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createBackup } from './backup-database';

const BACKUP_DIR = join(process.cwd(), 'backups');
const DB_PATH = join(process.cwd(), 'prisma', 'dev.db');

function listBackups() {
  if (!existsSync(BACKUP_DIR)) {
    console.log('❌ No backups directory found');
    return [];
  }

  const files = readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.db'))
    .map(file => {
      const filePath = join(BACKUP_DIR, file);
      const stats = statSync(filePath);
      return {
        filename: file,
        path: filePath,
        created: stats.mtime,
        size: stats.size
      };
    })
    .sort((a, b) => b.created.getTime() - a.created.getTime());

  return files;
}

function displayBackups() {
  const backups = listBackups();
  
  if (backups.length === 0) {
    console.log('❌ No backups found');
    return;
  }

  console.log('\n📁 Available backups:');
  console.log('═'.repeat(80));
  
  backups.forEach((backup, index) => {
    const sizeKB = (backup.size / 1024).toFixed(2);
    console.log(`${index + 1}. ${backup.filename}`);
    console.log(`   Created: ${backup.created.toLocaleString()}`);
    console.log(`   Size: ${sizeKB} KB`);
    console.log('');
  });
}

async function restoreFromBackup(backupFile?: string) {
  // Create a backup of current database before restore
  console.log('🔄 Creating backup of current database before restore...');
  await createBackup('before_restore');

  let backupPath: string;

  if (backupFile) {
    // Use specified backup file
    if (backupFile.includes('/')) {
      backupPath = backupFile;
    } else {
      backupPath = join(BACKUP_DIR, backupFile);
    }
  } else {
    // Use most recent backup
    const backups = listBackups();
    if (backups.length === 0) {
      console.log('❌ No backups available for restore');
      return;
    }
    backupPath = backups[0].path;
    console.log(`🔄 Using most recent backup: ${backups[0].filename}`);
  }

  if (!existsSync(backupPath)) {
    console.log(`❌ Backup file not found: ${backupPath}`);
    return;
  }

  try {
    // Stop any running applications first (optional warning)
    console.log('⚠️  Make sure to stop your application server before restore!');
    
    // Restore the database
    copyFileSync(backupPath, DB_PATH);
    
    // Regenerate Prisma client to ensure compatibility
    console.log('🔄 Regenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('✅ Database restored successfully!');
    console.log(`   Restored from: ${backupPath}`);
    console.log('');
    console.log('🔄 Please restart your application server now.');
    
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  const backupFile = process.argv[3];

  if (command === 'list') {
    displayBackups();
  } else if (command === 'restore') {
    restoreFromBackup(backupFile);
  } else {
    console.log('Usage:');
    console.log('  npx tsx scripts/restore-database.ts list');
    console.log('  npx tsx scripts/restore-database.ts restore [backup-filename]');
    console.log('');
    console.log('If no backup filename is provided, the most recent backup will be used.');
  }
}

export { restoreFromBackup, listBackups };
