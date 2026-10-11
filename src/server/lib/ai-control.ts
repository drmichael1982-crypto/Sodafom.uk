export interface AiControlState {
  masterEnabled: boolean;
  localAiEnabled: boolean;
  openAiEnabled: boolean;
  schoolAiEnabled: boolean;
  homeAiEnabled: boolean;
  updatedAt: string;
}

const initialState: AiControlState = {
  masterEnabled: process.env.AI_MASTER_ENABLED !== 'false',
  localAiEnabled: process.env.LOCAL_AI_ENABLED !== 'false',
  openAiEnabled: process.env.OPENAI_ENABLED !== 'false',
  schoolAiEnabled: process.env.SCHOOL_AI_ENABLED !== 'false',
  homeAiEnabled: process.env.HOME_AI_ENABLED !== 'false',
  updatedAt: new Date().toISOString(),
};

const runtime = globalThis as typeof globalThis & { __sodafomAiControl?: AiControlState };
if (!runtime.__sodafomAiControl) runtime.__sodafomAiControl = initialState;

export function getAiControlState(): AiControlState {
  return runtime.__sodafomAiControl!;
}

export function updateAiControlState(patch: Partial<Omit<AiControlState, 'updatedAt'>>): AiControlState {
  runtime.__sodafomAiControl = {
    ...getAiControlState(),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return runtime.__sodafomAiControl;
}
