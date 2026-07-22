use serde::{Deserialize, Serialize};

use crate::keychain;

const CHAT_URL: &str = "https://openrouter.ai/api/v1/chat/completions";
const MODELS_URL: &str = "https://openrouter.ai/api/v1/models";

#[derive(Serialize)]
struct ChatMessage {
    role: &'static str,
    content: String,
}

#[derive(Serialize)]
struct ChatRequest<'a> {
    model: &'a str,
    messages: Vec<ChatMessage>,
    temperature: f32,
}

#[derive(Deserialize)]
struct ChatChoiceMessage {
    content: String,
}

#[derive(Deserialize)]
struct ChatChoice {
    message: ChatChoiceMessage,
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
}

#[derive(Deserialize)]
struct ApiError {
    error: ApiErrorBody,
}

#[derive(Deserialize)]
struct ApiErrorBody {
    message: String,
}

fn client() -> reqwest::Client {
    reqwest::Client::builder()
        .user_agent("wassistant/0.1")
        .build()
        .unwrap_or_default()
}

/// Send the user's text to OpenRouter with the active profile's prompt + style and
/// return the improved text.
#[tauri::command]
pub async fn improve_text(
    input: String,
    system_prompt: String,
    style: String,
    model: String,
    temperature: f32,
) -> Result<String, String> {
    if input.trim().is_empty() {
        return Err("Nothing to improve — the input is empty.".into());
    }
    let key = keychain::get_key()?
        .ok_or_else(|| "No OpenRouter API key set. Add one in Settings.".to_string())?;

    let mut system = if system_prompt.trim().is_empty() {
        "You are a writing assistant. Improve the user's text: fix grammar and spelling, \
         improve clarity and flow, and keep the original meaning. Reply with only the \
         improved text and no commentary."
            .to_string()
    } else {
        system_prompt
    };
    if !style.trim().is_empty() {
        system.push_str("\n\nWriting style / tone to apply: ");
        system.push_str(style.trim());
    }

    let body = ChatRequest {
        model: &model,
        messages: vec![
            ChatMessage {
                role: "system",
                content: system,
            },
            ChatMessage {
                role: "user",
                content: input,
            },
        ],
        temperature,
    };

    let resp = client()
        .post(CHAT_URL)
        .bearer_auth(&key)
        .header("HTTP-Referer", "https://wassistant.local")
        .header("X-Title", "wassistant")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let status = resp.status();
    let text = resp.text().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        if let Ok(err) = serde_json::from_str::<ApiError>(&text) {
            return Err(err.error.message);
        }
        return Err(format!("OpenRouter error ({status}): {text}"));
    }

    let parsed: ChatResponse =
        serde_json::from_str(&text).map_err(|e| format!("Failed to parse response: {e}"))?;
    parsed
        .choices
        .into_iter()
        .next()
        .map(|c| c.message.content.trim().to_string())
        .ok_or_else(|| "OpenRouter returned no choices.".to_string())
}

#[derive(Deserialize)]
struct ModelsResponse {
    data: Vec<ModelData>,
}

#[derive(Deserialize)]
struct ModelData {
    id: String,
    name: Option<String>,
}

#[derive(Serialize)]
pub struct Model {
    pub id: String,
    pub name: String,
}

/// Fetch the list of available models from OpenRouter to populate the model picker.
#[tauri::command]
pub async fn list_models() -> Result<Vec<Model>, String> {
    let mut req = client().get(MODELS_URL);
    // The key is optional for this endpoint, but include it when present.
    if let Ok(Some(key)) = keychain::get_key() {
        req = req.bearer_auth(key);
    }

    let resp = req
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;
    let status = resp.status();
    let text = resp.text().await.map_err(|e| e.to_string())?;
    if !status.is_success() {
        return Err(format!("Failed to load models ({status})"));
    }

    let parsed: ModelsResponse =
        serde_json::from_str(&text).map_err(|e| format!("Failed to parse models: {e}"))?;
    let mut models: Vec<Model> = parsed
        .data
        .into_iter()
        .map(|m| Model {
            name: m.name.unwrap_or_else(|| m.id.clone()),
            id: m.id,
        })
        .collect();
    models.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(models)
}
