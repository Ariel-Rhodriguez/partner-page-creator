'use client';

import { createContext, useContext, useState } from 'react';

const FormStateContext = createContext(null);

export function FormStateProvider({ children }) {
  const [partnerName, setPartnerName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogImageFile, setOgImageFile] = useState(null);

  const [heroHeading, setHeroHeading] = useState('');
  const [eyebrowFile, setEyebrowFile] = useState(null);

  const [splitImageFile, setSplitImageFile] = useState(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDays, setOfferDays] = useState('90');
  const [offerBullets, setOfferBullets] = useState(['', '']);
  const [includeCashback, setIncludeCashback] = useState(false);

  return (
    <FormStateContext.Provider
      value={{
        partnerName, setPartnerName,
        slug, setSlug,
        slugManual, setSlugManual,
        seoTitle, setSeoTitle,
        seoDescription, setSeoDescription,
        ogImageFile, setOgImageFile,
        heroHeading, setHeroHeading,
        eyebrowFile, setEyebrowFile,
        splitImageFile, setSplitImageFile,
        offerAmount, setOfferAmount,
        offerDays, setOfferDays,
        offerBullets, setOfferBullets,
        includeCashback, setIncludeCashback,
      }}
    >
      {children}
    </FormStateContext.Provider>
  );
}

export function useFormState() {
  return useContext(FormStateContext);
}
