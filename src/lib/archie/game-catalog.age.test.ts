import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from '@babel/parser';
import { describe, expect, it } from 'vitest';
import catalog from './game-catalog.json';
import { isGameForYear } from './game-age';

// Check the separately declared runtime restriction, not a copy of the menu filter.
// Browser checks additionally prove every listed route really mounts its game.
function declaredGameRanges(slug: string): string[] | undefined {
  const file = resolve('src/pages/games', `${slug}.tsx`);
  if (!existsSync(file)) return undefined;
  const ast = parse(readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  let ranges: string[] | undefined;
  function visit(value: any) {
    if (!value || typeof value !== 'object') return;
    if (value.type === 'ObjectProperty' && value.key?.name === 'ageGroups' && value.value?.type === 'ArrayExpression') {
      ranges = value.value.elements.map((element: any) => element.value);
    }
    if (value.type === 'JSXOpeningElement' && value.name?.name === 'GameShell') {
      const attribute = value.attributes.find((item: any) => item.name?.name === 'ageGroups');
      if (attribute?.value?.expression?.type === 'ArrayExpression') ranges = attribute.value.expression.elements.map((element: any) => element.value);
    }
    for (const child of Object.values(value)) {
      if (Array.isArray(child)) child.forEach(visit); else if (child && typeof child === 'object') visit(child);
    }
  }
  visit(ast); return ranges;
}

describe('catalogue routes respect each game entry restriction', () => {
  it.each(catalog)('$title never advertises a school year its game rejects', game => {
    const ranges = declaredGameRanges(game.slug);
    expect(ranges, `Inspect the actual entry policy for ${game.route}`).toBeDefined();
    for (let year = 1; year <= 9; year++) {
      if (isGameForYear(year, game.ageGroups)) expect(isGameForYear(year, ranges!), `${game.route} Year ${year}`).toBe(true);
    }
    expect(Array.from({ length: 9 }, (_, index) => index + 1).some(year => isGameForYear(year, game.ageGroups))).toBe(true);
  });
});
