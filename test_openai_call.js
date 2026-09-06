import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import OpenAI from 'openai';

function loadFreshEnv() {
  const cwd = process.cwd();
  const envPaths = [
    resolve(cwd, '.env'),
    resolve(cwd, '../.env'),
    resolve(cwd, '../../.env')
  ];
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, 'utf-8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine.startsWith('#')) continue;
          const eqIdx = trimmedLine.indexOf('=');
          if (eqIdx === -1) continue;
          const key = trimmedLine.slice(0, eqIdx).trim();
          let val = trimmedLine.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          val = val.trim();
          if (key) {
            process.env[key] = val;
          }
        }
      } catch (err) {
        console.error('ENV LOAD ERR:', err);
      }
    }
  }
}

async function test() {
  loadFreshEnv();
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  console.log('KEY EXISTS:', !!apiKey, 'KEY LENGTH:', apiKey?.length);
  const openai = new OpenAI({ apiKey, timeout: 40000, maxRetries: 2 });
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'You are Archie' }, { role: 'user', content: 'Hello' }],
      max_tokens: 500
    });
    console.log('OPENAI SUCCESS! Response text length:', res.choices[0].message.content?.length);
  } catch (err) {
    console.error('OPENAI ERROR:', err.status, err.message);
  }
}

test();
