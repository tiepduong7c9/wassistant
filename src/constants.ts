import type { Profile } from "./types";

export const DEFAULT_MODEL = "openai/gpt-4o-mini";

/** A small starter set so the app is useful on first launch. */
export const seedProfiles = (): Profile[] => [
  {
    id: crypto.randomUUID(),
    name: "Clean up",
    systemPrompt:
      "You are a writing assistant. Improve the user's text: fix grammar and spelling, improve clarity and flow, and keep the original meaning and length. Reply with only the improved text and no commentary.",
    style: "clear, natural, neutral tone",
    model: DEFAULT_MODEL,
    temperature: 0.3,
  },
  {
    id: crypto.randomUUID(),
    name: "Professional email",
    systemPrompt:
      "Rewrite the user's text as a polished professional email body. Keep it courteous and concise. Reply with only the rewritten text.",
    style: "formal, polite, concise, British English",
    model: DEFAULT_MODEL,
    temperature: 0.4,
  },
  {
    id: crypto.randomUUID(),
    name: "Friendly & casual",
    systemPrompt:
      "Rewrite the user's text in a warm, casual, conversational tone while keeping the meaning. Reply with only the rewritten text.",
    style: "friendly, relaxed, approachable",
    model: DEFAULT_MODEL,
    temperature: 0.7,
  },
];
