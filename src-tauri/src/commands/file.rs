use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub is_dir: bool,
    pub extension: Option<String>,
    pub modified: Option<u64>,
}

#[derive(Debug, thiserror::Error)]
pub enum FileError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("File not found: {0}")]
    NotFound(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
}

impl Serialize for FileError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

/// Read file content as string
#[tauri::command]
pub fn read_file(path: &str) -> Result<String, FileError> {
    let path = Path::new(path);

    if !path.exists() {
        return Err(FileError::NotFound(path.display().to_string()));
    }

    let content = fs::read_to_string(path)?;
    Ok(content)
}

/// Write content to file
#[tauri::command]
pub fn write_file(path: &str, content: &str) -> Result<(), FileError> {
    let path = Path::new(path);

    // Create parent directories if they don't exist
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }

    fs::write(path, content)?;
    Ok(())
}

/// Check if file exists
#[tauri::command]
pub fn file_exists(path: &str) -> bool {
    Path::new(path).exists()
}

/// Get file information
#[tauri::command]
pub fn get_file_info(path: &str) -> Result<FileInfo, FileError> {
    let path = Path::new(path);

    if !path.exists() {
        return Err(FileError::NotFound(path.display().to_string()));
    }

    let metadata = fs::metadata(path)?;
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();

    let extension = path
        .extension()
        .map(|e| e.to_string_lossy().to_string());

    let modified = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

    Ok(FileInfo {
        name,
        path: path.display().to_string(),
        size: metadata.len(),
        is_dir: metadata.is_dir(),
        extension,
        modified,
    })
}
