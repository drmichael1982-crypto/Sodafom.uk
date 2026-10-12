/**
 * Auto-synced registry of publicly-crawlable routes. Consumed by the
 * /sitemap.xml handler in src/server/entry.ts.
 *
 * DO NOT add or remove paths by hand. Static paths are mirrored here from
 * src/routes.tsx automatically whenever that file is edited (any manual
 * path edit would be overwritten on the next routes.tsx change). For sync
 * to pick up a route, its `path` must be a literal string starting with "/";
 * template literals and identifier refs are skipped, and dynamic-param routes
 * like "/products/:id" are excluded.
 *
 * The only fields safe to hand-edit are the per-entry metadata below, after a
 * sync:
 * - `priority` (0.0–1.0): Home = 1.0, main sections = 0.8, deep pages = 0.5.
 * - `changefreq` and `lastmod`.
 */

export interface SeoRoute {
  path: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  lastmod?: string;
}

export const seoRoutes: SeoRoute[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.8 },
  { path: "/battle", changefreq: "monthly", priority: 0.6 },
  { path: "/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/admin-panel", changefreq: "monthly", priority: 0.8 },
  { path: "/subjects", changefreq: "monthly", priority: 0.8 },
  { path: "/subjects/maths", changefreq: "monthly", priority: 0.5 },
  { path: "/subjects/spelling", changefreq: "monthly", priority: 0.5 },
  { path: "/subjects/reading", changefreq: "monthly", priority: 0.5 },
  { path: "/subjects/science", changefreq: "monthly", priority: 0.5 },
  { path: "/games", changefreq: "weekly", priority: 0.9 },
  { path: "/demo", changefreq: "monthly", priority: 0.8 },
  { path: "/subscribe", changefreq: "monthly", priority: 0.9 },
  { path: "/games/number-pop", changefreq: "monthly", priority: 0.6 },
  { path: "/games/times-table-race", changefreq: "monthly", priority: 0.6 },
  { path: "/games/fraction-pizza", changefreq: "monthly", priority: 0.6 },
  { path: "/games/word-scramble", changefreq: "monthly", priority: 0.5 },
  { path: "/games/times-tables-challenge", changefreq: "monthly", priority: 0.5 },
  { path: "/games/sentence-scramble", changefreq: "monthly", priority: 0.5 },
  { path: "/games/science-lab", changefreq: "monthly", priority: 0.5 },
  { path: "/games/shape-sorter", changefreq: "monthly", priority: 0.6 },
  { path: "/games/word-wizard", changefreq: "monthly", priority: 0.6 },
  { path: "/games/spelling-bee", changefreq: "monthly", priority: 0.6 },
  { path: "/games/tricky-word-hunt", changefreq: "monthly", priority: 0.6 },
  { path: "/games/story-builder", changefreq: "monthly", priority: 0.6 },
  { path: "/games/phonics-parrot", changefreq: "monthly", priority: 0.6 },
  { path: "/games/reading-quest", changefreq: "monthly", priority: 0.6 },
  { path: "/games/word-search", changefreq: "monthly", priority: 0.5 },
  { path: "/games/crossword", changefreq: "monthly", priority: 0.5 },
  { path: "/games/sudoku", changefreq: "monthly", priority: 0.5 },
  { path: "/games/number-puzzle", changefreq: "monthly", priority: 0.5 },
  { path: "/games/colour-book", changefreq: "monthly", priority: 0.5 },
  { path: "/games/alphabet-explorer", changefreq: "monthly", priority: 0.5 },
  { path: "/games/times-tables-reader", changefreq: "monthly", priority: 0.5 },
  { path: "/games/reading", changefreq: "monthly", priority: 0.7 },
  { path: "/games/maths", changefreq: "monthly", priority: 0.7 },
  { path: "/games/spelling", changefreq: "monthly", priority: 0.7 },
  { path: "/games/animal-kingdom", changefreq: "monthly", priority: 0.5 },
  { path: "/games/nature-explorer", changefreq: "monthly", priority: 0.5 },
  { path: "/games/geography-quiz", changefreq: "monthly", priority: 0.5 },
  { path: "/games/mental-maths-sprint", changefreq: "monthly", priority: 0.5 },
  { path: "/games/colour-learn", changefreq: "monthly", priority: 0.5 },
  { path: "/games/odd-even", changefreq: "monthly", priority: 0.5 },
  { path: "/games/place-value", changefreq: "monthly", priority: 0.5 },
  { path: "/games/geography-uk", changefreq: "monthly", priority: 0.5 },
  { path: "/games/synonyms-antonyms", changefreq: "monthly", priority: 0.5 },
  { path: "/games/multiplication-grid", changefreq: "monthly", priority: 0.5 },
  { path: "/games/division-dash", changefreq: "monthly", priority: 0.5 },
  { path: "/games/number-line", changefreq: "monthly", priority: 0.5 },
  { path: "/games/maths-mystery", changefreq: "monthly", priority: 0.5 },
  { path: "/games/game-pattern-maker", changefreq: "monthly", priority: 0.5 },
  { path: "/games/pattern-maker", changefreq: "monthly", priority: 0.5 },
  { path: "/games/angle-explorer", changefreq: "monthly", priority: 0.5 },
  { path: "/games/perimeter-quest", changefreq: "monthly", priority: 0.5 },
  { path: "/games/area-adventure", changefreq: "monthly", priority: 0.5 },
  { path: "/games/data-detective", changefreq: "monthly", priority: 0.5 },
  { path: "/games/fraction-match", changefreq: "monthly", priority: 0.5 },
  { path: "/games/speed-tables", changefreq: "monthly", priority: 0.5 },
  { path: "/games/rounding-rocket", changefreq: "monthly", priority: 0.5 },
  { path: "/games/negative-numbers", changefreq: "monthly", priority: 0.5 },
  { path: "/games/coordinates-grid", changefreq: "monthly", priority: 0.5 },
  
  { path: "/games/time-teller", changefreq: "monthly", priority: 0.5 },
  { path: "/games/maths-word-problems", changefreq: "monthly", priority: 0.5 },
  
  { path: "/games/missing-numbers", changefreq: "monthly", priority: 0.5 },
  { path: "/games/maths-snap", changefreq: "monthly", priority: 0.5 },
  { path: "/games/ratio-recipe", changefreq: "monthly", priority: 0.5 },
  { path: "/games/prime-numbers", changefreq: "monthly", priority: 0.5 },
  { path: "/games/algebra-quest", changefreq: "monthly", priority: 0.5 },
  { path: "/games/maths-challenge", changefreq: "monthly", priority: 0.5 },
  { path: "/games/maths-bingo", changefreq: "monthly", priority: 0.5 },
  { path: "/games/coin-counter", changefreq: "monthly", priority: 0.5 },
  { path: "/games/letter-sounds", changefreq: "monthly", priority: 0.5 },
  { path: "/games/rhyme-time", changefreq: "monthly", priority: 0.5 },
  { path: "/games/syllable-split", changefreq: "monthly", priority: 0.5 },
  { path: "/games/prefix-power", changefreq: "monthly", priority: 0.5 },
  { path: "/games/suffix-quest", changefreq: "monthly", priority: 0.5 },
  { path: "/games/homophones", changefreq: "monthly", priority: 0.5 },
  { path: "/games/compound-words", changefreq: "monthly", priority: 0.5 },
  { path: "/games/spelling-challenge", changefreq: "monthly", priority: 0.5 },
  { path: "/games/word-families", changefreq: "monthly", priority: 0.5 },
  { path: "/games/missing-letters", changefreq: "monthly", priority: 0.5 },
  { path: "/games/anagram-attack", changefreq: "monthly", priority: 0.5 },
  { path: "/games/silent-letters", changefreq: "monthly", priority: 0.5 },
  { path: "/games/double-letters", changefreq: "monthly", priority: 0.5 },
  { path: "/games/vowel-sounds", changefreq: "monthly", priority: 0.5 },
  { path: "/games/spelling-snap", changefreq: "monthly", priority: 0.5 },
  { path: "/games/word-builder", changefreq: "monthly", priority: 0.5 },
  { path: "/games/dictionary-dash", changefreq: "monthly", priority: 0.5 },
  { path: "/games/contraction-station", changefreq: "monthly", priority: 0.5 },
  { path: "/games/plural-rules", changefreq: "monthly", priority: 0.5 },
  { path: "/games/word-match", changefreq: "monthly", priority: 0.5 },
  { path: "/games/spelling-race", changefreq: "monthly", priority: 0.5 },
  { path: "/games/comprehension-quest", changefreq: "monthly", priority: 0.5 },
  { path: "/games/story-sequence", changefreq: "monthly", priority: 0.5 },
  
  { path: "/games/punctuation-patrol", changefreq: "monthly", priority: 0.5 },
  { path: "/games/grammar-garage", changefreq: "monthly", priority: 0.5 },
  { path: "/games/noun-spotter", changefreq: "monthly", priority: 0.5 },
  { path: "/games/verb-volcano", changefreq: "monthly", priority: 0.5 },
  { path: "/games/adjective-adventure", changefreq: "monthly", priority: 0.5 },
  { path: "/games/synonym-swap", changefreq: "monthly", priority: 0.5 },
  { path: "/games/antonym-arena", changefreq: "monthly", priority: 0.5 },
  
  
  
  
  { path: "/games/word-meaning", changefreq: "monthly", priority: 0.5 },
  
  { path: "/games/connectives-bridge", changefreq: "monthly", priority: 0.5 },
  
  
  { path: "/games/reading-bingo", changefreq: "monthly", priority: 0.5 },
  
  
  { path: "/games/human-body", changefreq: "monthly", priority: 0.5 },
  { path: "/games/money-maths", changefreq: "monthly", priority: 0.5 },
  { path: "/games/parts-of-speech", changefreq: "monthly", priority: 0.5 },
  { path: "/games/telling-time", changefreq: "monthly", priority: 0.5 },
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  { path: "/games/classification-keys", changefreq: "monthly", priority: 0.5 },
  
  
  
  { path: "/reviews", changefreq: "weekly", priority: 0.8 },
  { path: "/rewards", changefreq: "monthly", priority: 0.7 },
  { path: "/voice-studio", changefreq: "monthly", priority: 0.6 },
  { path: "/story-writer", changefreq: "monthly", priority: 0.6 },
  { path: "/pricing", changefreq: "monthly", priority: 0.9 },
  { path: "/download", changefreq: "monthly", priority: 0.8 },
  { path: "/app-download", changefreq: "monthly", priority: 0.7 },
  { path: "/legal", changefreq: "yearly", priority: 0.3 },
  { path: "/contact", changefreq: "monthly", priority: 0.7 },
  { path: "/login", changefreq: "monthly", priority: 0.5 },
  { path: "/hub", changefreq: "monthly", priority: 0.6 },
  { path: "/hub/login", changefreq: "monthly", priority: 0.4 },
  { path: "/hub/signup", changefreq: "monthly", priority: 0.4 },
  { path: "/signup", changefreq: "monthly", priority: 0.8 },
  { path: "/hub/profile", changefreq: "monthly", priority: 0.4 },
  { path: "/profile", changefreq: "monthly", priority: 0.8 },
  { path: "/hub/notifications", changefreq: "monthly", priority: 0.5 },
  { path: "/hub/subscription", changefreq: "monthly", priority: 0.5 },
  { path: "/teacher-hub", changefreq: "monthly", priority: 0.7 },
  { path: "/teacher-hub/login", changefreq: "monthly", priority: 0.4 },
  { path: "/onboarding", changefreq: "monthly", priority: 0.5 },
  { path: "/star-bank", changefreq: "monthly", priority: 0.8 },
  { path: "/game-of-the-week", changefreq: "monthly", priority: 0.8 },
  { path: "/referral", changefreq: "monthly", priority: 0.6 },
  { path: "/hub/progress", changefreq: "monthly", priority: 0.4 },
  { path: "/notifications", changefreq: "monthly", priority: 0.4 },
  { path: "/badges", changefreq: "monthly", priority: 0.7 },
  { path: "/cart", changefreq: "monthly", priority: 0.8 },
  { path: "/leaderboard", changefreq: "monthly", priority: 0.8 },
  { path: "/parent-dashboard", changefreq: "monthly", priority: 0.8 },
  { path: "/daily-challenge", changefreq: "monthly", priority: 0.8 },
  { path: "/hub/forgot-password", changefreq: "monthly", priority: 0.5 },
  { path: "/hub/reset-password", changefreq: "monthly", priority: 0.5 },
  { path: "/parents", changefreq: "monthly", priority: 0.9 },
  { path: "/games/number-bonds", changefreq: "monthly", priority: 0.5 },
  { path: "/games/animal-habitats", changefreq: "monthly", priority: 0.5 },
  { path: "/games/sentence-builder", changefreq: "monthly", priority: 0.5 },
  { path: "/certificates", changefreq: "monthly", priority: 0.6 },
  { path: "/checkout/success", changefreq: "monthly", priority: 0.3 },
  { path: "/checkout/cancel", changefreq: "monthly", priority: 0.3 },
  { path: "/shop/back-to-school", changefreq: "monthly", priority: 0.6 },
  { path: "/ask-archie", changefreq: "monthly", priority: 0.7 },
  { path: "/chat", changefreq: "monthly", priority: 0.8 },
  { path: "/games/earth-space", changefreq: "weekly", priority: 0.7 },
  { path: "/games/electricity-circuit", changefreq: "weekly", priority: 0.7 },
  { path: "/games/evolution-explorer", changefreq: "weekly", priority: 0.7 },
  { path: "/games/food-chains", changefreq: "weekly", priority: 0.7 },
  { path: "/games/forces-lab", changefreq: "weekly", priority: 0.7 },
  { path: "/games/healthy-eating", changefreq: "weekly", priority: 0.7 },
  { path: "/games/life-cycles", changefreq: "weekly", priority: 0.7 },
  { path: "/games/light-shadows", changefreq: "weekly", priority: 0.7 },
  { path: "/games/magnets-magic", changefreq: "weekly", priority: 0.7 },
  { path: "/games/materials-sort", changefreq: "weekly", priority: 0.7 },
  { path: "/games/microhabitats", changefreq: "weekly", priority: 0.7 },
  { path: "/games/plant-parts", changefreq: "weekly", priority: 0.7 },
  { path: "/games/rock-detective", changefreq: "weekly", priority: 0.7 },
  { path: "/games/science-quiz", changefreq: "weekly", priority: 0.7 },
  { path: "/games/skeleton-builder", changefreq: "weekly", priority: 0.7 },
  { path: "/games/solar-system", changefreq: "weekly", priority: 0.7 },
  { path: "/games/sound-science", changefreq: "weekly", priority: 0.7 },
  { path: "/games/states-of-matter", changefreq: "weekly", priority: 0.7 },
  { path: "/games/water-cycle", changefreq: "weekly", priority: 0.7 },
  { path: "/games/weather-watch", changefreq: "weekly", priority: 0.7 },
  { path: "/games/ordering-numbers", changefreq: "weekly", priority: 0.7 },
  { path: "/games/symmetry-studio", changefreq: "weekly", priority: 0.7 },
  { path: "/games/book-review", changefreq: "weekly", priority: 0.7 },
  { path: "/games/poetry-corner", changefreq: "weekly", priority: 0.7 },
  { path: "/games/reading-challenge", changefreq: "weekly", priority: 0.7 },
  { path: "/games/reading-detective", changefreq: "weekly", priority: 0.7 },
  { path: "/games/reading-fluency", changefreq: "weekly", priority: 0.7 },
  { path: "/games/reading-map", changefreq: "weekly", priority: 0.7 },
  { path: "/games/reading-speed", changefreq: "weekly", priority: 0.7 },
  { path: "/games/speech-marks", changefreq: "weekly", priority: 0.7 },
  { path: "/games/story-map", changefreq: "weekly", priority: 0.7 },
  { path: "/games/text-types", changefreq: "weekly", priority: 0.7 },
];
