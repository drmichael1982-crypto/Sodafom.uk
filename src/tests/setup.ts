import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// Vitest does not automatically unmount React Testing Library trees. Without
// this, a full-suite run leaks banners, buttons and listeners into later tests.
afterEach(() => cleanup());
