export const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];
export const MAX_FILE_MB = 10;

/** Returns an error message, or null if the file is OK. */
export function validateImageFile(file) {
  if (!file) return "Please choose a file.";
  const name = file.name.toLowerCase();
  const okExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!ALLOWED_TYPES.includes(file.type) || !okExt) {
    return "Only JPEG and PNG images are allowed.";
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `Image is too large. Maximum size is ${MAX_FILE_MB} MB.`;
  }
  return null;
}

/**
 * Reads the image and resizes it (max 1600px) so it fits in browser storage.
 * Resolves to { dataUrl, width, height }.
 */
export function processImageFile(file, maxSize = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("The file is not a valid image."));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff"; // white background for transparent PNGs
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.85), width, height });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
