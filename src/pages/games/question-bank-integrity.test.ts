// @vitest-environment node
import { parse } from '@babel/parser';
import type { Node, ObjectExpression, ObjectProperty } from '@babel/types';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const gamesDirectory = dirname(fileURLToPath(import.meta.url));

function property(object: ObjectExpression, name: string): ObjectProperty | undefined {
  return object.properties.find((entry): entry is ObjectProperty => {
    if (entry.type !== 'ObjectProperty' || entry.computed) return false;
    return (entry.key.type === 'Identifier' && entry.key.name === name)
      || (entry.key.type === 'StringLiteral' && entry.key.value === name);
  });
}

function walk(node: Node, visit: (candidate: Node) => void): void {
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && typeof item.type === 'string') walk(item as Node, visit);
      }
    } else if (value && typeof value === 'object' && typeof (value as Node).type === 'string') {
      walk(value as Node, visit);
    }
  }
}

describe('literal multiple-choice question banks', () => {
  it('show four unique choices with the answer exactly once', () => {
    const errors: string[] = [];
    let checked = 0;

    for (const filename of readdirSync(gamesDirectory).filter(name => name.endsWith('.tsx'))) {
      const source = readFileSync(join(gamesDirectory, filename), 'utf8');
      const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

      walk(ast.program, candidate => {
        if (candidate.type !== 'ObjectExpression') return;
        const questionProperty = property(candidate, 'question');
        const optionsProperty = property(candidate, 'options');
        const answerProperty = property(candidate, 'answer');
        if (!questionProperty || !optionsProperty || !answerProperty) return;
        if (questionProperty.value.type !== 'StringLiteral'
          || optionsProperty.value.type !== 'ArrayExpression'
          || answerProperty.value.type !== 'StringLiteral') return;

        const answer = answerProperty.value.value;
        const options = optionsProperty.value.elements.map(element =>
          element?.type === 'StringLiteral' ? element.value : null,
        );
        if (options.some(option => option === null)) return;
        const strings = options as string[];
        const location = `${basename(filename)}:${questionProperty.loc?.start.line ?? '?'}`;
        checked += 1;

        if (strings.length < 2) errors.push(`${location} has fewer than two choices`);
        if (new Set(strings).size !== strings.length) errors.push(`${location} repeats a choice`);
        const answerCount = strings.filter(option => option === answer).length;
        if (answerCount !== 1) errors.push(`${location} shows its answer ${answerCount} times`);
      });
    }

    expect(checked).toBeGreaterThan(3_000);
    expect(errors).toEqual([]);
  });
});
