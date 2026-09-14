// Run with Node 24+: node --test scripts/test-shop-registry.cjs
// Isolated registry checks only: this does not launch/certify the app or its games.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'src/lib/world/shop-registry.ts');

// Inspect actual route declarations and their imported page files, without
// executing React, making network calls or loading any authentication state.
// This intentionally recognises the current routes.tsx static declaration style;
// a route moved to a different format must update this check instead of passing silently.
const routesPath = path.join(root, 'src/routes.tsx');
const routeSource = fs.readFileSync(routesPath, 'utf8');
const imports = new Map();
for (const match of routeSource.matchAll(/import\s+(\w+)\s+from\s+(['"])([^'"]+)\2/g)) {
  imports.set(match[1], match[3]);
}
for (const match of routeSource.matchAll(/import\s*\{([^}]+)\}\s*from\s*(['"])([^'"]+)\2/g)) {
  for (const binding of match[1].split(',')) {
    const local = binding.trim().split(/\s+as\s+/).at(-1);
    if (local) imports.set(local, match[3]);
  }
}
const routeComponents = new Map();
for (const match of routeSource.matchAll(/path:\s*['"]([^'"]+)['"]\s*,\s*element:\s*<([A-Z]\w*)\s*\/>/g)) {
  routeComponents.set(match[1], match[2]);
}

async function defineTests() {
// Node's native type stripping runs the isolated module; it does not type-check it.
const { SHOPS, WORLD_DESIGN, getShop, isShopId, resolveShopTarget } = await import(pathToFileURL(registryPath).href);

test('registry loads with native Node type stripping and no third-party dependencies', () => {
  assert.ok(Array.isArray(SHOPS));
  assert.equal(typeof resolveShopTarget, 'function');
  assert.doesNotMatch(fs.readFileSync(registryPath, 'utf8'), /^\s*import\s/m);
});

test('all five planned shops have unique stable IDs and the same street design', () => {
  assert.deepEqual(SHOPS.map((shop) => shop.id), [
    'sweet-shop', 'uniform-and-shoes', 'school-supplies', 'cake-and-pie', 'celebration-and-merchandise',
  ]);
  assert.equal(new Set(SHOPS.map((shop) => shop.id)).size, SHOPS.length);
  assert.equal(WORLD_DESIGN.implementation, 'registry-only');
  assert.equal(WORLD_DESIGN.intendedRendering, '3d');
  assert.deepEqual(WORLD_DESIGN.palette, ['deep-red', 'dark-wood', 'gold']);
  for (const shop of SHOPS) {
    assert.equal(shop.streetId, WORLD_DESIGN.id);
    assert.equal(shop.sceneStatus, 'planned');
    assert.equal(getShop(shop.id), shop);
    assert.equal(isShopId(shop.id), true);
  }
  assert.equal(getShop('sweet-shop').frontage, 'double-fronted');
  assert.ok(getShop('sweet-shop').plannedFixtures.includes('clear-glass pick-and-mix jars'));
});

for (const shop of SHOPS) {
  test(`${shop.id}: every activity resolves to a declared route with an existing page`, () => {
    assert.ok(shop.activities.length > 0);
    assert.equal(new Set(shop.activities.map((activity) => activity.id)).size, shop.activities.length);
    for (const activity of shop.activities) {
      assert.equal(activity.subject, 'maths');
      assert.equal(activity.mode, 'practice-only');
      assert.match(activity.route, /^\/games\/[a-z][a-z-]*$/);
      const component = routeComponents.get(activity.route);
      assert.ok(component, `No route component for ${activity.route}`);
      const importPath = imports.get(component);
      assert.ok(importPath?.startsWith('./pages/'), `No local page import for ${component}`);
      assert.ok(fs.existsSync(path.resolve(path.dirname(routesPath), `${importPath}.tsx`)), `Missing page: ${importPath}`);
      assert.deepEqual(resolveShopTarget(shop.id, 'learning', activity.id), { kind: 'learning', route: activity.route });
    }
  });
}

test('unmatched artwork remains pending with no invented or unapproved image links', () => {
  assert.equal(WORLD_DESIGN.preserveApprovedArchieFounderAndDogs, true);
  assert.equal(WORLD_DESIGN.requireMatchingExteriorAndInterior, true);
  for (const shop of SHOPS) {
    assert.equal(shop.artwork.status, 'pending-approved-matching-pair');
    assert.equal(shop.artwork.exterior, null);
    assert.equal(shop.artwork.interior, null);
  }
  assert.doesNotMatch(JSON.stringify(SHOPS), /https?:|\/\/|\/assets\/|\.(png|jpe?g|webp|svg|glb|gltf)/i);
});

test('the registry exposes no real checkout for children or a claimed adult role', () => {
  for (const shop of SHOPS) {
    assert.equal(shop.commerce.status, 'disabled');
    assert.equal(shop.commerce.liveCheckoutEnabled, false);
    assert.equal(shop.commerce.requiresServerVerification, true);
    assert.equal(shop.commerce.permittedAudienceWhenImplemented, 'verified-parent-or-guardian');
    assert.equal(shop.commerce.checkoutRoute, null);
    assert.equal(shop.commerce.externalPurchaseUrl, null);
    for (const action of ['purchase', 'checkout', 'buy', 'parent-purchase', { action: 'purchase', role: 'parent' }, { action: 'purchase', role: 'admin' }]) {
      assert.equal(resolveShopTarget(shop.id, action, shop.activities[0].id), null);
    }
    for (const activity of ['/checkout', '/cart', '/subscribe', '/shop/back-to-school', 'https://example.com/buy']) {
      assert.equal(resolveShopTarget(shop.id, 'learning', activity), null);
    }
  }
});

test('unknown IDs, URL injection and another shop activity fail closed', () => {
  for (const input of [undefined, null, '', 1, {}, [], '__proto__', 'constructor', '../sweet-shop', 'SWEET-SHOP', ' sweet-shop ', '/sweet-shop', 'https://example.com', '//example.com', 'javascript:alert(1)']) {
    assert.equal(getShop(input), undefined);
    assert.equal(isShopId(input), false);
    assert.equal(resolveShopTarget(input, 'learning', 'count-coins'), null);
  }
  for (const input of [undefined, null, '', 1, {}, [], '__proto__', '../count-coins', '/games/coin-counter', 'javascript:alert(1)']) {
    assert.equal(resolveShopTarget('sweet-shop', 'learning', input), null);
  }
  assert.equal(resolveShopTarget('sweet-shop', 'learning', 'recipe-ratios'), null);
});

test('exported definitions and returned targets cannot be mutated into purchase links', () => {
  const sweetShop = getShop('sweet-shop');
  const target = resolveShopTarget('sweet-shop', 'learning', 'count-coins');
  assert.throws(() => { SHOPS.push(sweetShop); }, TypeError);
  assert.throws(() => { WORLD_DESIGN.palette[0] = 'different-artwork'; }, TypeError);
  assert.throws(() => { sweetShop.commerce.liveCheckoutEnabled = true; }, TypeError);
  assert.throws(() => { sweetShop.artwork.exterior = 'https://example.com/new.png'; }, TypeError);
  assert.throws(() => { sweetShop.activities[0].route = '/checkout'; }, TypeError);
  assert.throws(() => { target.route = '/checkout'; }, TypeError);
  assert.equal(resolveShopTarget('sweet-shop', 'learning', 'count-coins').route, '/games/coin-counter');
});
}

defineTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
