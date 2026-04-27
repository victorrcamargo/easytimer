use chrono::Local;
use serde::Serialize;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri_plugin_notification::NotificationExt;

#[derive(Serialize)]
struct EasyTimerEntry {
    data: String,
    inicio: String,
    fim: String,
    task: String,
    funcao: String,
    etapa: String,
    comentario_apontamento: String,
    comentario_atividade: String,
}

fn build_output_dir(export_dir: &str) -> Result<PathBuf, String> {
    let base = Path::new(export_dir);
    if export_dir.trim().is_empty() {
        return Err("Pasta de exportação vazia.".into());
    }
    if !base.exists() {
        return Err("Pasta de exportação não existe.".into());
    }
    if !base.is_dir() {
        return Err("Caminho de exportação não é uma pasta.".into());
    }
    // Save directly into the user-chosen folder.
    Ok(base.to_path_buf())
}

#[tauri::command]
fn save_entry(
    export_dir: String,
    inicio: String,
    fim: String,
    task: String,
    funcao: String,
    etapa: String,
    comentario_apontamento: String,
    comentario_atividade: String,
) -> Result<String, String> {
    let now = Local::now();
    let entry = EasyTimerEntry {
        data: now.format("%d/%m/%Y").to_string(),
        inicio,
        fim,
        task,
        funcao,
        etapa,
        comentario_apontamento,
        comentario_atividade,
    };

    let out_dir = build_output_dir(&export_dir)?;
    // The folder is guaranteed to exist (validated in build_output_dir), so no subdirectories are created.

    let ts = now.format("%Y-%m-%d_%H%M%S").to_string();
    let ms = now.timestamp_subsec_millis();
    let safe_task = entry
        .task
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect::<String>();
    let file_name = format!("{ts}_{ms:03}_{safe_task}.json");
    let file_path = out_dir.join(file_name);

    let json = serde_json::to_string_pretty(&entry).map_err(|e| format!("Falha ao gerar JSON: {e}"))?;
    std::fs::write(&file_path, json).map_err(|e| format!("Falha ao escrever arquivo: {e}"))?;

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
fn update_tray_timer(app: tauri::AppHandle, task_id: String, time_text: String) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main-tray") {
        let tooltip = format!("{} — {}", task_id, time_text);
        tray.set_tooltip(Some(&tooltip)).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn clear_tray_timer(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main-tray") {
        tray.set_tooltip(Some("EasyTimer")).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            use tauri::menu::{Menu, MenuItem};
            use tauri::tray::TrayIconBuilder;

            let open_item = MenuItem::with_id(app, "open", "Abrir janela", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Fechar", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open_item, &quit_item])?;

            let icon = app.default_window_icon().cloned();

            let mut tray = TrayIconBuilder::with_id("main-tray");
            if let Some(icon) = icon {
                tray = tray.icon(icon);
            }

            tray
                .menu(&menu)
                .on_menu_event(|app: &tauri::AppHandle, event: tauri::menu::MenuEvent| match event.id().as_ref() {
                    "open" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.unminimize();
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::DoubleClick { .. } = event {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.unminimize();
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::Resized(_) => {
                if let Ok(true) = window.is_minimized() {
                    let _ = window.hide();
                    let _ = window
                        .app_handle()
                        .notification()
                        .builder()
                        .title("EasyTimer")
                        .body("Aplicativo minimizado para a bandeja do sistema")
                        .show();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![save_entry, update_tray_timer, clear_tray_timer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
