interface ShareLinkBannerProps {
  shareLink: string;
  didCopy: boolean;
  onCopy: () => void;
}

export function ShareLinkBanner({ shareLink, didCopy, onCopy }: ShareLinkBannerProps) {
  return (
    <section className="mb-8 rounded-xl border border-green-700/20 bg-green-700/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-green-900/80">Share link for this poll</p>
      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
        <input
          className="w-full rounded-md border border-green-900/20 bg-white/80 px-3 py-2 text-xs text-green-900"
          readOnly
          value={shareLink}
        />
        <button
          type="button"
          className="rounded-md bg-green-800 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
          onClick={onCopy}
        >
          {didCopy ? 'Copied' : 'Copy Link'}
        </button>
      </div>
    </section>
  );
}
