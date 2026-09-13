import type { Request, Response } from 'express';
import { describe, expect, it } from 'vitest';
import subscribe from './subscribe/POST';
import send from './send/POST';

function responseDouble() {
  let statusCode = 200;
  let body: unknown;
  const headers = new Map<string, string>();
  const response = {
    status(code: number) {
      statusCode = code;
      return response;
    },
    json(payload: unknown) {
      body = payload;
      return response;
    },
    setHeader(name: string, value: string) {
      headers.set(name, value);
      return response;
    },
  };

  return {
    response: response as unknown as Response,
    status: () => statusCode,
    body: () => body,
    header: (name: string) => headers.get(name),
  };
}

describe('push delivery rollout guard', () => {
  it.each([
    ['subscription', subscribe],
    ['delivery', send],
  ])('fails closed for %s without reading a request body', async (_name, handler) => {
    const result = responseDouble();

    await handler({} as Request, result.response);

    expect(result.status()).toBe(503);
    expect(result.header('Cache-Control')).toBe('no-store');
    expect(result.body()).toEqual({ error: expect.stringContaining('parent-consented device rollout') });
  });
});
