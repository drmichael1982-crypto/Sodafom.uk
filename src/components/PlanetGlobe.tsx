import { useEffect, useRef } from 'react';

let atlas: Promise<ImageData | null> | undefined;
function loadAtlas() {
  return atlas ??= new Promise<ImageData | null>(resolve => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) { resolve(null); return; }
      context.drawImage(image, 0, 0);
      resolve(context.getImageData(0, 0, canvas.width, canvas.height));
    };
    image.onerror = () => resolve(null);
    image.src = '/assets/planets/surface-atlas-v1.webp';
  });
}

/** Project a surface map onto a sphere. Light stays fixed while the surface rotates. */
export default function PlanetGlobe({ index, moving = false }: { index: number; moving?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const angle = useRef(index * .73);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || typeof CanvasRenderingContext2D === 'undefined') return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let disposed = false, frame = 0, last = 0;
    loadAtlas().then(texture => {
      if (!texture || disposed) return;
      const size = canvas.width, radius = size / 2 - 1;
      const pixels = context.createImageData(size, size);
      const cellWidth = texture.width / 2, cellHeight = texture.height / 4;
      const column = index % 2, row = Math.floor(index / 2);
      const surface: { pixel: number; longitude: number; latitude: number; shade: number; alpha: number }[] = [];
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const nx = (x + .5 - size / 2) / radius, ny = (size / 2 - y - .5) / radius;
        const distance = nx * nx + ny * ny;
        if (distance >= 1) continue;
        const nz = Math.sqrt(1 - distance);
        surface.push({ pixel: (y * size + x) * 4, longitude: Math.atan2(nx, nz), latitude: Math.asin(ny), shade: .16 + .84 * Math.max(0, -.48 * nx + .32 * ny + .82 * nz), alpha: Math.min(1, (1 - distance) * radius) * 255 });
      }
      const draw = () => {
        for (const point of surface) {
          const u = ((point.longitude / (Math.PI * 2) + angle.current / (Math.PI * 2) + 1) % 1);
          const v = .5 - point.latitude / Math.PI;
          const tx = Math.floor(column * cellWidth + Math.min(cellWidth - 1, Math.floor(u * cellWidth)));
          const ty = Math.floor(row * cellHeight + Math.min(cellHeight - 1, Math.floor(v * cellHeight)));
          const source = (ty * texture.width + tx) * 4;
          for (let colour = 0; colour < 3; colour++) pixels.data[point.pixel + colour] = texture.data[source + colour] * point.shade;
          pixels.data[point.pixel + 3] = point.alpha;
        }
        context.putImageData(pixels, 0, 0);
      };
      draw();
      const animate = (time: number) => {
        if (disposed) return;
        if (!document.hidden && time - last > 90) {
          angle.current += Math.min(time - (last || time), 150) * .00023 * (index === 1 ? -1 : 1);
          last = time; draw();
        }
        frame = requestAnimationFrame(animate);
      };
      if (moving) frame = requestAnimationFrame(animate);
    });
    return () => { disposed = true; cancelAnimationFrame(frame); };
  }, [index, moving]);
  return <span className={`planet-globe planet-kind-${index}`} aria-hidden="true"><canvas ref={ref} width={80} height={80}/>{index === 5 && <span className="planet-real-rings"/>}</span>;
}
