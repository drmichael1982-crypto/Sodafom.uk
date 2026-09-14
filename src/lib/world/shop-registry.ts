/**
 * Data foundation for the planned Victorian learning street, not a rendered 3D world.
 * Existing pages, artwork and game behaviour are deliberately unchanged.
 */
export const WORLD_DESIGN = Object.freeze({
  id: 'victorian-learning-street',
  intendedRendering: '3d',
  implementation: 'registry-only',
  era: 'Victorian',
  palette: Object.freeze(['deep-red', 'dark-wood', 'gold'] as const),
  preserveApprovedArchieFounderAndDogs: true,
  requireMatchingExteriorAndInterior: true,
} as const);

export type ShopId =
  | 'sweet-shop'
  | 'uniform-and-shoes'
  | 'school-supplies'
  | 'cake-and-pie'
  | 'celebration-and-merchandise';

/** Explicit local allowlist: no arbitrary URL, affiliate shop or checkout target. */
export type ShopActivityRoute =
  | '/games/coin-counter'
  | '/games/shopkeeper-change'
  | '/games/pattern-maker'
  | '/games/money-maths'
  | '/games/number-bonds'
  | '/games/shape-sorter'
  | '/games/fraction-pizza'
  | '/games/ratio-recipe';

export interface ShopActivity {
  readonly id: string;
  readonly title: string;
  readonly route: ShopActivityRoute;
  readonly subject: 'maths';
  readonly mode: 'practice-only';
}

/** No matching Victorian exterior/interior pair has been approved in this source. */
const PENDING_ARTWORK = Object.freeze({
  status: 'pending-approved-matching-pair',
  exterior: null,
  interior: null,
} as const);

/**
 * These are requirements, not authentication. Real purchasing stays unavailable
 * for everyone in this foundation; a future server must verify a parent/guardian.
 */
const DISABLED_COMMERCE = Object.freeze({
  status: 'disabled',
  liveCheckoutEnabled: false,
  permittedAudienceWhenImplemented: 'verified-parent-or-guardian',
  requiresServerVerification: true,
  checkoutRoute: null,
  externalPurchaseUrl: null,
} as const);

export interface ShopDefinition {
  readonly id: ShopId;
  readonly title: string;
  readonly streetId: typeof WORLD_DESIGN.id;
  readonly sceneStatus: 'planned';
  readonly frontage: 'double-fronted' | 'pending-design';
  readonly plannedFixtures: readonly string[];
  readonly artwork: typeof PENDING_ARTWORK;
  readonly commerce: typeof DISABLED_COMMERCE;
  readonly activities: readonly ShopActivity[];
}

function defineShop(
  input: Pick<ShopDefinition, 'id' | 'title' | 'frontage' | 'plannedFixtures'>,
  activities: readonly Pick<ShopActivity, 'id' | 'title' | 'route'>[],
): ShopDefinition {
  return Object.freeze({
    ...input,
    streetId: WORLD_DESIGN.id,
    sceneStatus: 'planned',
    plannedFixtures: Object.freeze([...input.plannedFixtures]),
    artwork: PENDING_ARTWORK,
    commerce: DISABLED_COMMERCE,
    activities: Object.freeze(activities.map((activity) => Object.freeze({
      ...activity,
      subject: 'maths' as const,
      mode: 'practice-only' as const,
    }))),
  });
}

/** Titles below retain the existing games' names; shop-themed gameplay is future work. */
export const SHOPS: readonly ShopDefinition[] = Object.freeze([
  defineShop({
    id: 'sweet-shop',
    title: 'Sweet Shop',
    frontage: 'double-fronted',
    plannedFixtures: ['clear-glass pick-and-mix jars', 'central jar display', 'dark-wood counter'],
  }, [
    { id: 'count-coins', title: 'Coin Counter', route: '/games/coin-counter' },
    { id: 'give-change', title: 'Shopkeeper Change', route: '/games/shopkeeper-change' },
  ]),
  defineShop({
    id: 'uniform-and-shoes',
    title: 'Uniform and Shoe Shop',
    frontage: 'pending-design',
    plannedFixtures: ['uniform display', 'shoe shelves'],
  }, [
    { id: 'spot-patterns', title: 'Pattern Maker', route: '/games/pattern-maker' },
    { id: 'practise-money', title: 'Money Maths', route: '/games/money-maths' },
  ]),
  defineShop({
    id: 'school-supplies',
    title: 'School Supplies Shop',
    frontage: 'pending-design',
    plannedFixtures: ['stationery shelves', 'school book display'],
  }, [
    { id: 'make-number-bonds', title: 'Number Bonds', route: '/games/number-bonds' },
    { id: 'sort-shapes', title: 'Shape Sorter', route: '/games/shape-sorter' },
  ]),
  defineShop({
    id: 'cake-and-pie',
    title: 'Cake and Pie Shop',
    frontage: 'pending-design',
    plannedFixtures: ['cake and pie display', 'recipe counter'],
  }, [
    { id: 'share-fractions', title: 'Fraction Pizza', route: '/games/fraction-pizza' },
    { id: 'recipe-ratios', title: 'Ratio Recipe', route: '/games/ratio-recipe' },
  ]),
  defineShop({
    id: 'celebration-and-merchandise',
    title: 'Celebration and Merchandise Shop',
    frontage: 'pending-design',
    plannedFixtures: ['celebration display', 'approved character merchandise display'],
  }, [
    { id: 'practise-change', title: 'Shopkeeper Change', route: '/games/shopkeeper-change' },
    { id: 'practise-money', title: 'Money Maths', route: '/games/money-maths' },
  ]),
]);

/** Reject unknown values exactly; never turn URL/query input into a navigation path. */
export function getShop(value: unknown): ShopDefinition | undefined {
  return typeof value === 'string' ? SHOPS.find((shop) => shop.id === value) : undefined;
}

export function isShopId(value: unknown): value is ShopId {
  return getShop(value) !== undefined;
}

export interface ShopLearningTarget {
  readonly kind: 'learning';
  readonly route: ShopActivityRoute;
}

/**
 * Only registered practice activities resolve. Purchase/checkout requests return
 * null, including requests with a client-supplied parent/admin role. This helper
 * does not authenticate anyone or replace server-side access controls.
 */
export function resolveShopTarget(
  shopId: unknown,
  action: unknown,
  activityId?: unknown,
): ShopLearningTarget | null {
  if (action !== 'learning' || typeof activityId !== 'string') return null;
  const activity = getShop(shopId)?.activities.find((item) => item.id === activityId);
  return activity ? Object.freeze({ kind: 'learning', route: activity.route }) : null;
}
