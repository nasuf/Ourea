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

#[derive(Debug, Serialize, Deserialize)]
pub struct FileTreeNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub extension: Option<String>,
    pub children: Option<Vec<FileTreeNode>>,
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

/// Read directory contents (non-recursive, one level)
#[tauri::command]
pub fn read_directory(path: &str) -> Result<Vec<FileTreeNode>, FileError> {
    let path = Path::new(path);

    if !path.exists() {
        return Err(FileError::NotFound(path.display().to_string()));
    }

    if !path.is_dir() {
        return Err(FileError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Path is not a directory",
        )));
    }

    let mut entries: Vec<FileTreeNode> = Vec::new();

    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let entry_path = entry.path();
        let metadata = entry.metadata()?;

        let name = entry_path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        // Skip hidden files (starting with .)
        if name.starts_with('.') {
            continue;
        }

        let extension = entry_path
            .extension()
            .map(|e| e.to_string_lossy().to_string());

        let is_dir = metadata.is_dir();

        entries.push(FileTreeNode {
            name,
            path: entry_path.display().to_string(),
            is_dir,
            extension,
            children: if is_dir { Some(Vec::new()) } else { None },
        });
    }

    // Sort: directories first, then by name
    entries.sort_by(|a, b| {
        match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(entries)
}

/// Check if a file extension is a supported text file
fn is_text_file_extension(ext: Option<&str>) -> bool {
    matches!(
        ext,
        // Markdown
        Some("md") | Some("markdown") |
        // Plain text
        Some("txt") | Some("text") |
        // Code files
        Some("js") | Some("ts") | Some("jsx") | Some("tsx") |
        Some("vue") | Some("svelte") |
        Some("html") | Some("htm") | Some("xml") | Some("svg") |
        Some("css") | Some("scss") | Some("sass") | Some("less") |
        Some("json") | Some("yaml") | Some("yml") | Some("toml") |
        Some("rs") | Some("go") | Some("py") | Some("rb") | Some("php") |
        Some("java") | Some("kt") | Some("scala") | Some("swift") |
        Some("c") | Some("cpp") | Some("h") | Some("hpp") |
        Some("cs") | Some("fs") |
        Some("sh") | Some("bash") | Some("zsh") | Some("fish") |
        Some("ps1") | Some("bat") | Some("cmd") |
        Some("sql") | Some("graphql") | Some("gql") |
        // Config files
        Some("env") | Some("ini") | Some("conf") | Some("cfg") |
        Some("gitignore") | Some("dockerignore") | Some("editorconfig") |
        // Documentation
        Some("rst") | Some("adoc") | Some("org") | Some("tex") |
        // Data files
        Some("csv") | Some("tsv") | Some("log")
    )
}

/// Read directory recursively (with depth limit)
#[tauri::command]
pub fn read_directory_recursive(path: &str, max_depth: Option<u32>) -> Result<FileTreeNode, FileError> {
    let path = Path::new(path);
    let max_depth = max_depth.unwrap_or(3);

    if !path.exists() {
        return Err(FileError::NotFound(path.display().to_string()));
    }

    fn read_dir_recursive(path: &Path, current_depth: u32, max_depth: u32) -> Result<FileTreeNode, FileError> {
        let name = path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| path.display().to_string());

        let extension = path
            .extension()
            .map(|e| e.to_string_lossy().to_string());

        let is_dir = path.is_dir();

        let children = if is_dir && current_depth < max_depth {
            let mut entries: Vec<FileTreeNode> = Vec::new();

            if let Ok(read_dir) = fs::read_dir(path) {
                for entry in read_dir.flatten() {
                    let entry_path = entry.path();
                    let entry_name = entry_path
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();

                    // Skip hidden files
                    if entry_name.starts_with('.') {
                        continue;
                    }

                    // Include directories and supported text files
                    let is_entry_dir = entry_path.is_dir();
                    let entry_ext = entry_path
                        .extension()
                        .map(|e| e.to_string_lossy().to_string());

                    if is_entry_dir || is_text_file_extension(entry_ext.as_deref()) {
                        if let Ok(child) = read_dir_recursive(&entry_path, current_depth + 1, max_depth) {
                            entries.push(child);
                        }
                    }
                }
            }

            // Sort: directories first, then by name
            entries.sort_by(|a, b| {
                match (a.is_dir, b.is_dir) {
                    (true, false) => std::cmp::Ordering::Less,
                    (false, true) => std::cmp::Ordering::Greater,
                    _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
                }
            });

            Some(entries)
        } else if is_dir {
            Some(Vec::new())
        } else {
            None
        };

        Ok(FileTreeNode {
            name,
            path: path.display().to_string(),
            is_dir,
            extension,
            children,
        })
    }

    read_dir_recursive(path, 0, max_depth)
}

/// Create a new file
#[tauri::command]
pub fn create_file(path: &str, content: Option<&str>) -> Result<(), FileError> {
    let path = Path::new(path);

    if path.exists() {
        return Err(FileError::Io(std::io::Error::new(
            std::io::ErrorKind::AlreadyExists,
            "File already exists",
        )));
    }

    // Create parent directories if needed
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }

    fs::write(path, content.unwrap_or(""))?;
    Ok(())
}

/// Create a new directory
#[tauri::command]
pub fn create_directory(path: &str) -> Result<(), FileError> {
    let path = Path::new(path);

    if path.exists() {
        return Err(FileError::Io(std::io::Error::new(
            std::io::ErrorKind::AlreadyExists,
            "Directory already exists",
        )));
    }

    fs::create_dir_all(path)?;
    Ok(())
}

/// Rename a file or directory
#[tauri::command]
pub fn rename_path(old_path: &str, new_path: &str) -> Result<(), FileError> {
    let old = Path::new(old_path);
    let new = Path::new(new_path);

    if !old.exists() {
        return Err(FileError::NotFound(old_path.to_string()));
    }

    if new.exists() {
        return Err(FileError::Io(std::io::Error::new(
            std::io::ErrorKind::AlreadyExists,
            "Target path already exists",
        )));
    }

    fs::rename(old, new)?;
    Ok(())
}

/// Delete a file or directory
#[tauri::command]
pub fn delete_path(path: &str) -> Result<(), FileError> {
    let path = Path::new(path);

    if !path.exists() {
        return Err(FileError::NotFound(path.display().to_string()));
    }

    if path.is_dir() {
        fs::remove_dir_all(path)?;
    } else {
        fs::remove_file(path)?;
    }

    Ok(())
}

/// Reveal file in system file manager (Finder on macOS)
#[tauri::command]
pub fn reveal_in_finder(path: &str) -> Result<(), FileError> {
    let path = Path::new(path);

    if !path.exists() {
        return Err(FileError::NotFound(path.display().to_string()));
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-R")
            .arg(path)
            .spawn()
            .map_err(|e| FileError::Io(e))?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg("/select,")
            .arg(path)
            .spawn()
            .map_err(|e| FileError::Io(e))?;
    }

    #[cfg(target_os = "linux")]
    {
        // Try xdg-open on the parent directory
        if let Some(parent) = path.parent() {
            std::process::Command::new("xdg-open")
                .arg(parent)
                .spawn()
                .map_err(|e| FileError::Io(e))?;
        }
    }

    Ok(())
}
