import { act, cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it } from 'vitest';
import SpellingInputPolicy from './SpellingInputPolicy';
afterEach(()=>{cleanup();document.getElementById('app')?.remove();});
it('disables spelling assistance on delayed spelling fields while leaving Archie chat and passwords alone',async()=>{
  const root=document.createElement('div');root.id='app';document.body.append(root);
  render(<MemoryRouter initialEntries={['/games/crossword']}><SpellingInputPolicy/></MemoryRouter>,{container:root});
  await act(async()=>{root.insertAdjacentHTML('beforeend','<input id="spelling" spellcheck="true" autocorrect="on"><textarea id="written"></textarea><input type="password" id="password"><dialog class="archie-dialog"><input id="chat" autocorrect="on"></dialog>');await Promise.resolve();});
  for (const id of ['spelling','written']) {
    const input=document.getElementById(id)!;expect(input).toHaveAttribute('autocomplete','off');expect(input).toHaveAttribute('autocorrect','off');expect(input).toHaveAttribute('autocapitalize','off');expect((input as HTMLInputElement).spellcheck).toBe(false);
  }
  expect(document.getElementById('chat')).toHaveAttribute('autocorrect','on');expect(document.getElementById('password')).not.toHaveAttribute('autocomplete');
});
it('leaves ordinary learning text fields unchanged outside spelling activities',()=>{
  const root=document.createElement('div');root.id='app';document.body.append(root);
  render(<MemoryRouter initialEntries={['/homework']}><input autoComplete="on"/><SpellingInputPolicy/></MemoryRouter>,{container:root});
  expect(root.querySelector('input')).toHaveAttribute('autocomplete','on');
});
