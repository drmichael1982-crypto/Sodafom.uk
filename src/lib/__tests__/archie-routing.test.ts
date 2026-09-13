import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ArchieRoutingError,
  routeLocalArchieQuestion,
} from '../archie-routing';

describe('local-only Archie routing', () => {
  it('returns a local answer without an online fallback', async () => {
    const reply = await routeLocalArchieQuestion(
      { messages: [{ role: 'user', content: 'What is 2 + 2?' }] },
      () => ({ text: '2 + 2 is 4.' }),
    );

    expect(reply).toEqual({ text: '2 + 2 is 4.', source: 'local', modelUsed: 'Local Archie', cost: 0 });
  });

  it('keeps contextual hints in the browser and skips lookup', async () => {
    let lookupCalled = false;
    const reply = await routeLocalArchieQuestion(
      {
        messages: [{ role: 'user', content: 'Can I have a hint?' }],
        localHint: 'Read each choice and rule out the ones that cannot be right.',
      },
      () => {
        lookupCalled = true;
        return null;
      },
    );

    expect(reply.text).toContain('Read each choice');
    expect(lookupCalled).toBe(false);
  });

  it('fails closed instead of requesting a cloud answer', async () => {
    await expect(routeLocalArchieQuestion(
      { messages: [{ role: 'user', content: 'Tell me an unknown fact.' }] },
      () => null,
    )).rejects.toMatchObject({ code: 'LOCAL_ONLY_NO_ANSWER' } satisfies Partial<ArchieRoutingError>);
  });

  it('rejects missing, aborted, and failed local requests safely', async () => {
    await expect(routeLocalArchieQuestion({ messages: [] }, () => null))
      .rejects.toMatchObject({ code: 'INVALID_REQUEST' } satisfies Partial<ArchieRoutingError>);

    const controller = new AbortController();
    controller.abort();
    await expect(routeLocalArchieQuestion(
      { messages: [{ role: 'user', content: 'Hello Archie' }], signal: controller.signal },
      () => ({ text: 'Hello!' }),
    )).rejects.toMatchObject({ code: 'CANCELLED' } satisfies Partial<ArchieRoutingError>);

    await expect(routeLocalArchieQuestion(
      { messages: [{ role: 'user', content: 'Hello Archie' }] },
      () => { throw new Error('storage unavailable'); },
    )).rejects.toMatchObject({ code: 'LOCAL_UNAVAILABLE' } satisfies Partial<ArchieRoutingError>);
  });
});

describe('local-first source boundaries', () => {
  it('keeps the recovered browser entry points away from the chat endpoint', () => {
    const root = process.cwd();
    const routing = readFileSync(resolve(root, 'src/lib/archie-routing.ts'), 'utf8');
    const helper = readFileSync(resolve(root, 'src/components/ArchieHelper.tsx'), 'utf8');
    const hint = readFileSync(resolve(root, 'src/components/ArchieHintButton.tsx'), 'utf8');
    const teacher = readFileSync(resolve(root, 'src/pages/AITeacherPage.tsx'), 'utf8');

    expect(routing).not.toMatch(/\bfetch\b/);
    expect(routing).not.toMatch(/\blocalStorage\b/);
    expect(helper).not.toMatch(/fetch\s*\(/);
    expect(hint).not.toMatch(/fetch\s*\(/);
    expect(teacher).not.toContain('${API_PREFIX}/chat');
    // Photo reading is a separate scanner workstream and deliberately remains untouched.
    expect(teacher).toContain('${API_PREFIX}/ai-teacher/read-page');
  });
});
