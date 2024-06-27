// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#[cfg(any(windows, target_os = "macos"))]

use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayMenu};
use tokio;
use tokio::time::{interval, Duration};
use tokio::task;
use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextA, GetWindowTextLengthA, GetWindowThreadProcessId};
use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
use windows::Win32::System::Threading::OpenProcess;
use windows::Win32::System::Threading::PROCESS_ACCESS_RIGHTS;
use hidapi_rusb::HidApi;
use window_shadows::set_shadow;


const DRUNK_DEER_VENDOR_ID: u16 = 0x352d;

/**
 * Get the Vec<u8> of current window name.
 */
unsafe fn get_current_window_name() -> Result<Vec<u8>, String> {
    let hwnd = GetForegroundWindow();
    let length = GetWindowTextLengthA(hwnd) as usize + 1;
    if length == 0 {
        return Err("Window length is 0".to_string());
    }
    let mut lp_string = vec![0_u8; length];
  
    GetWindowTextA(hwnd, &mut lp_string);
    return Ok(lp_string);
}

/**
 * Get the Vec<u8> of module name of current window.
 */
unsafe fn get_current_module_name() -> Result<Vec<u8>, String> {
    let hwnd = GetForegroundWindow();

    // Process PID
    let mut lpdw_process_id: u32 = 0;

    GetWindowThreadProcessId(hwnd, Some(&mut lpdw_process_id));

    match OpenProcess(PROCESS_ACCESS_RIGHTS(0x0010) | PROCESS_ACCESS_RIGHTS(0x0400), false, lpdw_process_id) {
        Ok(process_handle) => {
            let mut lp_file_name:Vec<u16> = vec![0_u16; 256];

            let len = GetModuleFileNameExW(process_handle, None, &mut lp_file_name);
            lp_file_name.set_len(len as usize);
            let u8: Vec<u8> = lp_file_name.iter().map(|&x| x as u8).collect();

            Ok(u8)
           
        },
        Err(e) => {Err(e.to_string())},
    }
    
}

/**
 * Observe changing window.
 */
fn window_listener(mut window_name_buf : Arc<Vec<u8>>, on_change: impl Fn(Arc<Vec<u8>>) + Send + 'static) {    
    
    let _handle = task::spawn(async move {
        let mut i = interval(Duration::from_secs(1));

        loop {
            i.tick().await;
    
            match unsafe { get_current_window_name() } {
                Ok(name) => {
                    if name != *window_name_buf {
                        window_name_buf = name.into();
                        let clone = window_name_buf.clone();
                        on_change(clone);
                    }
                },
                Err(_) => {},
            }
        }
    });
}

/**
 * Main window unminimize and focus.
 */
fn open_main_window(app: &AppHandle) {
    let window = app.get_window("main").unwrap();
    window.show().unwrap();
    window.unminimize().unwrap();
    window.set_focus().unwrap();
}

/**
 * tauri WINDOW_CHANGE event payload.
 */
#[derive(Debug, Serialize, Deserialize, Clone)]
struct WindowChangePayload {
    window_name: Vec<u8>,
    module_name: Vec<u8>,
}

/**
 * Get exe path of self.
 */
#[tauri::command]
fn get_exe_path() -> String {
    std::env::current_exe().unwrap().to_string_lossy().to_string()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ConnectHidDeviceResponse {
    product_id: u16,
    serial_number: String,
    product_name: String,
    release_number: u16,
    interface_number: i32,
    path: String
}

#[tauri::command]
fn get_hid_devices() -> Result<Vec<ConnectHidDeviceResponse>, String> {
    match HidApi::new() {
        Ok(api) => {
            let mut return_devices_list: Vec<ConnectHidDeviceResponse> = Vec::new();

            for device in api.device_list() {
                if DRUNK_DEER_VENDOR_ID == device.vendor_id() {
                    let interface_number = device.interface_number();
                    let p = device.usage_page();

                    if p == 65280 {
                        let path: String = device.path().to_string_lossy().to_string();
                        let product_id = device.product_id();
                        let serial_number = device.serial_number().unwrap().to_string();
                        let product_name = device.product_string().unwrap().to_string();
                        let release_number = device.release_number();

                        return_devices_list.push(ConnectHidDeviceResponse {
                            product_id,
                            serial_number,
                            product_name,
                            release_number,
                            interface_number,
                            path
                        });    
                                            
                   }

                }
            };

            Ok(return_devices_list)
        },
        Err(e) => {
            Err(e.to_string())
        },
    }
}


#[tauri::command]
fn send_packet_to_hid(path: String, report_id: u8, packets: Vec<Vec<u8>>) -> Result<usize, String> {
    match HidApi::new() {
        Ok(api) => {
            let count = api.device_list().count();
            
            if count != 0 {
                for device in api.device_list() {
                    let device_path: String = device.path().to_string_lossy().to_string();

                    if path == device_path {
                        match device.open_device(&api) {
                            Ok(opened) => {
                                let packets_iter = packets.iter();

                                for packet in packets_iter {
                                    let mut report = vec![report_id];
                                    for b in packet {
                                        report.push(*b)
                                    }
                                    match opened.write(&report) {
                                        Ok(_size) => {
                                        },
                                        Err(e) => {
                                            return Err("[SEND REPORT ERROR] ".to_string() + &e.to_string())
                                        },
                                    }
                                }
                            },
                            Err(e) => {
                                return Err("[OPEN ERROR] ".to_string() + &e.to_string())
                            },
                        }
                    }
                }
                Ok(0)                
            }
            else  {
                Err("No device is available.".to_string())
            }
        },
        Err(e) => {
            Err(e.to_string())
        },
    }
}


#[tokio::main]
#[cfg(any(windows, target_os = "macos"))]
async fn main() {
    let window_name_buf : Arc<Vec<u8>> =  Arc::new(Vec::new());
    
    let open = CustomMenuItem::new("open".to_string(), "Open");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");

    let tray_menu = SystemTrayMenu::new()
        .add_item(open)
        .add_item(quit)
        .add_item(hide);

    let system_tray = SystemTray::new().with_menu(tray_menu);
    
    tauri::Builder::default()
        .setup(move |app| {
            let handle = app.app_handle();

            // When current window would be changed.
            let on_window_change = move |window_name: Arc<Vec<u8>>| {
                let modue_name =  unsafe {get_current_module_name()};
                let window_buf_clone_to_send = window_name.clone();

                match modue_name {
                    Ok(module_name)=>{
                        let payload = WindowChangePayload {window_name: window_buf_clone_to_send.to_vec(), module_name};
                        let _ = handle.emit_all::<WindowChangePayload>("WINDOW_CHANGE", payload);
                    }
                    Err(_) => {}
                }
            };

            let window_name_buf_clone = window_name_buf.clone();
            window_listener(window_name_buf_clone, on_window_change);

            let window = app.get_window("main").unwrap();
            set_shadow(&window, true).unwrap();

            
            Ok(())
        }) 
        .invoke_handler(tauri::generate_handler![get_exe_path, get_hid_devices, send_packet_to_hid])
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            tauri::SystemTrayEvent::LeftClick { .. } => {
                open_main_window(&app);
            },
            tauri::SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "open" => {
                        open_main_window(&app);
                    },
                    "quit" => {
                        std::process::exit(0);
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    _ => {}
                }
            },
            _ => {},
        })

        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}
