import { useState } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

type Props = {
  text: string;
  loading: boolean;
  error: string | null;
};

export default function OutputPane({ text, loading, error }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;
    await writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <span className="text-sm font-medium text-slate-600">Improved</span>
        <button
          onClick={copy}
          disabled={!text || loading}
          className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? "Copied!" : "Quick copy"}
        </button>
      </div>
      <div className="relative flex-1 overflow-auto p-3">
        {loading && (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Improving…
          </div>
        )}
        {!loading && error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {!loading && !error && (
          <div className="whitespace-pre-wrap text-sm text-slate-800">
            {text || (
              <span className="text-slate-400">
                The improved text will appear here.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
