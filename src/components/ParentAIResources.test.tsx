import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GrownUpGate from './GrownUpGate';
import ParentAIResources from './ParentAIResources';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('optional parent AI resources', () => {
  it('offers three clearly named official external links with safe new-tab attributes', () => {
    render(<ParentAIResources />);
    expect(screen.getByRole('region', { name: 'Optional AI tools for parents' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ChatGPT Free', level: 3 })).toBeInTheDocument();
    const destinations = [
      ['Open ChatGPT / sign up', 'https://chatgpt.com/'],
      ['Compare plans', 'https://learn.chatgpt.com/docs/pricing'],
      ['How ChatGPT connections work', 'https://learn.chatgpt.com/docs/sign-in-with-chatgpt'],
    ];
    expect(screen.getAllByRole('link')).toHaveLength(destinations.length);
    for (const [name, href] of destinations) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(screen.getByText(/official external websites in a new tab/)).toBeInTheDocument();
  });

  it('separates a free external account from Sodafom access and protects child information', () => {
    render(<ParentAIResources />);
    expect(screen.getByText(/external service with a separate account/)).toHaveTextContent('free plan has usage limits');
    expect(screen.getByText(/Signing up does not connect Sodafom/)).toHaveTextContent('or supply API credits');
    expect(screen.getByText(/Do not include a child’s name/)).toHaveTextContent('school, contact details or private family information');
    expect(screen.getByText(/Check AI answers/)).toBeInTheDocument();
  });

  it('renders without requesting services, changing saved settings or collecting credentials', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const remove = vi.spyOn(Storage.prototype, 'removeItem');
    const clear = vi.spyOn(Storage.prototype, 'clear');
    const { container, unmount } = render(<ParentAIResources />);
    expect(container.querySelector('form, input, textarea, iframe')).toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    unmount();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });

  it('keeps its external links unmounted while the supplied grown-up gate is locked and relocks on remount', async () => {
    const user = userEvent.setup();
    const show = () => render(<GrownUpGate><ParentAIResources /></GrownUpGate>);
    const view = show();
    expect(screen.queryByRole('link', { name: 'Open ChatGPT / sign up' })).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Grown-up answer' }), 'privacy choose{Enter}');
    expect(screen.getByRole('link', { name: 'Open ChatGPT / sign up' })).toBeInTheDocument();
    view.unmount();
    show();
    expect(screen.queryByRole('heading', { name: 'Optional AI tools for parents' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Compare plans' })).not.toBeInTheDocument();
  });
});
