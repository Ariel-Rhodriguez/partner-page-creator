export const metadata = {
  title: 'Asset Generator — Rho Partner Tools',
};

export default function AssetGeneratorPage() {
  return (
    <div className="-mx-6 -mt-8">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">Asset Generator</h1>
          <p className="text-xs text-gray-500">
            Upload your partner&apos;s SVG logo to generate the three images needed for the partner
            page: eyebrow icon, split column image, and Open Graph image.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          Download all 3 images before creating your partner page
        </span>
      </div>
      <iframe
        src="https://partner-asset-generator.vercel.app/"
        className="h-[calc(100vh-120px)] w-full border-0"
        title="Partner Asset Generator"
      />
    </div>
  );
}
