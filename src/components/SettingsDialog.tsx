import { useEffect, useState } from "react";
import { clearApiKey, getApiKeyStatus, setApiKey } from "../lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsDialog({ open, onClose }: Props) {
  const [key, setKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setKey("");
      setMessage(null);
      getApiKeyStatus().then(setHasKey).catch(() => setHasKey(false));
    }
  }, [open]);

  if (!open) return null;

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      await setApiKey(key.trim());
      setHasKey(true);
      setKey("");
      setMessage("API key saved to your OS keychain.");
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setMessage(null);
    try {
      await clearApiKey();
      setHasKey(false);
      setMessage("API key removed.");
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-600">
          OpenRouter API key
        </label>
        <p className="mb-2 text-xs text-slate-500">
          Status:{" "}
          <span className={hasKey ? "text-green-600" : "text-amber-600"}>
            {hasKey ? "a key is stored" : "no key stored"}
          </span>
          . Stored securely in your OS keychain — never written to disk in plain text.
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-or-..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />

        {message && (
          <p className="mt-2 text-xs text-slate-600">{message}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          {hasKey ? (
            <button
              onClick={remove}
              disabled={busy}
              className="text-sm text-red-600 hover:underline disabled:opacity-40"
            >
              Remove key
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              onClick={save}
              disabled={busy || !key.trim()}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
            >
              Save key
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Get a key at openrouter.ai/keys. Tip: press Ctrl+Shift+Space anywhere to
          bring wassistant to the front.
        </p>
      </div>
    </div>
  );
}
