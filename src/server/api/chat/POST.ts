import type { Request, Response } from "express";
import { answerWithArchie, validateMessages } from "../../lib/archie-brain";
import { requirePreviewParentSession } from "../../lib/archie-parent-auth";
import { getParentAIEnv } from "../../lib/archie-parent-ai";

const requests = new Map<string, { count: number; reset: number }>();
export default async function handler(req: Request, res: Response) {
  res.setHeader("Cache-Control", "no-store");
  const messages = validateMessages(req.body?.messages);
  if (!messages)
    return res.status(400).send("Please send a short learning question.");
  const session = await requirePreviewParentSession(req, res);
  if (!session) return;
  const now = Date.now();
  for (const [key, value] of requests)
    if (value.reset < now) requests.delete(key);
  const id = req.ip || "local";
  const window = requests.get(id) || { count: 0, reset: now + 60000 };
  if (window.count >= 20)
    return res.status(429).send("Please wait a moment before asking again.");
  window.count++;
  requests.set(id, window);
  try {
    const text = await answerWithArchie(
      messages,
      typeof req.body?.systemExtra === "string" ? req.body.systemExtra : "",
      await getParentAIEnv(req, session.user.id),
      req.body?.learnerAge,
    );
    return res.type("text/plain").send(text);
  } catch {
    // Provider error text may contain submitted data or credentials. Never log it.
    console.warn("Archie provider request failed");
    return res
      .status(503)
      .type("text/plain")
      .send(
        "Archie’s online learning service is unavailable. Built-in help still works.",
      );
  }
}
