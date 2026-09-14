export type AiJobKind =
  | "routine"
  | "coding"
  | "complex-coding"
  | "architecture"
  | "security-review"
  | "final-review";

export type AiRisk = "low" | "medium" | "high";

export interface AiJob {
  kind: AiJobKind;
  risk?: AiRisk;
  failedAttempts?: number;
  forceModel?: string;
}

export interface ModelRoute {
  model: string;
  reasoning: "none" | "low" | "medium" | "high" | "xhigh" | "max";
  reason: string;
}

/**
 * Central cost-aware model policy for Sodafom development/agent jobs.
 * Keep model choice server-side so API keys and privileged policy never ship
 * to the browser or mobile client.
 */
export function routeAiJob(job: AiJob): ModelRoute {
  if (job.forceModel) {
    return { model: job.forceModel, reasoning: "medium", reason: "Explicit server-side override" };
  }

  const attempts = job.failedAttempts ?? 0;
  const risk = job.risk ?? "low";

  // Escalate repeated failures or high-risk work to the strongest reviewer.
  if (attempts >= 2 || risk === "high" || job.kind === "architecture" || job.kind === "security-review") {
    return { model: "gpt-6-astra", reasoning: "high", reason: "High-risk, architectural, security, or repeated-failure work" };
  }

  if (job.kind === "complex-coding" || job.kind === "final-review") {
    return { model: "gpt-5.6-sol", reasoning: "high", reason: "Complex implementation or final integration review" };
  }

  if (job.kind === "coding" || risk === "medium") {
    return { model: "gpt-5.6-terra", reasoning: "medium", reason: "Balanced coding quality and cost" };
  }

  return { model: "gpt-5.6-luna", reasoning: "low", reason: "Routine, low-risk, high-volume work" };
}

export function nextEscalation(currentModel: string): string | null {
  switch (currentModel) {
    case "gpt-5.6-luna": return "gpt-5.6-terra";
    case "gpt-5.6-terra": return "gpt-5.6-sol";
    case "gpt-5.6-sol": return "gpt-6-astra";
    default: return null;
  }
}
