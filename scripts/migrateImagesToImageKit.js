require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const crypto = require('crypto');

const StudentSchema = new mongoose.Schema(
  {
    photo: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
  },
  { strict: false }
);
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
  console.log('Connected to MongoDB');

  const students = await Student.find({ photo: { $ne: '' } });
  console.log(`Found ${students.length} students with old base64 photos.`);

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  let successCount = 0;
  let failCount = 0;

  for (const student of students) {
    if (student.photoUrl && student.photoUrl.includes('imagekit.io')) {
      student.photo = '';
      await student.save();
      console.log('Cleared base64 for already migrated student:', student._id);
      continue;
    }

    try {
      const formData = new FormData();
      formData.append('file', student.photo);
      formData.append('fileName', `student-${crypto.randomUUID()}.jpg`);
      formData.append('folder', '/students');
      formData.append('useUniqueFileName', 'true');

      const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

      const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        body: formData
      });

      const uploadData = await uploadRes.json();

      if (uploadRes.ok && uploadData.url) {
        student.photoUrl = uploadData.url;
        student.photo = ''; // Clear the heavy base64
        await student.save();
        console.log(`Successfully migrated student ${student._id}`);
        successCount++;
      } else {
        console.error(`Failed to upload for ${student._id}:`, uploadData);
        failCount++;
      }
    } catch (e) {
      console.error(`Error migrating student ${student._id}:`, e);
      failCount++;
    }
  }

  console.log(`Migration done! Success: ${successCount}, Fail: ${failCount}`);
  process.exit(0);
}

run();
