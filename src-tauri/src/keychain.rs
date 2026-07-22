use keyring::Entry;

const SERVICE: &str = "wassistant";
const ACCOUNT: &str = "openrouter";

fn entry() -> Result<Entry, String> {
    Entry::new(SERVICE, ACCOUNT).map_err(|e| e.to_string())
}

/// Read the stored OpenRouter API key, if any. Used internally by the OpenRouter client.
pub fn get_key() -> Result<Option<String>, String> {
    match entry()?.get_password() {
        Ok(k) => Ok(Some(k)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn set_api_key(key: String) -> Result<(), String> {
    let key = key.trim();
    if key.is_empty() {
        return Err("API key cannot be empty".into());
    }
    entry()?.set_password(key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_api_key_status() -> Result<bool, String> {
    Ok(get_key()?.is_some())
}

#[tauri::command]
pub fn clear_api_key() -> Result<(), String> {
    match entry()?.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
