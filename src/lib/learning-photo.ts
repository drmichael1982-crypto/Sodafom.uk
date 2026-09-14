/** Browser-only photo preparation; redraw strips original metadata before upload. */
export const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
export const MAX_ENCODED_PHOTO_LENGTH = 85_000;

export async function prepareLearningPhoto(file: File): Promise<string> {
  if (file.size > MAX_PHOTO_BYTES) throw new Error('Please choose a clear photograph smaller than 6 MB.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Please choose a JPEG, PNG or WebP photograph.');
  }
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result) : reject(new Error('That photograph could not be opened. Please try again.'));
    reader.onerror = () => reject(new Error('That photograph could not be opened. Please try again.'));
    reader.onabort = () => reject(new Error('The photograph was cancelled. Please choose it again.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const loaded = new Image();
    loaded.onload = () => resolve(loaded);
    loaded.onerror = () => reject(new Error('That photograph could not be opened. Please try again.'));
    loaded.src = source;
  });
  if (image.naturalWidth < 100 || image.naturalHeight < 100 || image.naturalWidth * image.naturalHeight > 40_000_000) {
    throw new Error('Please crop one clear question or page and choose that photograph.');
  }
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This device could not prepare the photograph. Please try another browser.');
  try {
    for (const edge of [1600, 1280, 1024]) {
      const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.85, 0.7, 0.55]) {
        const prepared = canvas.toDataURL('image/jpeg', quality);
        if (prepared.startsWith('data:image/jpeg;base64,') && prepared.length <= MAX_ENCODED_PHOTO_LENGTH) return prepared;
      }
    }
    throw new Error('This photo is too detailed to send clearly. Crop it to one question and try again.');
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
