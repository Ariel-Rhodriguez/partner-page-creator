import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { buildPartnerStoryContent } from '@/lib/buildStory';
import { createPartnerStory, fetchTemplateStory } from '@/lib/storyblok';

export async function POST(request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { inputs, assets } = body;

    // Validate required fields
    const required = ['partnerName', 'slug', 'seoTitle', 'seoDescription', 'heroHeading', 'offerAmount', 'offerDays'];
    for (const key of required) {
      if (!inputs?.[key]) {
        return NextResponse.json({ error: `Missing required field: ${key}` }, { status: 400 });
      }
    }

    const template = await fetchTemplateStory();
    const content = buildPartnerStoryContent(template.content, inputs, assets || {});

    const story = await createPartnerStory({
      name: inputs.partnerName,
      slug: inputs.slug,
      content,
    });

    return NextResponse.json({
      ok: true,
      story: {
        id: story.id,
        name: story.name,
        full_slug: story.full_slug,
      },
    });
  } catch (err) {
    console.error('[create-partner-page]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
