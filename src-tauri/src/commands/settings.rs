use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    // Theme settings
    pub theme_mode: String,
    pub selected_theme_id: String,

    // Editor settings
    pub font_size: u32,
    pub font_family: String,
    pub line_height: f64,
    pub auto_save: bool,
    pub auto_save_interval: u32,
    pub spell_check: bool,
    pub show_line_numbers: bool,

    // UI settings
    pub sidebar_visible: bool,
    pub sidebar_width: u32,
    pub outline_visible: bool,
    pub outline_width: u32,
    pub focus_mode: bool,
    pub typewriter_mode: bool,
    pub paragraph_focus: bool,
    pub paragraph_focus_opacity: f64,

    // Image settings
    pub image_storage_location: String,
    pub image_naming_rule: String,
    pub image_assets_folder: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme_mode: "system".to_string(),
            selected_theme_id: "".to_string(),
            font_size: 16,
            font_family: "system-ui, -apple-system, sans-serif".to_string(),
            line_height: 1.6,
            auto_save: true,
            auto_save_interval: 30000,
            spell_check: false,
            show_line_numbers: false,
            sidebar_visible: true,
            sidebar_width: 250,
            outline_visible: true,
            outline_width: 200,
            focus_mode: false,
            typewriter_mode: false,
            paragraph_focus: false,
            paragraph_focus_opacity: 0.3,
            image_storage_location: "relative".to_string(),
            image_naming_rule: "timestamp".to_string(),
            image_assets_folder: "assets".to_string(),
        }
    }
}

/// Get the settings file path
fn get_settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    // Ensure directory exists
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }

    Ok(app_data_dir.join("settings.json"))
}

/// Load settings from file
#[tauri::command]
pub async fn load_settings(app: tauri::AppHandle) -> Result<AppSettings, String> {
    let settings_path = get_settings_path(&app)?;

    if !settings_path.exists() {
        // Return default settings if file doesn't exist
        return Ok(AppSettings::default());
    }

    let content = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings file: {}", e))?;

    let settings: AppSettings = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;

    Ok(settings)
}

/// Save settings to file
#[tauri::command]
pub async fn save_settings(app: tauri::AppHandle, settings: AppSettings) -> Result<(), String> {
    let settings_path = get_settings_path(&app)?;

    let content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&settings_path, content)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;

    Ok(())
}

/// Get the settings file path (for debugging)
#[tauri::command]
pub async fn get_settings_file_path(app: tauri::AppHandle) -> Result<String, String> {
    let path = get_settings_path(&app)?;
    Ok(path.to_string_lossy().to_string())
}
