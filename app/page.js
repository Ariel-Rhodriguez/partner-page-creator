'use client';

import { useEffect, useRef, useState } from 'react';

import { useFormState } from '@/components/FormStateProvider';

// ─── Small UI helpers ──────────────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Hint({ children }) {
  return <p className="mt-1 text-xs text-gray-400">{children}</p>;
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${className}`}
      rows={3}
      {...props}
    />
  );
}

function SectionCard({ title, description, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      <div className="space-y-5 px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Image upload field ────────────────────────────────────────────────────────

function ImageUploadField({ label, hint, required, value, onChange, accept = 'image/*' }) {
  const inputRef = useRef(null);
  const previewUrl = value ? URL.createObjectURL(value) : null;

  return (
    <div>
      <Label required={required}>{label}</Label>
      {hint && <Hint>{hint}</Hint>}
      <div className="mt-2">
        {value ? (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <img
              src={previewUrl}
              alt="preview"
              className="h-10 w-10 flex-shrink-0 rounded object-contain bg-white border border-green-100"
            />
            <span className="truncate text-xs text-green-800">{value.name}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="ml-auto text-xs text-green-600 underline hover:text-green-800"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Click to upload
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

// ─── Bullet list field ─────────────────────────────────────────────────────────

function BulletListField({ bullets, onChange }) {
  function update(i, val) {
    const next = [...bullets];
    next[i] = val;
    onChange(next);
  }
  function add() {
    onChange([...bullets, '']);
  }
  function remove(i) {
    onChange(bullets.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-400">•</span>
          <Input
            value={b}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Incentive ${i + 1}`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="flex-shrink-0 text-gray-300 hover:text-red-400"
            aria-label="Remove bullet"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add incentive bullet
      </button>
    </div>
  );
}

// ─── Slug helper ───────────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ─── Asset uploader ────────────────────────────────────────────────────────────

async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload-asset', { method: 'POST', body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Upload failed');
  return json.asset;
}

// ─── Main form ─────────────────────────────────────────────────────────────────

