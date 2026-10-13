// src/utils/gambar.js
// Shrinks a photo in the browser before upload (max 1600 px, JPEG), so
// announcement photos stay light for residents on slow connections.
export async function kompresGambar(file, { maxSisi = 1600, kualitas = 0.82 } = {}) {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  const bitmap = await createImageBitmap(file);
  const skala = Math.min(1, maxSisi / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * skala);
  const h = Math.round(bitmap.height * skala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // JPEG has no transparency
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  if (bitmap.close) bitmap.close();
  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", kualitas));
  if (!blob) throw new Error("Gagal memproses gambar.");
  return blob;
}