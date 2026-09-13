import { NextResponse } from 'next/server';
import connectMongo from '@/lib/db';
import Student from '@/models/Student';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectMongo();
    
    // Find students who have a non-empty `photo` (base64) AND empty `photoUrl`
    const studentsToMigrate = await Student.find({
      photo: { $ne: '' },
      $or: [{ photoUrl: '' }, { photoUrl: { $exists: false } }]
    });

    if (studentsToMigrate.length === 0) {
      return NextResponse.json({ message: 'No students need image migration.' });
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json({ error: 'IMAGEKIT_PRIVATE_KEY missing' }, { status: 500 });
    }

    let successCount = 0;
    let failCount = 0;

    for (const student of studentsToMigrate) {
      try {
        // student.photo contains base64 string, e.g., "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        let base64Data = student.photo;
        
        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('fileName', `student-${crypto.randomUUID()}.jpg`);
        formData.append('folder', '/students');
        formData.append('useUniqueFileName', 'true');

        const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          headers: {
            'Authorization': authHeader
          },
          body: formData
        });

        const uploadData = await uploadRes.json();
        
        if (uploadRes.ok && uploadData.url) {
          student.photoUrl = uploadData.url;
          student.photo = ''; // Clear base64 data to save DB space
          await student.save();
          successCount++;
        } else {
          console.error(`Failed to upload for student ${student._id}:`, uploadData);
          failCount++;
        }
      } catch (err) {
        console.error(`Error migrating student ${student._id}:`, err);
        failCount++;
      }
    }

    return NextResponse.json({
      message: 'Migration complete',
      totalFound: studentsToMigrate.length,
      successCount,
      failCount
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
