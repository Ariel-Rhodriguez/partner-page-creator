'use client';

import { useEffect, useState } from 'react';

import { useFormState } from '@/components/FormStateProvider';

function useObjectUrl(file) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return url;
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ── Social card (X / LinkedIn) ───────────────────────────────────────────────

function SocialCardPreview({ title, description, imageUrl, slug }) {
  const displayUrl = `rho.co/partner/${slug || '…'}`;

  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">X / LinkedIn card</p>
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white max-w-sm">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="OG preview"
            className="w-full object-cover h-44"
          />
        ) : (
          <div className="w-full h-44 bg-[#E0E5E3] flex items-center justify-center">
            <span className="text-[#747C78] text-xs">No OG image uploaded</span>
          </div>
        )}
        <div className="px-3 py-2.5 space-y-0.5">
          <p className="text-[10px] text-[#747C78] uppercase tracking-wide">{displayUrl}</p>
          <p className="text-sm font-semibold text-[#1a1f1d] leading-snug">
            {truncate(title, 70) || <span className="text-gray-300 italic font-normal">SEO title will appear here</span>}
          </p>
          <p className="text-xs text-[#747C78] leading-relaxed line-clamp-2">
            {truncate(description, 120) || <span className="text-gray-300 italic">Meta description will appear here</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function SeoPreview() {
  const { seoTitle, seoDescription, ogImageFile, slug } = useFormState();
  const imageUrl = useObjectUrl(ogImageFile);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Label bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">Preview</span>
          <span className="text-[10px] text-gray-300">— SEO &amp; Social Sharing</span>
        </div>
        <span className="text-[10px] text-gray-400 italic">This is an approximate preview — the live page may render slightly differently.</span>
      </div>

      <div className="bg-gray-50 px-6 py-6 space-y-6">
        <p className="text-xs text-[#747C78] leading-relaxed">
          When someone shares this page on X or LinkedIn, the platform reads the Open Graph tags
          to generate a rich preview card. This is what they&apos;ll see.
        </p>

        <SocialCardPreview title={seoTitle} description={seoDescription} imageUrl={imageUrl} slug={slug} />
      </div>
    </div>
  );
}
