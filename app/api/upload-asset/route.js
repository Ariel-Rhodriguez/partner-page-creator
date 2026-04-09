import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { uploadAsset } from '@/lib/storyblok';

export async function POST(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name;
  const mimeType = file.type || 'application/octet-stream';

  try {
    const asset = await uploadAsset(buffer, filename, mimeType);
    return NextResponse.json({ ok: true, asset });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