export default function CreatePartnerPage() {
  const {
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
  } = useFormState();

  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!partnerName) return;
    setSeoTitle(`Rho | ${partnerName} perks`);
    setSeoDescription(
      `${partnerName} founders: Unlock special perks when you manage your company finances with Rho. Eligibility and conditions apply.\u00b9`,
    );
    if (!slugManual) setSlug(toSlug(partnerName));
  }, [partnerName, slugManual]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      setStatus('uploading');

      const [eyebrow, splitImage, ogImage] = await Promise.all([
        eyebrowFile ? uploadFile(eyebrowFile) : Promise.resolve(null),
        splitImageFile ? uploadFile(splitImageFile) : Promise.resolve(null),
        ogImageFile ? uploadFile(ogImageFile) : Promise.resolve(null),
      ]);

      setStatus('creating');

      const res = await fetch('/api/create-partner-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: {
            partnerName,
            slug,
            seoTitle,
            seoDescription,
            heroHeading,
            offerAmount,
            offerDays,
            offerBullets: offerBullets.filter(Boolean),
            includeCashback,
          },
          assets: { eyebrow, splitImage, ogImage },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create page');

      setStatus('done');
      setResult(json.story);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  const busy = status === 'uploading' || status === 'creating';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Create Partner Page</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fills in the partner-specific content and creates a <strong>draft</strong> page in
          Storyblok under the{' '}
          <code className="rounded bg-gray-100 px-1 text-xs">en/partner/</code> directory.
        </p>
      </div>

      {status === 'done' && result && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <p className="font-medium">Draft page created successfully.</p>
          <p className="mt-0.5 text-xs">
            Slug: <code className="rounded bg-green-100 px-1">{result.full_slug}</code> &mdash;
            Story ID: <code className="rounded bg-green-100 px-1">{result.id}</code>
          </p>
          <p className="mt-1 text-xs text-green-700">Open Storyblok to review and publish when ready.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span className="font-medium">Error: </span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Partner Details */}
        <SectionCard title="Partner Details">
          <div>
            <Label required>Partner Name</Label>
            <Input
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g. N Ventures"
              required
            />
          </div>
          <div>
            <Label required>Page Slug</Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
              placeholder="e.g. n-ventures"
              required
            />
            <Hint>
              URL will be <code>en/partner/{slug || '…'}</code>. Auto-derived from partner name but
              you can override it.
            </Hint>
          </div>
        </SectionCard>

        {/* SEO */}
        <SectionCard title="SEO" description="Applies to title tags, Open Graph, and Twitter cards.">
          <div>
            <Label required>SEO Title</Label>
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Rho | Partner Name perks"
              required
            />
          </div>
          <div>
            <Label required>Meta Description</Label>
            <Textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              required
            />
          </div>
          <ImageUploadField
            label="Open Graph Image"
            hint="Upload the OG image from the Asset Generator. Recommended 2400×1260 JPG."
            value={ogImageFile}
            onChange={setOgImageFile}
            accept="image/*"
          />
        </SectionCard>

        {/* Hero */}
        <SectionCard
          title="Hero Section"
          description="Top section with the main headline and partner logo."
        >
          <div>
            <Label required>Hero Heading</Label>
            <Input
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              placeholder="e.g. Special offer for N Ventures founders"
              required
            />
            <Hint>
              Include &quot;founders&quot; at the end — e.g.{' '}
              <em>Special offer for N Ventures founders</em>, not just{' '}
              <em>Special offer for N Ventures</em>.
            </Hint>
          </div>
          <ImageUploadField
            label="Eyebrow Icon (Partner Logo — Light)"
            hint="Optional. Upload the light-background logo from the Asset Generator."
            value={eyebrowFile}
            onChange={setEyebrowFile}
            accept="image/*"
          />
        </SectionCard>

        {/* Offer Details */}
        <SectionCard
          title="Offer Details"
          description="Defines the incentives shown in the 'What [Partner] founders receive' section."
        >
          <ImageUploadField
            label="Partner Logo — Dark (Split Column Image)"
            hint="Upload the dark-background logo from the Asset Generator."
            value={splitImageFile}
            onChange={setSplitImageFile}
            accept="image/*"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Minimum Balance Requirement</Label>
              <Input
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="e.g. $100,000.00"
                required
              />
              <Hint>Include $ and formatting, e.g. $100,000.00</Hint>
            </div>
            <div>
              <Label required>Qualifying Period (Days)</Label>
              <Input
                type="number"
                value={offerDays}
                onChange={(e) => setOfferDays(e.target.value)}
                min="1"
                placeholder="90"
                required
              />
              <Hint>Updates the page disclaimer automatically.</Hint>
            </div>
          </div>

          <div>
            <Label required>Incentive Bullets</Label>
            <Hint>Add each reward the partner&apos;s founders will receive.</Hint>
            <div className="mt-2">
              <BulletListField bullets={offerBullets} onChange={setOfferBullets} />
            </div>
          </div>

          <div>
            <Label>Cashback Offer</Label>
            <div className="mt-2 flex items-start gap-3 rounded-lg border border-gray-200 p-3">
              <input
                id="cashback"
                type="checkbox"
                checked={includeCashback}
                onChange={(e) => setIncludeCashback(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <label htmlFor="cashback" className="cursor-pointer text-sm text-gray-700">
                Include cashback bullet
                <span className="mt-0.5 block text-xs text-gray-400">
                  Adds: <em>Up to cashback.default cashback*</em>
                </span>
              </label>
            </div>
          </div>
        </SectionCard>

        {/* Submit */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-xs text-gray-400">
            The page will be saved as a <strong>draft</strong> in Storyblok for review before
            publishing.
          </p>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {status === 'uploading'
              ? 'Uploading assets…'
              : status === 'creating'
              ? 'Creating page…'
              : 'Create Draft Page'}
          </button>
        </div>
      </form>
    </div>
  );
}
