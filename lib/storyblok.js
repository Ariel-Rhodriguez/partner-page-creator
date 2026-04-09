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
export async function uploadAsset(buffer, filename, mimeType, folderId) {
  const body = { filename, size: buffer.byteLength };
  const resolvedFolder = folderId ?? process.env.STORYBLOK_ASSET_FOLDER_ID;
  if (resolvedFolder) {
    body.asset_folder_id = Number(resolvedFolder);
  }

  // Step 1: Register the asset to get a signed upload URL
  const register = await req('/assets', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const { post_url, pretty_url, id, fields } = register;

  // Step 2: POST to S3 using the signed fields
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    form.append(k, v);
  }
  form.append('file', new Blob([buffer], { type: mimeType }), filename);

  const uploadRes = await fetch(post_url, { method: 'POST', body: form });

  if (!uploadRes.ok) {
    const body = await uploadRes.text().catch(() => '');
    throw new Error(`S3 upload failed (${uploadRes.status}): ${body}`);
  }

  // Step 3: Finalize — triggers Storyblok's image processing (dimension detection)
  await req(`/assets/${id}/finish_upload`, { method: 'GET' });

  // Step 4: Re-fetch the asset to get the post-processed CDN URL with correct dimensions.
  // pretty_url from the registration response has /0x0/ before processing; the asset
  // record gets updated with the real dimensions (e.g. /188x66/) after finish_upload.
  // The Rho site's Image component uses those URL dimensions to size images — /0x0/
  // causes it to render at width:100% ("much much larger").
  const asset = await req(`/assets/${id}`);
  // Asset filename is an S3 URL; convert to CDN URL
  const filename_url = asset.filename.replace('https://s3.amazonaws.com/', 'https://');
  return { filename: filename_url, id };
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
