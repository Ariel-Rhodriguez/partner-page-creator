import { uid, rtHeading, buildOfferContent, imageBlok, emptyAsset } from './richtext';

/**
 * Takes a deep clone of the b-ventures template story content and
 * patches only the partner-specific fields.
 *
 * @param {object} template   - story.content from the template
 * @param {object} inputs     - validated form inputs
 * @param {object} assets     - uploaded asset objects { eyebrow, splitImage, ogImage }
 */
export function buildPartnerStoryContent(template, inputs, assets) {
  const content = JSON.parse(JSON.stringify(template)); // deep clone

  // ── SEO ──────────────────────────────────────────────────────────────────
  content.SEO = {
    ...content.SEO,
    title: inputs.seoTitle,
    og_title: inputs.seoTitle,
    twitter_title: inputs.seoTitle,
    description: inputs.seoDescription,
    og_description: inputs.seoDescription,
    twitter_description: inputs.seoDescription,
    og_image: assets.ogImage ? assets.ogImage.filename : (content.SEO?.og_image || ''),
  };

  // ── body patches ─────────────────────────────────────────────────────────
  const body = content.body;

  // 1. ImageWithSocial
  const heroSection = body.find((b) => b.component === 'ImageWithSocial');
  if (heroSection) {
    const textHeader = heroSection.header?.[0];
    if (textHeader) {
      // Heading h1
      const heading = textHeader.heading?.[0];
      if (heading) {
        heading.Text = rtHeading(inputs.heroHeading, 1);
        heading._uid = uid();
      }

      // Eyebrow icon (optional)
      if (assets.eyebrow) {
        textHeader.eyebrowIcon = [
          {
            _uid: uid(),
            type: '',
            component: 'Image',
            image: {
              id: assets.eyebrow.id,
              alt: inputs.partnerName,
              name: '',
              focus: '',
              title: '',
              source: '',
              filename: assets.eyebrow.filename,
              copyright: '',
              fieldtype: 'asset',
              meta_data: {},
              is_external_url: false,
            },
            aspectRatio: '',
            disableLazyLoad: false,
          },
        ];
      } else {
        textHeader.eyebrowIcon = [];
      }
    }
  }

  // 2. SplitColumnItems
  const splitSection = body.find((b) => b.component === 'SplitColumnItems');
  if (splitSection) {
    // Section heading h2
    const sectionHeader = splitSection.heading?.[0];
    if (sectionHeader) {
      const h = sectionHeader.heading?.[0];
      if (h) {
        h.Text = rtHeading(`What ${inputs.partnerName} founders receive`, 2);
        h._uid = uid();
      }
    }

    // First item
    const item = splitSection.items?.[0];
    if (item) {
      // Partner logo image
      if (assets.splitImage) {
        item.Image = [imageBlok(assets.splitImage, inputs.partnerName)];
      }

      // Offer content richtext
      const textBlok = item.Content?.[0];
      if (textBlok) {
        textBlok.content = buildOfferContent(
          inputs.offerAmount,
          inputs.offerDays,
          inputs.offerBullets,
          inputs.includeCashback,
        );
        textBlok._uid = uid();
      }
    }

    // SplitColumnItems disclaimer — leave as-is (Terms and conditions apply.¹)
  }

  // 3. Page-level disclaimer — patch ¹Terms and Conditions paragraph
  if (content.disclaimer) {
    content.disclaimer = patchDisclaimer(content.disclaimer, inputs.offerAmount, inputs.offerDays);
  }

  return content;
}

/**
 * Replace the dynamic values in the ¹Terms and Conditions paragraph of the
 * page-level disclaimer richtext.
 */
function patchDisclaimer(disclaimerRichtext, amount, days) {
  const daysInt = parseInt(days, 10);
  const daysWord = numberToWords(daysInt);

  const patched = JSON.parse(JSON.stringify(disclaimerRichtext));

  function patchNode(node) {
    if (node.type === 'text' && typeof node.text === 'string') {
      // Replace dollar amount + USD (only occurs in the qualifying period sentence)
      node.text = node.text.replace(/\$[\d,]+\.\d{2}\s*USD/g, `${amount} USD`);
      // Replace the qualifying period days — only "for the first X (N) days" and
      // "following the first X (N) days" to avoid touching unrelated day references
      // like "within thirty (30) days" (the credit window).
      node.text = node.text.replace(
        /(for|following) the first [a-z\s-]+ \(\d+\) days/gi,
        (match) => match.replace(/[a-z\s-]+ \(\d+\) days$/i, `${daysWord} (${daysInt}) days`),
      );
      // Replace bare "N-day" references (e.g. "90-day period", "90-day checking deposit balance")
      node.text = node.text.replace(/\b\d+-day\b/g, `${daysInt}-day`);
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(patchNode);
    }
  }

  patched.content?.forEach(patchNode);
  return patched;
}

function numberToWords(n) {
  const map = {
    30: 'thirty',
    60: 'sixty',
    90: 'ninety',
    120: 'one hundred twenty',
    180: 'one hundred eighty',
    365: 'three hundred sixty-five',
  };
  return map[n] ?? String(n);
}
