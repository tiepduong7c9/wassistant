import { invoke } from "@tauri-apps/api/core";
import type { Model } from "../types";

export type ImproveArgs = {
  input: string;
  systemPrompt: string;
  style: string;
  model: string;
  temperature: number;
};

/** Send text to OpenRouter (via the Rust backend) and return the improved version. */
export const improveText = (args: ImproveArgs) =>
  invoke<string>("improve_text", args);

/** Fetch available OpenRouter models for the picker. */
export const listModels = () => invoke<Model[]>("list_models");

/** Store the OpenRouter API key in the OS keychain. */
export const setApiKey = (key: string) => invoke<void>("set_api_key", { key });

/** Whether an API key is currently stored. */
export const getApiKeyStatus = () => invoke<boolean>("get_api_key_status");

/** Remove the stored API key. */
export const clearApiKey = () => invoke<void>("clear_api_key");
