import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      return NextResponse.json({ error: 'Image upload is not configured' }, { status: 503 });
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 30 * 60;
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(token + expire)
      .digest('hex');

    return NextResponse.json({ token, expire, signature });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return NextResponse.json({ error: 'Failed to initialize image upload' }, { status: 500 });
  }
}
