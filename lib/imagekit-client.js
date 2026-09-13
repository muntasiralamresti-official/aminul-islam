const MAX_STUDENT_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadStudentPhoto(file) {
  if (!file) return '';

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Please select a JPG, PNG, or WebP image.');
  }

  if (file.size > MAX_STUDENT_PHOTO_SIZE) {
    throw new Error('Student photo must be 5MB or smaller.');
  }

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('Image upload is not configured.');
  }

  const authResponse = await fetch('/api/uploads/imagekit/auth', { cache: 'no-store' });
  const authData = await authResponse.json();
  if (!authResponse.ok) {
    throw new Error(authData.error || 'Failed to initialize image upload.');
  }

  const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', `student-${crypto.randomUUID()}.${extension}`);
  formData.append('publicKey', publicKey);
  formData.append('signature', authData.signature);
  formData.append('expire', String(authData.expire));
  formData.append('token', authData.token);
  formData.append('useUniqueFileName', 'true');
  formData.append('folder', '/students');
  formData.append('isPrivateFile', 'false');

  const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData,
  });

  const uploadData = await uploadResponse.json();
  if (!uploadResponse.ok || !uploadData.url) {
    throw new Error(uploadData.message || 'Failed to upload student photo.');
  }

  return uploadData.url;
}
