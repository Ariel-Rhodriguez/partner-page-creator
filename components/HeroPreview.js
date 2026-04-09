'use client';

import { useEffect, useRef, useState } from 'react';

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

export default function HeroPreview() {
  const { heroHeading, eyebrowFile } = useFormState();
  const eyebrowUrl = useObjectUrl(eyebrowFile);

  const heading = heroHeading || 'Your heading will appear here';
  const isPlaceholder = !heroHeading;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
      {/* Label bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">Preview</span>
          <span className="text-[10px] text-gray-300">— Hero Section</span>
        </div>
        <span className="text-[10px] text-gray-400 italic">This is an approximate preview — the live page may render slightly differently.</span>
      </div>

      {/* Hero body */}
      <div className="bg-white px-8 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          {eyebrowUrl && (
            <img
              src={eyebrowUrl}
              alt="Eyebrow logo"
              className="max-h-10 w-auto mx-auto mb-6 block"
            />
          )}

          <h1
            className={`text-4xl md:text-5xl font-normal tracking-tight leading-tight mb-5 ${
              isPlaceholder ? 'text-[#b0b7b3] italic' : 'text-[#1a1f1d]'
            }`}
          >
            {heading}
          </h1>

          <p className="text-[#747C78] text-base leading-relaxed max-w-md mx-auto">
            Unlock special perks when you manage your company finances with Rho.
            Eligibility and conditions apply.¹
          </p>
        </div>
      </div>
    </div>
  );
}
