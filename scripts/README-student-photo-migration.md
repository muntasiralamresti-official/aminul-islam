# Student photo migration

Set `MONGODB_URI` and `IMAGEKIT_PRIVATE_KEY` in your local environment, then run:

```bash
node scripts/migrate-student-photos-node.mjs
```

The script uploads legacy base64 JPG/PNG/WebP photos to ImageKit and only removes the legacy `photo` field after the ImageKit URL has been successfully persisted. Failed records keep their original photo.
