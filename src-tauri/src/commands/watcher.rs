use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileChangeEvent {
    pub path: String,
    pub kind: String,
}

#[derive(Debug, thiserror::Error)]
pub enum WatcherError {
    #[error("Watcher error: {0}")]
    Watch(String),
    #[error("Path not found: {0}")]
    NotFound(String),
}

impl Serialize for WatcherError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub struct WatcherState {
    watchers: HashMap<String, RecommendedWatcher>,
}

impl WatcherState {
    pub fn new() -> Self {
        Self {
            watchers: HashMap::new(),
        }
    }
}

impl Default for WatcherState {
    fn default() -> Self {
        Self::new()
    }
}

fn event_kind_to_string(kind: &notify::EventKind) -> String {
    match kind {
        notify::EventKind::Create(_) => "create".to_string(),
        notify::EventKind::Modify(_) => "modify".to_string(),
        notify::EventKind::Remove(_) => "remove".to_string(),
        notify::EventKind::Access(_) => "access".to_string(),
        notify::EventKind::Other => "other".to_string(),
        _ => "unknown".to_string(),
    }
}

/// Start watching a file for changes
#[tauri::command]
pub fn start_watching(
    app: AppHandle,
    path: String,
    state: tauri::State<'_, Arc<Mutex<WatcherState>>>,
) -> Result<(), WatcherError> {
    let path_buf = PathBuf::from(&path);

    if !path_buf.exists() {
        return Err(WatcherError::NotFound(path.clone()));
    }

    let app_handle = app.clone();
    let watch_path = path.clone();

    let mut watcher = RecommendedWatcher::new(
        move |result: Result<Event, notify::Error>| {
            if let Ok(event) = result {
                for event_path in event.paths {
                    let change_event = FileChangeEvent {
                        path: event_path.display().to_string(),
                        kind: event_kind_to_string(&event.kind),
                    };

                    // Emit event to frontend
                    let _ = app_handle.emit("file-changed", change_event);
                }
            }
        },
        Config::default(),
    )
    .map_err(|e| WatcherError::Watch(e.to_string()))?;

    watcher
        .watch(&path_buf, RecursiveMode::NonRecursive)
        .map_err(|e| WatcherError::Watch(e.to_string()))?;

    // Store watcher in state
    let mut state = state.lock().unwrap();
    state.watchers.insert(watch_path, watcher);

    Ok(())
}

/// Stop watching a file
#[tauri::command]
pub fn stop_watching(
    path: String,
    state: tauri::State<'_, Arc<Mutex<WatcherState>>>,
) -> Result<(), WatcherError> {
    let mut state = state.lock().unwrap();

    if let Some(mut watcher) = state.watchers.remove(&path) {
        let path_buf = PathBuf::from(&path);
        watcher
            .unwatch(&path_buf)
            .map_err(|e| WatcherError::Watch(e.to_string()))?;
    }

    Ok(())
}

/// Stop all file watchers
#[tauri::command]
pub fn stop_all_watching(
    state: tauri::State<'_, Arc<Mutex<WatcherState>>>,
) -> Result<(), WatcherError> {
    let mut state = state.lock().unwrap();
    state.watchers.clear();
    Ok(())
}
