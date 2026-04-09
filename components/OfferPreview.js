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

function CheckBullet({ text, isLast }) {
  return (
    <div className={`flex items-start gap-3.5 py-4 ${isLast ? '' : 'border-b border-[#E0E5E3]'}`}>
      <div className="flex-shrink-0 w-8 h-8 bg-[#00EBC0] rounded flex items-center justify-center text-white text-sm font-bold">
        ✓
      </div>
      <span className="text-[#1a1f1d] text-sm leading-relaxed pt-1">{text}</span>
    </div>
  );
}

export default function OfferPreview() {
  const {
    partnerName,
    splitImageFile,
    offerAmount,
    offerDays,
    offerBullets,
    includeCashback,
  } = useFormState();

  const splitImageUrl = useObjectUrl(splitImageFile);

  const displayPartner = partnerName || '[Partner]';
  const displayAmount = offerAmount || '[amount]';
  const displayDays = offerDays || '[days]';

  const allBullets = [
    ...offerBullets.filter(Boolean),
    ...(includeCashback ? ['Up to 1.5% cashback*'] : []),
  ];

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
      {/* Label bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">Preview</span>
          <span className="text-[10px] text-gray-300">— Offer Details Section</span>
        </div>
        <span className="text-[10px] text-gray-400 italic">This is an approximate preview — the live page may render slightly differently.</span>
      </div>

      {/* Section body */}
      <div className="bg-white px-10 py-12">
        {/* Section heading */}
        <h2 className="text-center text-[#1a1f1d] text-3xl font-normal tracking-tight mb-10">
          What {displayPartner} founders receive
        </h2>

        {/* Split layout */}
        <div className="flex flex-wrap gap-10 items-start">
          {/* Image col */}
          <div className="flex-1 min-w-[260px]">
            {splitImageUrl ? (
              <img
                src={splitImageUrl}
                alt="Partner logo"
                className="w-full max-h-64 object-contain rounded-lg"
              />
            ) : (
              <div className="bg-[#E0E5E3] rounded-lg h-48 flex items-center justify-center">
                <span className="text-[#747C78] text-xs">No image uploaded</span>
              </div>
            )}
          </div>

          {/* Content col */}
          <div className="flex-1 min-w-[260px]">
            <p className="text-[#1a1f1d] text-sm leading-relaxed mb-6">
              Maintain an average daily checking deposit balance of at least{' '}
              <strong>{displayAmount} USD</strong> for the first{' '}
              <strong>{displayDays} days</strong> after your Rho Checking account is opened,
              use your Rho account as your company&apos;s primary operating account (including
              payroll), and complete a payroll transaction to receive:
            </p>

            <div>
              {allBullets.length === 0 ? (
                <p className="text-[#747C78] text-xs italic">
                  Add incentive bullets above to see them here.
                </p>
              ) : (
                allBullets.map((bullet, i) => (
                  <CheckBullet key={i} text={bullet} isLast={i === allBullets.length - 1} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[#747C78] text-xs mt-10">
          Terms and conditions apply.¹
        </p>
      </div>
    </div>
  );
}
