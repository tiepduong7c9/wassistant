import { useEffect, useMemo, useState } from "react";
import type { Model, Profile, Settings } from "./types";
import { seedProfiles } from "./constants";
import {
  loadProfiles,
  loadSettings,
  saveProfiles,
  saveSettings,
} from "./lib/store";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import { improveText, listModels } from "./lib/api";
import OutputPane from "./components/OutputPane";
import SettingsDialog from "./components/SettingsDialog";
import ProfileManager from "./components/ProfileManager";

function App() {
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<Settings>({
    activeProfileId: null,
    defaultModel: "",
  });
  const [models, setModels] = useState<Model[]>([]);

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);

  // Initial load: profiles + settings (seed on first run), then models.
  useEffect(() => {
    (async () => {
      let ps = await loadProfiles();
      if (ps.length === 0) {
        ps = seedProfiles();
        await saveProfiles(ps);
      }
      const s = await loadSettings();
      if (!s.activeProfileId || !ps.some((p) => p.id === s.activeProfileId)) {
        s.activeProfileId = ps[0]?.id ?? null;
        await saveSettings(s);
      }
      setProfiles(ps);
      setSettings(s);
      setReady(true);

      listModels()
        .then(setModels)
        .catch(() => setModels([]));
    })();
  }, []);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === settings.activeProfileId) ?? null,
    [profiles, settings.activeProfileId],
  );

  async function persistProfiles(next: Profile[]) {
    setProfiles(next);
    await saveProfiles(next);
  }

  async function setActiveProfile(id: string) {
    const next = { ...settings, activeProfileId: id };
    setSettings(next);
    await saveSettings(next);
  }

  async function improve() {
    if (!activeProfile || !input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const result = await improveText({
        input,
        systemPrompt: activeProfile.systemPrompt,
        style: activeProfile.style,
        model: activeProfile.model,
        temperature: activeProfile.temperature,
      });
      setOutput(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await readText();
      if (text) setInput(text);
    } catch {
      // clipboard empty or not text — ignore
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      improve();
    }
  }

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-100">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
            {profiles.map((p) => {
              const active = p.id === settings.activeProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProfile(p.id)}
                  title={p.name || "Untitled"}
                  className={`shrink-0 rounded-md px-3 py-1 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {p.name || "Untitled"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowProfiles(true)}
            className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Profiles
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Settings
          </button>
        </div>
      </header>

      {/* Body: two panes */}
      <main className="grid flex-1 grid-cols-2 gap-3 overflow-hidden p-3">
        {/* Input */}
        <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <span className="text-sm font-medium text-slate-600">Your text</span>
            <button
              onClick={pasteFromClipboard}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Paste
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Type or paste the text you want to improve…"
            className="flex-1 resize-none p-3 text-sm text-slate-800 focus:outline-none"
          />
        </div>

        {/* Output */}
        <OutputPane text={output} loading={loading} error={error} />
      </main>

      {/* Footer / actions */}
      <footer className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-2.5">
        <span className="text-xs text-slate-400">
          {activeProfile
            ? `Model: ${activeProfile.model}`
            : "No profile selected"}
        </span>
        <span className="text-xs text-slate-300">·</span>
        <span className="text-xs text-slate-400">Ctrl+Enter to improve</span>
        <button
          onClick={improve}
          disabled={loading || !input.trim() || !activeProfile}
          className="ml-auto rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Improving…" : "Improve"}
        </button>
      </footer>

      <SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
      <ProfileManager
        open={showProfiles}
        onClose={() => setShowProfiles(false)}
        profiles={profiles}
        onChange={persistProfiles}
        models={models}
      />
    </div>
  );
}

export default App;
