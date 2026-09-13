import mongoose from 'mongoose';
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const FOLDER = '/students';

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/s.exec(dataUrl || '');
  if (!match) return null;

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];

  return { mimeType, buffer, extension };
}

function loadEnvFile() {
  if (process.env.MONGODB_URI && process.env.IMAGEKIT_PRIVATE_KEY) return;

  try {
    const output = execFileSync(process.platform === 'win32' ? 'cmd.exe' : 'sh',
      process.platform === 'win32'
        ? ['/c', 'type .env.local']
        : ['-c', 'cat .env.local'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

    for (const line of output.split(/\r?\n/)) {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
      if (!match || process.env[match[1]]) continue;
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  } catch {
    // The npm script normally supplies --env-file=.env.local on Node 20+.
  }
}

async function uploadToImageKit({ buffer, mimeType, fileName }) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) throw new Error('IMAGEKIT_PRIVATE_KEY is not configured.');

  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: mimeType }), fileName);
  formData.append('fileName', fileName);
  formData.append('folder', FOLDER);
  formData.append('useUniqueFileName', 'true');
  formData.append('isPrivateFile', 'false');

  const response = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data.message || `ImageKit upload failed (${response.status})`);
  }

  return data.url;
}

async function main() {
  loadEnvFile();

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required.');
  if (!process.env.IMAGEKIT_PRIVATE_KEY) throw new Error('IMAGEKIT_PRIVATE_KEY is required.');

  let connection;
  try {
    connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });
  } catch (error) {
    throw new Error(
      `MongoDB connection failed: ${error.message}. ` +
      'MongoDB Compass may still connect while Node uses a different DNS path. ' +
      'Try the migration again after closing VPN/proxy or switching DNS to 1.1.1.1/8.8.8.8.',
    );
  }

  const students = connection.connection.collection('students');
  const records = await students.find(
    { photo: { $regex: /^data:image\/(jpeg|png|webp);base64,/ } },
    { projection: { _id: 1, name: 1, rollNumber: 1, photo: 1 } },
  ).toArray();

  console.log(`Found ${records.length} student photo(s) to migrate.`);

  let migrated = 0;
  let failed = 0;

  for (const student of records) {
    const parsed = parseDataUrl(student.photo);
    if (!parsed) {
      failed += 1;
      console.error(`✗ ${student.name} (${student.rollNumber}): unsupported image format`);
      continue;
    }

    try {
      const fileName = `student-${student._id}.${parsed.extension}`;
      const photoUrl = await uploadToImageKit({
        buffer: parsed.buffer,
        mimeType: parsed.mimeType,
        fileName,
      });

      const updateResult = await students.updateOne(
        { _id: student._id },
        { $set: { photoUrl }, $unset: { photo: '' } },
      );

      if (updateResult.modifiedCount !== 1) {
        throw new Error('Database update was not confirmed. Legacy photo was kept.');
      }

      migrated += 1;
      console.log(`✓ ${student.name} (${student.rollNumber}) migrated`);
    } catch (error) {
      failed += 1;
      console.error(`✗ ${student.name} (${student.rollNumber}): ${error.message}`);
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${failed} failed.`);
  await mongoose.disconnect();
  process.exitCode = failed > 0 ? 1 : 0;
}

main().catch(async (error) => {
  console.error(`Migration failed: ${error.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
