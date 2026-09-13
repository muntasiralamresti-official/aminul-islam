import { Buffer } from 'node:buffer';
import connectMongo from '../lib/db.js';
import Student from '../models/Student.js';

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
  await connectMongo();

  const students = await Student.find({
    photo: { $regex: /^data:image\/(jpeg|png|webp);base64,/ },
  }).select('_id name rollNumber photo photoUrl').lean();

  console.log(`Found ${students.length} student photo(s) to migrate.`);

  let migrated = 0;
  let failed = 0;

  for (const student of students) {
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

      // Only remove the legacy base64 field after ImageKit upload succeeded
      // and the new URL has been persisted successfully.
      await Student.updateOne(
        { _id: student._id },
        { $set: { photoUrl }, $unset: { photo: 1 } }
      );

      migrated += 1;
      console.log(`✓ ${student.name} (${student.rollNumber}) → ${photoUrl}`);
    } catch (error) {
      failed += 1;
      console.error(`✗ ${student.name} (${student.rollNumber}): ${error.message}`);
      // Keep the old base64 photo untouched when anything fails.
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${failed} failed.`);
  process.exitCode = failed > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
