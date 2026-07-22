export type Profile = {
  id: string;
  name: string;
  /** How the text should be rewritten — the system prompt. */
  systemPrompt: string;
  /** Tone / style guidance appended to the prompt, e.g. "formal, concise, British English". */
  style: string;
  /** OpenRouter model id, e.g. "openai/gpt-4o-mini". */
  model: string;
  temperature: number;
};

export type Settings = {
  activeProfileId: string | null;
  defaultModel: string;
};

export type Model = {
  id: string;
  name: string;
};
