/**
 * Helper utility to prepare school logos into high-resolution PNG Data URLs
 * for jsPDF document rendering (handling SVG, local paths, and remote URLs).
 */

let cachedLogoUrl: string | null = null;
let cachedDataUrl: string | null = null;

export const getLogoDataUrlForPdf = async (logoUrl?: string): Promise<string | null> => {
  if (!logoUrl) return null;

  // Return cached result if same URL
  if (cachedLogoUrl === logoUrl && cachedDataUrl) {
    return cachedDataUrl;
  }

  // If already a base64 PNG or JPEG data URL, return directly
  if (logoUrl.startsWith('data:image/png;base64,') || logoUrl.startsWith('data:image/jpeg;base64,')) {
    cachedLogoUrl = logoUrl;
    cachedDataUrl = logoUrl;
    return logoUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          // High resolution for crisp PDF printing: 300x300 canvas
          const width = img.naturalWidth || 300;
          const height = img.naturalHeight || 300;
          const targetSize = Math.max(width, height, 300);

          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.clearRect(0, 0, targetSize, targetSize);
          // Center the image in the canvas preserving aspect ratio
          const scale = Math.min(targetSize / width, targetSize / height);
          const drawW = width * scale;
          const drawH = height * scale;
          const drawX = (targetSize - drawW) / 2;
          const drawY = (targetSize - drawH) / 2;

          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          const dataUrl = canvas.toDataURL('image/png');

          cachedLogoUrl = logoUrl;
          cachedDataUrl = dataUrl;
          resolve(dataUrl);
        } catch (err) {
          console.warn('[PDF Logo] Canvas conversion error:', err);
          resolve(null);
        }
      };

      img.onerror = (err) => {
        console.warn('[PDF Logo] Failed loading logo image:', err);
        resolve(null);
      };

      img.src = logoUrl;
    } catch (err) {
      console.warn('[PDF Logo] Unexpected error loading logo:', err);
      resolve(null);
    }
  });
};
