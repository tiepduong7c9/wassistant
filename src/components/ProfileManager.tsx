import { useEffect, useState } from "react";
import type { Model, Profile } from "../types";
import { DEFAULT_MODEL } from "../constants";

type Props = {
  open: boolean;
  onClose: () => void;
  profiles: Profile[];
  onChange: (profiles: Profile[]) => void;
  models: Model[];
};

export default function ProfileManager({
  open,
  onClose,
  profiles,
  onChange,
  models,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    profiles[0]?.id ?? null,
  );

  useEffect(() => {
    if (open && !profiles.some((p) => p.id === selectedId)) {
      setSelectedId(profiles[0]?.id ?? null);
    }
  }, [open, profiles, selectedId]);

  if (!open) return null;

  const selected = profiles.find((p) => p.id === selectedId) ?? null;

  function update(patch: Partial<Profile>) {
    if (!selected) return;
    onChange(
      profiles.map((p) => (p.id === selected.id ? { ...p, ...patch } : p)),
    );
  }

  function addProfile() {
    const p: Profile = {
      id: crypto.randomUUID(),
      name: "New profile",
      systemPrompt:
        "Improve the user's text and reply with only the improved version.",
      style: "",
      model: DEFAULT_MODEL,
      temperature: 0.4,
    };
    onChange([...profiles, p]);
    setSelectedId(p.id);
  }

  function removeProfile(id: string) {
    onChange(profiles.filter((p) => p.id !== id));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[520px] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        {/* List */}
        <div className="flex w-56 flex-col border-r border-slate-200 bg-slate-50">
          <div className="border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
            Profiles
          </div>
          <div className="flex-1 overflow-auto">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`block w-full truncate px-3 py-2 text-left text-sm ${
                  p.id === selectedId
                    ? "bg-white font-medium text-slate-900"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p.name || "Untitled"}
              </button>
            ))}
          </div>
          <button
            onClick={addProfile}
            className="border-t border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
          >
            + Add profile
          </button>
        </div>

        {/* Editor */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
            <h2 className="text-lg font-semibold text-slate-800">
              Edit profile
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {selected ? (
            <div className="flex-1 space-y-3 overflow-auto p-4">
              <Field label="Name">
                <input
                  value={selected.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field label="Prompt (how to rewrite)">
                <textarea
                  value={selected.systemPrompt}
                  onChange={(e) => update({ systemPrompt: e.target.value })}
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <Field label="Style / tone">
                <input
                  value={selected.style}
                  onChange={(e) => update({ style: e.target.value })}
                  placeholder="e.g. formal, concise, British English"
                  className={inputCls}
                />
              </Field>

              <div className="flex gap-3">
                <Field label="Model" className="flex-1">
                  {models.length > 0 ? (
                    <select
                      value={selected.model}
                      onChange={(e) => update({ model: e.target.value })}
                      className={inputCls}
                    >
                      {!models.some((m) => m.id === selected.model) && (
                        <option value={selected.model}>{selected.model}</option>
                      )}
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={selected.model}
                      onChange={(e) => update({ model: e.target.value })}
                      className={inputCls}
                    />
                  )}
                </Field>

                <Field label={`Temperature (${selected.temperature.toFixed(1)})`}>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={selected.temperature}
                    onChange={(e) =>
                      update({ temperature: Number(e.target.value) })
                    }
                    className="w-40"
                  />
                </Field>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => removeProfile(selected.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete this profile
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              No profiles yet — add one to get started.
            </div>
          )}

          <div className="border-t border-slate-200 px-4 py-2 text-right">
            <button
              onClick={onClose}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}
