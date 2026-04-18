interface CreateSuccessPanelProps {
  successMessage: string;
  shareLink: string | null;
  didCopy: boolean;
  onCopy: () => void;
}

export function CreateSuccessPanel({ successMessage, shareLink, didCopy, onCopy }: CreateSuccessPanelProps) {
  return (
    <div className="space-y-3 rounded-lg border border-green-700/20 bg-green-700/5 px-4 py-3 text-sm text-green-800">
      <p>{successMessage}</p>
      {shareLink && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-900/80">Share this poll link</p>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
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
          <p className="text-xs text-green-900/70">Redirecting to voting page...</p>
        </div>
      )}
    </div>
  );
}
