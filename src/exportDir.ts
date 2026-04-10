const EXPORT_DIR_KEY = "easytimer.exportDir";

export function getExportDir(): string {
  return localStorage.getItem(EXPORT_DIR_KEY) ?? "";
}

export function setExportDir(path: string): void {
  localStorage.setItem(EXPORT_DIR_KEY, path);
}
