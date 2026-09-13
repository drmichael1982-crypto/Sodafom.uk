import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const source = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('shared device compatibility contract', () => {
  it('loads the layout-only stylesheet after the global stylesheet', () => {
    const entry = source('src/main.tsx');
    expect(entry.indexOf("import './styles/globals.css';"))
      .toBeLessThan(entry.indexOf("import './styles/device-compatibility.css';"));
  });

  it('keeps the safe-area, dynamic-viewport, wrapping and touch-target rules', () => {
    const css = source('src/styles/device-compatibility.css');
    expect(css).toContain('env(safe-area-inset-top, 0px)');
    expect(css).toContain('max-height: calc(100dvh - 2rem - var(--sodafom-safe-top) - var(--sodafom-safe-bottom));');
    expect(css).toContain('overflow-wrap: anywhere;');
    expect(css).toContain('min-height: 48px;');
    expect(css).toContain('@media (max-width: 1279px), (max-height: 500px)');
    expect(css).not.toMatch(/(?:^|\n)\s*(?:html|body)\s*\{[^}]*overflow\s*:/s);
  });

  it('connects only shared UI hooks and the existing website shell', () => {
    expect(source('src/components/ui/button.tsx')).toContain('sodafom-device-button');
    expect(source('src/components/ui/dialog.tsx')).toContain('sodafom-device-dialog');
    expect(source('src/components/ui/dialog.tsx')).toContain('sodafom-device-close');
    expect(source('src/components/ui/sheet.tsx')).toContain('sodafom-device-sheet');
    expect(source('src/components/ui/tabs.tsx')).toContain('sodafom-device-tabs');
    expect(source('src/components/ui/tabs.tsx')).toContain('sodafom-device-tab');
    expect(source('src/layouts/RootLayout.tsx')).toContain('<Website className="sodafom-device-shell">');
  });
});
