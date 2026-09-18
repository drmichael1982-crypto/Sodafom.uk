import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const featureRoot = path.dirname(fileURLToPath(import.meta.url));
const forbiddenImportFragments = [
  "797",
  "admin",
  "business",
  "chatbot",
  "codebase",
  "diagnostic",
  "founder",
  "payment",
  "secret",
  "server",
  "stripe",
] as const;

async function runtimeSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return runtimeSourceFiles(fullPath);
      if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) {
        return [];
      }
      return [fullPath];
    }),
  );
  return nested.flat();
}

describe("learning-games trust boundary", () => {
  it("has no imports from Archie, 797, admin, business, diagnostic, payment, secret, or server modules", async () => {
    const files = await runtimeSourceFiles(featureRoot);
    const failures: string[] = [];

    for (const file of files) {
      const source = await readFile(file, "utf8");
      const imports = source.matchAll(
        /(?:from\s+|import\s*\()["']([^"']+)["']/g,
      );
      for (const match of imports) {
        const specifier = match[1].toLowerCase();
        for (const fragment of forbiddenImportFragments) {
          if (specifier.includes(fragment)) {
            failures.push(
              `${path.relative(featureRoot, file)} -> ${specifier}`,
            );
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("does not make direct network calls from child game code", async () => {
    const files = await runtimeSourceFiles(featureRoot);
    const forbiddenNetworkCalls = [
      /\bfetch\s*\(/,
      /\bWebSocket\s*\(/,
      /\bEventSource\s*\(/,
      /\bXMLHttpRequest\b/,
      /navigator\.sendBeacon\s*\(/,
    ];
    const failures: string[] = [];

    for (const file of files) {
      const source = await readFile(file, "utf8");
      for (const pattern of forbiddenNetworkCalls) {
        if (pattern.test(source)) {
          failures.push(
            `${path.relative(featureRoot, file)} matched ${pattern}`,
          );
        }
      }
    }

    expect(failures).toEqual([]);
  });
});
