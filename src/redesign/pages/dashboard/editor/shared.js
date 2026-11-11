import { fileToDataUrl } from "../../../lib/store";

export async function readFontDataUrl(file) {
  if (!file) throw new Error("Choose a font file first.");
  if (file.size > 250 * 1024) {
    throw new Error("Font file must be under 250KB.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read font file."));
    reader.readAsDataURL(file);
  });
}

export async function uploadAssetFile(file, slot = "avatar") {
  const maxDim = slot === "background" ? 1600 : slot === "banner" ? 1200 : 512;
  const url = await fileToDataUrl(file, maxDim, slot);
  const type = file.type?.startsWith("video/") ? "video" : "image";
  return { url, type };
}
