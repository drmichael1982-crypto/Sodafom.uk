import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_ENCODED_PHOTO_LENGTH, MAX_PHOTO_BYTES, prepareLearningPhoto } from '../learning-photo';

describe('learning photo preparation', () => {
  let canvas: { width: number; height: number; getContext: ReturnType<typeof vi.fn>; toDataURL: ReturnType<typeof vi.fn> };
  let read: ReturnType<typeof vi.fn<() => void>>;
  beforeEach(() => {
    read = vi.fn();
    vi.stubGlobal('FileReader', class {
      result = 'data:image/jpeg;base64,original-metadata';
      onload?: () => void;
      readAsDataURL() { read(); queueMicrotask(() => this.onload?.()); }
    });
    vi.stubGlobal('Image', class {
      naturalWidth = 2000;
      naturalHeight = 1500;
      onload?: () => void;
      set src(_value: string) { queueMicrotask(() => this.onload?.()); }
    });
    canvas = { width: 0, height: 0, getContext: vi.fn(() => ({ fillRect: vi.fn(), drawImage: vi.fn() })), toDataURL: vi.fn(() => 'data:image/jpeg;base64,redrawn') };
    const create = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((name, options) => name === 'canvas' ? canvas as unknown as HTMLCanvasElement : create(name, options));
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
  const photo = () => new File(['x'], 'page.jpg', { type: 'image/jpeg' });

  it('rejects oversized input before attempting to read it', async () => {
    const file = photo();
    Object.defineProperty(file, 'size', { value: MAX_PHOTO_BYTES + 1 });
    await expect(prepareLearningPhoto(file)).rejects.toThrow('smaller than 6 MB');
    expect(read).not.toHaveBeenCalled();
  });
  it('rejects unsupported input types before reading them', async () => {
    await expect(prepareLearningPhoto(new File(['x'], 'page.svg', { type: 'image/svg+xml' }))).rejects.toThrow('JPEG');
    expect(read).not.toHaveBeenCalled();
  });
  it('sends a redrawn image rather than the original file metadata and releases canvas memory', async () => {
    expect(await prepareLearningPhoto(photo())).toBe('data:image/jpeg;base64,redrawn');
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    expect(canvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.85);
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
  });
  it('reduces the encoded image enough for the existing bounded JSON parser', async () => {
    canvas.toDataURL.mockReturnValueOnce('data:image/jpeg;base64,' + 'a'.repeat(MAX_ENCODED_PHOTO_LENGTH));
    const encoded = await prepareLearningPhoto(photo());
    expect(encoded.length).toBeLessThanOrEqual(MAX_ENCODED_PHOTO_LENGTH);
    expect(canvas.toDataURL).toHaveBeenCalledTimes(2);
  });
  it('asks for a crop instead of reducing detailed text indefinitely', async () => {
    canvas.toDataURL.mockReturnValue('data:image/jpeg;base64,' + 'a'.repeat(MAX_ENCODED_PHOTO_LENGTH));
    await expect(prepareLearningPhoto(photo())).rejects.toThrow('Crop');
    expect(canvas.toDataURL).toHaveBeenCalledTimes(9);
    expect(canvas.width).toBe(0);
  });
  it('reports a failed image decode without trying to draw it', async () => {
    vi.stubGlobal('Image', class {
      onerror?: () => void;
      set src(_value: string) { queueMicrotask(() => this.onerror?.()); }
    });
    await expect(prepareLearningPhoto(photo())).rejects.toThrow('could not be opened');
    expect(canvas.toDataURL).not.toHaveBeenCalled();
  });
});
