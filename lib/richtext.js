import { randomUUID } from 'crypto';

export function uid() {
  return randomUUID();
}

/** Richtext heading node */
export function rtHeading(text, level = 1) {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level, textAlign: null },
        content: [{ type: 'text', text }],
      },
    ],
  };
}

/** Single plain text bullet item */
function bulletItem(text) {
  return {
    type: 'list_item',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: null },
        content: [
          {
            type: 'text',
            text,
            marks: [{ type: 'textStyle', attrs: { color: '#000000' } }],
          },
        ],
      },
    ],
  };
}

/**
 * Build the SplitColumnItems offer content richtext.
 * @param {string} amount   - e.g. "$100,000.00"
 * @param {string} days     - e.g. "90"
 * @param {string[]} bullets - custom incentive lines
 * @param {boolean} includeCashback
 */
export function buildOfferContent(amount, days, bullets = [], includeCashback = false) {
  const paragraph = `Maintain an average daily checking deposit balance of at least ${amount} USD for the first ${days} days after your Rho Checking account is opened, use your Rho account as your company\u2019s primary operating account (including payroll), and complete a payroll transaction to receive:`;

  const bulletNodes = bullets.map((b) => bulletItem(b));

  if (includeCashback) {
    bulletNodes.push(bulletItem('Up to cashback.default cashback*'));
  }

  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: null },
        content: [
          {
            type: 'text',
            text: paragraph,
            marks: [{ type: 'textStyle', attrs: { color: '#000000' } }],
          },
        ],
      },
      {
        type: 'bullet_list',
        content: bulletNodes,
      },
    ],
  };
}

/**
 * Build a Storyblok Image blok referencing an already-uploaded asset.
 * @param {{ filename: string, id: number }} asset
 */
export function imageBlok(asset, alt = '') {
  return {
    _uid: uid(),
    component: 'Image',
    image: {
      id: asset.id,
      alt,
      name: '',
      focus: '',
      title: '',
      source: '',
      filename: asset.filename,
      copyright: '',
      fieldtype: 'asset',
      meta_data: { alt, title: '', source: '', copyright: '' },
      is_external_url: false,
    },
    aspectRatio: '',
    disableLazyLoad: false,
  };
}

/** Empty asset reference (used when user skips optional upload) */
export function emptyAsset() {
  return {
    id: null,
    alt: null,
    name: '',
    focus: null,
    title: null,
    filename: null,
    copyright: null,
    fieldtype: 'asset',
    meta_data: { alt: null, title: null, source: null, copyright: null },
    is_external_url: false,
  };
}
