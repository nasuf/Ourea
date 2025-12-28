mod commands;

use commands::watcher::WatcherState;
use std::sync::{Arc, Mutex};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(Arc::new(Mutex::new(WatcherState::new())))
        .setup(|app| {
            // Initialize logging in debug mode
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Get main window and configure it
            if let Some(window) = app.get_webview_window("main") {
                // Enable devtools in debug mode
                #[cfg(debug_assertions)]
                window.open_devtools();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::file::read_file,
            commands::file::write_file,
            commands::file::file_exists,
            commands::file::get_file_info,
            commands::file::read_directory,
            commands::file::read_directory_recursive,
            commands::file::create_file,
            commands::file::create_directory,
            commands::file::rename_path,
            commands::file::delete_path,
            commands::file::reveal_in_finder,
            commands::file::save_image,
            commands::file::copy_image,
            commands::file::open_in_system,
            commands::watcher::start_watching,
            commands::watcher::stop_watching,
            commands::watcher::stop_all_watching,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
