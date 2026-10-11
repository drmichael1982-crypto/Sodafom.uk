import { afterEach, describe, expect, it } from 'vitest';
import { getAiControlState, updateAiControlState } from './ai-control';

const original = { ...getAiControlState() };

afterEach(() => {
  updateAiControlState({
    masterEnabled: original.masterEnabled,
    localAiEnabled: original.localAiEnabled,
    openAiEnabled: original.openAiEnabled,
    schoolAiEnabled: original.schoolAiEnabled,
    homeAiEnabled: original.homeAiEnabled,
  });
});

describe('AI control state', () => {
  it('can disable all AI with the master switch', () => {
    const state = updateAiControlState({ masterEnabled: false });
    expect(state.masterEnabled).toBe(false);
    expect(getAiControlState().masterEnabled).toBe(false);
  });

  it('keeps school and home controls independent', () => {
    const state = updateAiControlState({ schoolAiEnabled: false, homeAiEnabled: true });
    expect(state.schoolAiEnabled).toBe(false);
    expect(state.homeAiEnabled).toBe(true);
  });

  it('can disable OpenAI without disabling local AI', () => {
    const state = updateAiControlState({ openAiEnabled: false, localAiEnabled: true });
    expect(state.openAiEnabled).toBe(false);
    expect(state.localAiEnabled).toBe(true);
  });
});
