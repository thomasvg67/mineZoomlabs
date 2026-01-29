const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

exports.downloadBackup = async (req, res) => {
  try {
    const backupRoot = path.join(__dirname, '../backups');
    // console.log('Backup root folder:', backupRoot);

    if (!fs.existsSync(backupRoot)) fs.mkdirSync(backupRoot, { recursive: true });

    const folderName = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpDir = path.join(backupRoot, folderName);
    // console.log('Dump directory for this backup:', dumpDir);
    fs.mkdirSync(dumpDir, { recursive: true });

    const zipFile = `mine-backup-${folderName}.zip`;
    const zipPath = path.join(backupRoot, zipFile);

    const mongoURI = process.env.MONGO_DUMP;
    if (!mongoURI) {
      console.error('❌ MONGO_DUMP not found in environment');
      return res.status(500).json({ error: 'MONGO_DUMP missing in .env' });
    }
    // console.log('Mongo URI being used:', mongoURI);

    // Run mongodump
    const dumpCommand = `mongodump --uri="${mongoURI}" --out="${dumpDir}"`;
    // console.log('Running mongodump command:', dumpCommand);

    try {
      const output = execSync(dumpCommand, { encoding: 'utf-8' });
    //   console.log('✅ Mongodump completed successfully');
    //   console.log('Mongodump output:\n', output);
    } catch (err) {
      console.error('❌ Mongodump failed', err.message);
      return res.status(500).json({ error: 'Mongodump failed', details: err.stderr || err.message });
    }

    // Check dump folder
    const files = fs.readdirSync(dumpDir, { withFileTypes: true });
    if (!files.length) {
      console.error('❌ Dump folder empty');
      return res.status(500).json({ error: 'Dump folder empty after mongodump' });
    }
    // console.log('Dump folder contains:', files.map(f => f.name));

    // Send zip
    // console.log('Creating zip for download:', zipFile);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${zipFile}`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => {
      console.error('❌ Archive error:', err);
      res.status(500).end();
    });

    archive.pipe(res);

    //  Important: Second argument sets **folder structure inside the zip**
    // This will create: <folderName>/test/... instead of full backend path
    files.forEach(file => {
      const fullPath = path.join(dumpDir, file.name);
      archive.directory(fullPath, path.join(folderName, file.name));
    });

    await archive.finalize();

    // Cleanup after sending
    res.on('finish', () => {
      console.log('Cleaning up dump folder...');
      fs.rmSync(dumpDir, { recursive: true, force: true });
      console.log('Cleanup complete');
    });

  } catch (error) {
    console.error('❌ Backup failed:', error);
    res.status(500).json({ error: 'Backup failed', details: error.message });
  }
};
