import { open } from "@tauri-apps/plugin-dialog";
import { setExportDir } from "./exportDir";
import { t } from "./i18n";
import { setExportPathText, setStatus } from "./status";

export async function pickExportDir(): Promise<string> {
  try {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === "string" && selected.trim().length > 0) {
      setExportDir(selected);
      setExportPathText(selected);
      setStatus(t("status.folderUpdated"));
      return selected;
    }
    setStatus(t("status.folderCancelled"));
    return "";
  } catch (e) {
    setStatus(t("status.folderFailed", { error: String(e) }), "error");
    return "";
  }
}
