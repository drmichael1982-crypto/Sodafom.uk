import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ frameloop, dpr, shadows }: {
    frameloop?: string;
    dpr?: number | [number, number];
    shadows?: boolean;
  }) => (
    <div
      data-testid="r3f-canvas"
      data-frameloop={frameloop}
      data-dpr={JSON.stringify(dpr)}
      data-shadows={shadows ? 'true' : 'false'}
    />
  ),
}));

vi.mock('@react-three/drei', () => {
  const useGLTF = Object.assign(vi.fn(), {
    preload: vi.fn(),
    clear: vi.fn(),
  });

  return {
    Html: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    Preload: () => null,
    useGLTF,
  };
});

import { Sodafom3DWorld } from './Sodafom3DWorld';
import {
  assertSodafomModelAsset,
  getMovementClipName,
} from './asset-loader';
import {
  getSodafom3DQualitySettings,
  resolveSodafom3DQuality,
} from './quality';
import type { SodafomModelAsset } from './types';

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height,
  });
  fireEvent(window, new Event('resize'));
}

describe('Sodafom3DWorld foundation', () => {
  it('renders the reusable Canvas shell and pauses the render loop', () => {
    render(
      <Sodafom3DWorld
        renderMode="webgl"
        paused
        lowPowerMode
        quality="high"
      />,
    );

    const wrapper = screen.getByLabelText('Sodafom interactive 3D world');
    expect(wrapper).toHaveAttribute('data-sodafom-3d', 'webgl');
    expect(wrapper).toHaveAttribute('data-quality', 'low');
    expect(screen.getByTestId('r3f-canvas')).toHaveAttribute(
      'data-frameloop',
      'demand',
    );
    expect(screen.getByTestId('r3f-canvas')).toHaveAttribute(
      'data-shadows',
      'false',
    );
  });

  it('shows an accessible non-WebGL fallback when requested', () => {
    render(
      <Sodafom3DWorld
        renderMode="fallback"
        accessibilityFallback={<p>Use the 2D learning map.</p>}
      />,
    );

    expect(screen.getByText('Use the 2D learning map.')).toBeInTheDocument();
    expect(screen.queryByTestId('r3f-canvas')).not.toBeInTheDocument();
  });

  it('tracks phone, tablet and desktop orientation changes', () => {
    const { container } = render(<Sodafom3DWorld renderMode="webgl" />);
    const wrapper = container.querySelector('[data-sodafom-3d="webgl"]');

    setViewport(390, 844);
    expect(wrapper).toHaveAttribute('data-orientation', 'portrait');

    setViewport(768, 1024);
    expect(wrapper).toHaveAttribute('data-orientation', 'portrait');

    setViewport(1440, 900);
    expect(wrapper).toHaveAttribute('data-orientation', 'landscape');
  });
});

describe('3D quality policy', () => {
  it('forces low quality for low-power mode', () => {
    expect(resolveSodafom3DQuality('high', true)).toBe('low');
    expect(getSodafom3DQualitySettings('low')).toEqual({
      dpr: 1,
      antialias: false,
      shadows: false,
      powerPreference: 'low-power',
    });
  });
});

describe('glTF asset contract', () => {
  it('accepts glTF assets and reuses the approved movement IDs as clip keys', () => {
    const asset: SodafomModelAsset = {
      id: 'archie',
      url: '/models/archie.glb',
      movementClips: {
        'walk-forward': 'WalkForward',
        talk: 'Talk',
      },
    };

    expect(assertSodafomModelAsset(asset)).toBe(asset);
    expect(getMovementClipName(asset, 'walk-forward')).toBe('WalkForward');
  });

  it('rejects non glTF model URLs', () => {
    expect(() =>
      assertSodafomModelAsset({ id: 'bad-model', url: '/models/bad-model.fbx' }),
    ).toThrow(/\.glb or \.gltf/);
  });
});
