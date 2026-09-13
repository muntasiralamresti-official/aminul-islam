import mongoose from 'mongoose';
import { Buffer } from 'node:buffer';

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
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required.');
  if (!process.env.IMAGEKIT_PRIVATE_KEY) throw new Error('IMAGEKIT_PRIVATE_KEY is required.');

  const connection = await mongoose.connect(uri);
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

      // Keep the legacy base64 photo until upload and database update succeed.
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
      // Never remove the old base64 photo when a migration step fails.
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
