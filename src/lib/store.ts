import { load, type Store } from "@tauri-apps/plugin-store";
import type { Profile, Settings } from "../types";
import { DEFAULT_MODEL } from "../constants";

let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = load("store.json", { autoSave: true });
  }
  return storePromise;
}

export async function loadProfiles(): Promise<Profile[]> {
  const store = await getStore();
  return (await store.get<Profile[]>("profiles")) ?? [];
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  const store = await getStore();
  await store.set("profiles", profiles);
  await store.save();
}

export async function loadSettings(): Promise<Settings> {
  const store = await getStore();
  return (
    (await store.get<Settings>("settings")) ?? {
      activeProfileId: null,
      defaultModel: DEFAULT_MODEL,
    }
  );
}

export async function saveSettings(settings: Settings): Promise<void> {
  const store = await getStore();
  await store.set("settings", settings);
  await store.save();
}
