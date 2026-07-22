mod keychain;
mod openrouter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        use tauri::Manager;
        use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};

        // Ctrl/Cmd + Shift + Space brings the window to the front from anywhere.
        let toggle = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
        builder = builder.plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut(toggle.clone())
                .expect("failed to register global shortcut")
                .with_handler(move |app, shortcut, event| {
                    if shortcut == &toggle && event.state() == ShortcutState::Pressed {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.unminimize();
                            let _ = win.set_focus();
                        }
                    }
                })
                .build(),
        );
    }

    builder
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            keychain::set_api_key,
            keychain::get_api_key_status,
            keychain::clear_api_key,
            openrouter::improve_text,
            openrouter::list_models,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
