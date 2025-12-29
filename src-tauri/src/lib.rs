mod commands;

use commands::watcher::WatcherState;
use std::sync::{Arc, Mutex};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{Emitter, Manager};

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

            // Create application menu
            let handle = app.handle();

            // App menu (macOS specific)
            let about = PredefinedMenuItem::about(handle, Some("About Ourea"), None)?;
            let settings = MenuItem::with_id(handle, "settings", "Settings...", true, Some("CmdOrCtrl+,"))?;
            let separator = PredefinedMenuItem::separator(handle)?;
            let quit = PredefinedMenuItem::quit(handle, Some("Quit Ourea"))?;

            let app_menu = Submenu::with_items(
                handle,
                "Ourea",
                true,
                &[&about, &separator, &settings, &separator, &quit],
            )?;

            // File menu
            let new_file = MenuItem::with_id(handle, "new_file", "New File", true, Some("CmdOrCtrl+N"))?;
            let open_file = MenuItem::with_id(handle, "open_file", "Open...", true, Some("CmdOrCtrl+O"))?;
            let save_file = MenuItem::with_id(handle, "save_file", "Save", true, Some("CmdOrCtrl+S"))?;
            let save_as = MenuItem::with_id(handle, "save_as", "Save As...", true, Some("CmdOrCtrl+Shift+S"))?;
            let close_tab = MenuItem::with_id(handle, "close_tab", "Close Tab", true, Some("CmdOrCtrl+W"))?;

            let file_menu = Submenu::with_items(
                handle,
                "File",
                true,
                &[&new_file, &open_file, &PredefinedMenuItem::separator(handle)?, &save_file, &save_as, &PredefinedMenuItem::separator(handle)?, &close_tab],
            )?;

            // Edit menu
            let undo = PredefinedMenuItem::undo(handle, None)?;
            let redo = PredefinedMenuItem::redo(handle, None)?;
            let cut = PredefinedMenuItem::cut(handle, None)?;
            let copy = PredefinedMenuItem::copy(handle, None)?;
            let paste = PredefinedMenuItem::paste(handle, None)?;
            let select_all = PredefinedMenuItem::select_all(handle, None)?;
            let find = MenuItem::with_id(handle, "find", "Find...", true, Some("CmdOrCtrl+F"))?;
            let replace = MenuItem::with_id(handle, "replace", "Replace...", true, Some("CmdOrCtrl+H"))?;

            let edit_menu = Submenu::with_items(
                handle,
                "Edit",
                true,
                &[&undo, &redo, &PredefinedMenuItem::separator(handle)?, &cut, &copy, &paste, &select_all, &PredefinedMenuItem::separator(handle)?, &find, &replace],
            )?;

            // View menu
            let toggle_sidebar = MenuItem::with_id(handle, "toggle_sidebar", "Toggle Sidebar", true, Some("CmdOrCtrl+\\"))?;
            let toggle_outline = MenuItem::with_id(handle, "toggle_outline", "Toggle Outline", true, Some("CmdOrCtrl+Shift+O"))?;
            let toggle_focus = MenuItem::with_id(handle, "toggle_focus", "Focus Mode", true, Some("CmdOrCtrl+Shift+Enter"))?;
            let fullscreen = PredefinedMenuItem::fullscreen(handle, None)?;

            let view_menu = Submenu::with_items(
                handle,
                "View",
                true,
                &[&toggle_sidebar, &toggle_outline, &toggle_focus, &PredefinedMenuItem::separator(handle)?, &fullscreen],
            )?;

            // Window menu
            let minimize = PredefinedMenuItem::minimize(handle, None)?;
            let close_window = PredefinedMenuItem::close_window(handle, None)?;

            let window_menu = Submenu::with_items(
                handle,
                "Window",
                true,
                &[&minimize, &close_window],
            )?;

            // Help menu
            let show_help = MenuItem::with_id(handle, "show_help", "Ourea Help", true, None::<&str>)?;

            let help_menu = Submenu::with_items(
                handle,
                "Help",
                true,
                &[&show_help],
            )?;

            // Build complete menu
            let menu = Menu::with_items(
                handle,
                &[&app_menu, &file_menu, &edit_menu, &view_menu, &window_menu, &help_menu],
            )?;

            app.set_menu(menu)?;

            // Get main window and configure it
            if let Some(window) = app.get_webview_window("main") {
                // Enable devtools in debug mode
                #[cfg(debug_assertions)]
                window.open_devtools();
            }

            Ok(())
        })
        .on_menu_event(|app, event| {
            // Handle menu events by emitting them to the frontend
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("menu-event", event.id().0.as_str());
            }
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
