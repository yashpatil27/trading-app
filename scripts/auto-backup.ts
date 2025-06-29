#!/usr/bin/env npx tsx

import { createBackup } from './backup-database';
import { readdirSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = join(process.cwd(), 'backups');
const MAX_BACKUPS = 10; // Keep only the 10 most recent backups

function cleanupOldBackups() {
  try {
    const backups = readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
      .map(file => ({
        filename: file,
        path: join(BACKUP_DIR, file),
        created: statSync(join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.created.getTime() - a.created.getTime());

    if (backups.length > MAX_BACKUPS) {
      const toDelete = backups.slice(MAX_BACKUPS);
      console.log(`🧹 Cleaning up ${toDelete.length} old backup(s)...`);
      
      toDelete.forEach(backup => {
        unlinkSync(backup.path);
        // Also delete corresponding SQL file
        const sqlFile = backup.path.replace('.db', '.sql');
        try {
          unlinkSync(sqlFile);
        } catch (error) {
          // SQL file might not exist, ignore error
        }
        console.log(`   Deleted: ${backup.filename}`);
      });
    }
  } catch (error) {
    console.error('Warning: Failed to cleanup old backups:', error);
  }
}

function autoBackup() {
  console.log('🔄 Starting automatic backup...');
  
  const backup = createBackup('auto');
  cleanupOldBackups();
  
  console.log(`✅ Automatic backup completed at ${new Date().toLocaleString()}`);
  return backup;
}

// CLI usage
if (require.main === module) {
  autoBackup();
}

export { autoBackup, cleanupOldBackups };
