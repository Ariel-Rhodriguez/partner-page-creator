const SPACE_ID = process.env.STORYBLOK_SPACE_ID;
const TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;
const TEMPLATE_STORY_ID = process.env.STORYBLOK_TEMPLATE_STORY_ID; // b-ventures story ID
const PARTNER_FOLDER_ID = process.env.STORYBLOK_PARTNER_FOLDER_ID; // parent folder numeric ID

function base() {
  return `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`;
}

async function req(path, options = {}) {
  const res = await fetch(`${base()}${path}`, {
    ...options,
    headers: {
      Authorization: TOKEN,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Storyblok ${options.method || 'GET'} ${path} failed (${res.status}): ${body}`);
  }

  return res.json();
}

export async function fetchTemplateStory() {
  const data = await req(`/stories/${TEMPLATE_STORY_ID}`);
  return data.story;
}

/**
 * Upload an asset to Storyblok.
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - e.g. "partner_logo.svg"
 * @param {string} mimeType - e.g. "image/svg+xml"
 * @returns {{ filename: string, id: number }} Storyblok asset
 */
export async function uploadAsset(buffer, filename, mimeType) {
  // Step 1: Register the asset to get a signed upload URL
  const register = await req('/assets', {
    method: 'POST',
    body: JSON.stringify({ filename, size: buffer.byteLength }),
  });

  const { signed_request, public_url, id, fields } = register;

  // Step 2: Upload to S3 via the signed request
  const form = new FormData();
  if (fields) {
    for (const [k, v] of Object.entries(fields)) {
      form.append(k, v);
    }
  }
  form.append('file', new Blob([buffer], { type: mimeType }), filename);

  const uploadRes = await fetch(signed_request, {
    method: 'POST',
    body: form,
    headers: {}, // let fetch set Content-Type for multipart
  });

  if (!uploadRes.ok) {
    const body = await uploadRes.text().catch(() => '');
    throw new Error(`S3 upload failed (${uploadRes.status}): ${body}`);
  }

  // Step 3: Finalize
  await req(`/assets/${id}/finish_upload`, { method: 'GET' });

  return { filename: public_url, id };
}

/**
 * Create a new partner story as a draft.
 */
export async function createPartnerStory({ name, slug, content }) {
  const data = await req('/stories', {
    method: 'POST',
    body: JSON.stringify({
      story: {
        name,
        slug,
        parent_id: Number(PARTNER_FOLDER_ID),
        content,
      },
      publish: 0,
    }),
  });
  return data.story;
}
