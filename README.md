# wassistant

A small cross-platform desktop app (Tauri + React + TypeScript) that improves your
writing by sending it to an LLM via the [OpenRouter](https://openrouter.ai) API.

- **Profiles / prompts / styles** — create reusable profiles, each with its own system
  prompt, tone/style, model, and temperature.
- **Model picker** — pick any OpenRouter model per profile (list fetched live).
- **Quick copy** — one-click copy of the improved text to the clipboard.
- **Global hotkey** — press `Ctrl+Shift+Space` anywhere to bring the window to the front.
- **Secure key storage** — your OpenRouter API key is stored in the OS keychain
  (Secret Service on Linux), never in plain text. API calls are made from the Rust
  backend, so the key never touches the webview.

## Prerequisites

- Node + pnpm, Rust (installed via rustup).
- Linux system libraries (Fedora):

  ```sh
  sudo dnf install -y webkit2gtk4.1-devel librsvg2-devel dbus-devel
  ```

  (`webkit2gtk` renders the UI, `librsvg2` is used for icons, `dbus` is required by the
  Tauri windowing layer and by the keychain integration.)

## Develop

```sh
pnpm install
pnpm tauri dev
```

## Build a release bundle

```sh
pnpm tauri build
```

## Usage

1. Open **Settings** and paste your OpenRouter API key (get one at
   https://openrouter.ai/keys).
2. Pick or create a **Profile** (Profiles button) — set its prompt, style, model, and
   temperature.
3. Type/paste text on the left, click **Improve** (or `Ctrl+Enter`).
4. Click **Quick copy** to copy the result.

## Project layout

- `src/` — React UI (`App.tsx`, `components/`, `lib/api.ts`, `lib/store.ts`).
- `src-tauri/src/` — Rust backend:
  - `keychain.rs` — API key storage in the OS keychain.
  - `openrouter.rs` — `improve_text` and `list_models` commands (via `reqwest`).
  - `lib.rs` — plugin registration + global shortcut.
- Profiles/settings persist via `tauri-plugin-store` (`store.json` in the app data dir).
  The API key is **not** stored there — it lives in the keychain.
