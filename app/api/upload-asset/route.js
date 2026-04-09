import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { uploadAsset } from '@/lib/storyblok';

async function isAuthenticated() {
  const jar = await cookies();
  const session = jar.get('ppc_session');
  return session?.value === process.env.AUTH_PASSWORD;
}

const FOLDER_MAP = {
  image: process.env.STORYBLOK_IMAGE_FOLDER_ID,
  og: process.env.STORYBLOK_OG_FOLDER_ID,
};

export async function POST(request) {
  if (!await isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const folderType = formData.get('folderType'); // 'image' | 'og'

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folderId = FOLDER_MAP[folderType] ?? null;

  try {
    const asset = await uploadAsset(buffer, file.name, file.type || 'application/octet-stream', folderId);
    return NextResponse.json({ ok: true, asset });
  } catch (err) {
    console.error('[upload-asset]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
