import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { uploadAsset } from '@/lib/storyblok';

function isAuthenticated() {
  const jar = cookies();
  const session = jar.get('ppc_session');
  return session?.value === process.env.AUTH_PASSWORD;
}

export async function POST(request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const asset = await uploadAsset(buffer, file.name, file.type || 'application/octet-stream');
    return NextResponse.json({ ok: true, asset });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
