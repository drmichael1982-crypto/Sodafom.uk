import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { navigate, setGameContext, clearGameContext, ttsSpeak } = vi.hoisted(() => ({
  navigate: vi.fn(),
  setGameContext: vi.fn(),
  clearGameContext: vi.fn(),
  ttsSpeak: vi.fn(),
}));

vi.mock('react-router', () => ({ useNavigate: () => navigate }));
vi.mock('@/contexts/ArchieContext', () => ({
  useArchieContext: () => ({ setGameContext, clearGameContext }),
}));
vi.mock('@/lib/voice-context', () => ({ ttsSpeak }));

import AITeacherPage from './AITeacherPage';

function setSavedSettings(onlineHelp: boolean) {
  localStorage.setItem('sodafom_archie_design_v1', JSON.stringify({
    settings: { year: 4, sound: false, largeText: false, onlineHelp },
    activities: [],
    stickers: [],
  }));
}

function selectChild(id: number, name: string, ageGroup: '5-7' | '8-10' | '11-13') {
  localStorage.setItem('sodafom_active_child', JSON.stringify({ id, name, ageGroup, avatarEmoji: '⭐' }));
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Archie AI Teacher local-first privacy', () => {
  it('keeps exact ages scoped to each child and clears the old learner state on switch', async () => {
    localStorage.setItem('sodafom_ai_teacher_age', '5');
    selectChild(1, 'Mia', '5-7');
    localStorage.setItem('sodafom_learning_age:1', '7');
    localStorage.setItem('sodafom_learning_age:2', '13');

    render(<AITeacherPage />);
    expect(screen.getByLabelText('How old is the learner?')).toHaveValue('7');

    fireEvent.change(screen.getByPlaceholderText('What would you like Archie to teach?'), { target: { value: 'My unfinished question' } });
    fireEvent.change(screen.getByLabelText('How old is the learner?'), { target: { value: '6' } });
    expect(localStorage.getItem('sodafom_learning_age:1')).toBe('6');
    expect(localStorage.getItem('sodafom_ai_teacher_age')).toBe('5');

    selectChild(2, 'Leo', '11-13');
    fireEvent(window, new Event('sodafom:active-child-changed'));

    await waitFor(() => expect(screen.getByLabelText('How old is the learner?')).toHaveValue('13'));
    expect(screen.getByPlaceholderText('What would you like Archie to teach?')).toHaveValue('');
  });

  it('answers built-in maths locally and keeps unmatched questions off the network by default', async () => {
    setSavedSettings(false);
    const fetchMock = vi.mocked(fetch);
    render(<AITeacherPage />);

    const input = screen.getByPlaceholderText('What would you like Archie to teach?');
    fireEvent.change(input, { target: { value: 'What is 8 plus 4?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ask Archie' }));
    await screen.findByText('8 plus 4 is 12.');
    expect(fetchMock).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'Explain the history of the telescope' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ask Archie' }));
    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent('Online learning help is off');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses the selected child age only when a grown-up has enabled online help', async () => {
    setSavedSettings(true);
    selectChild(2, 'Leo', '11-13');
    localStorage.setItem('sodafom_learning_age:2', '13');
    const fetchMock = vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => 'Telescopes help us study distant objects.',
    } as Response);

    render(<AITeacherPage />);
    fireEvent.change(screen.getByPlaceholderText('What would you like Archie to teach?'), { target: { value: 'Explain the history of the telescope' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ask Archie' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe('/api/chat');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      learnerAge: 13,
      messages: [{ role: 'user', content: 'Explain the history of the telescope' }],
    });
    await screen.findByText('Telescopes help us study distant objects.');
  });

  it('does not read or upload a selected book photograph while online help is off', async () => {
    setSavedSettings(false);
    const fetchMock = vi.mocked(fetch);
    render(<AITeacherPage />);
    const file = new File(['page'], 'page.jpg', { type: 'image/jpeg' });

    fireEvent.change(screen.getByLabelText('Choose a book page photograph'), { target: { files: [file] } });

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent('Online page reading is off');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByAltText('Photographed book page')).not.toBeInTheDocument();
  });
});
