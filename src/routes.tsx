import { RouteObject } from "react-router";
import { lazy } from 'react';
import { Navigate } from 'react-router';
import HomePage from './pages/index';
import SodafomAdventurePage from './pages/SodafomAdventurePage';
import CartoonTheatrePage from './pages/CartoonTheatrePage';
import AITeacherPage from './pages/AITeacherPage';
import TeacherModePage from './pages/tutor/TeacherModePage';
import SubjectsPage from './pages/subjects';
import MathsSubjectPage from './pages/subjects/maths';
import SpellingSubjectPage from './pages/subjects/spelling';
import ReadingSubjectPage from './pages/subjects/reading';
import ScienceSubjectPage from './pages/subjects/science';
import PricingPage from './pages/pricing';
import DemoPage from './pages/demo';
import SubscribePage from './pages/subscribe';
import LoginRedirectPage from './pages/login';
import HubPage from './pages/hub/index';
import HubLoginPage from './pages/hub/login';
import HubSignupPage from './pages/hub/signup';
import ChildProgressPage from './pages/hub/child/[childId]';
import AppDownloadPage from './pages/app-download';
import LegalPage from './pages/legal';
import ContactPage from './pages/contact';
import CartPage from './pages/cart';
import ForgotPasswordPage from './pages/hub/forgot-password';
import ResetPasswordPage from './pages/hub/reset-password';
import ParentDashboardPage from './pages/parent-dashboard';
import DailyChallengePage from './pages/daily-challenge';
import CheckoutSuccess from './pages/checkout/success';
import CheckoutCancel from './pages/checkout/cancel';
import ProdNotFoundPage from './pages/_404';
// Game pages
import Header from './layouts/parts/Header';
import ReviewsPage from './pages/reviews';
import RewardsPage from './pages/rewards';
import VoiceStudioPage from './pages/voice-studio';
import StoryWriterPage from './pages/story-writer';
import CertificatesPage from './pages/certificates';
import MockExamsPage from './pages/mock-exams/index';
import AdminPortal from './pages/admin/AdminPortal';
import SodafomBotPage from './pages/chatbot/SodafomBotPage';
import AdminPanelPage from './pages/admin-panel';
import TeacherHubDashboard from './pages/teacher-hub/index';
import TeacherHubLoginPage from './pages/teacher-hub/login';
import StudentDetailPage from './pages/teacher-hub/student/[studentId]';
import ProfilePage from './pages/hub/profile';
import HubNotificationsPage from './pages/hub/notifications';
import HubSubscriptionPage from './pages/hub/subscription';
import BlogIndexPage from './pages/blog/index';
import BlogPostPage from './pages/blog/[slug]';
import AboutPage from './pages/about';
import ParentsPage from './pages/parents';
import LeaderboardPage from './pages/leaderboard';
import OnboardingPage from './pages/onboarding';
import ReferralPage from './pages/referral';
import StarBankPage from './pages/star-bank';
import GameOfTheWeekPage from './pages/game-of-the-week';
import HubProgressPage from './pages/hub/progress';
import NotificationsPage from './pages/notifications';
import BadgesPage from './pages/badges';
import BattleHubPage from './pages/battle/index';
import BattleRoomPage from './pages/battle/[id]';
// Maths games (new)
// Spelling games (new)
// Reading games (new)
// Science games (new)
import BackToSchoolShopPage from './pages/shop/back-to-school';
const ChatbotPage = lazy(() => import('./pages/chatbot/ChatbotPage'));
const NotFoundPage = ProdNotFoundPage;
export const routes: RouteObject[] = [{
  path: '/',
  element: <SodafomAdventurePage />
}, {
  path: '/about',
  element: <AboutPage />
}, {
  path: '/battle',
  element: <BattleHubPage />
}, {
  path: '/battle/:id',
  element: <BattleRoomPage />
}, {
  path: '/blog',
  element: <BlogIndexPage />
}, {
  path: '/blog/:slug',
  element: <BlogPostPage />
}, {
  path: '/admin-panel',
  element: <AdminPanelPage />
}, {
  path: '/admin/sodafom-bot',
  element: <Navigate to="/admin-panel?tab=bot" replace />
}, {
  path: '/tutor',
  element: <TeacherModePage />
}, {
  path: '/teacher-mode',
  element: <TeacherModePage />
}, {
  path: '/classic-home',
  element: <HomePage />
}, {
  path: '/subjects',
  element: <SubjectsPage />
}, {
  path: '/subjects/maths',
  element: <MathsSubjectPage />
}, {
  path: '/subjects/spelling',
  element: <SpellingSubjectPage />
}, {
  path: '/subjects/reading',
  element: <ReadingSubjectPage />
}, {
  path: '/subjects/science',
  element: <ScienceSubjectPage />
}, {
  path: '/games',
  element: <Navigate to="/" replace />,
}, {
  path: '/demo',
  element: <DemoPage />
}, {
  path: '/subscribe',
  element: <SubscribePage />
},
// Individual game routes
{
  path: '/games/number-pop',
  lazy: () => import('./pages/games/number-pop').then((module) => ({ Component: module.default }))
}, {
  path: '/games/times-table-race',
  lazy: () => import('./pages/games/times-table-race').then((module) => ({ Component: module.default }))
}, {
  path: '/games/fraction-pizza',
  lazy: () => import('./pages/games/fraction-pizza').then((module) => ({ Component: module.default }))
}, {
  path: '/games/word-scramble',
  lazy: () => import('./pages/games/word-scramble').then((module) => ({ Component: module.default }))
}, {
  path: '/games/times-tables-challenge',
  lazy: () => import('./pages/games/times-tables-challenge').then((module) => ({ Component: module.default }))
}, {
  path: '/games/sentence-scramble',
  lazy: () => import('./pages/games/sentence-scramble').then((module) => ({ Component: module.default }))
}, {
  path: '/games/science-lab',
  lazy: () => import('./pages/games/science-lab').then((module) => ({ Component: module.default }))
}, {
  path: '/games/shape-sorter',
  lazy: () => import('./pages/games/shape-sorter').then((module) => ({ Component: module.default }))
}, {
  path: '/games/word-wizard',
  lazy: () => import('./pages/games/word-wizard').then((module) => ({ Component: module.default }))
}, {
  path: '/games/spelling-bee',
  lazy: () => import('./pages/games/spelling-bee').then((module) => ({ Component: module.default }))
}, {
  path: '/games/tricky-word-hunt',
  lazy: () => import('./pages/games/tricky-word-hunt').then((module) => ({ Component: module.default }))
}, {
  path: '/games/story-builder',
  lazy: () => import('./pages/games/story-builder').then((module) => ({ Component: module.default }))
}, {
  path: '/games/phonics-parrot',
  lazy: () => import('./pages/games/phonics-parrot').then((module) => ({ Component: module.default }))
}, {
  path: '/games/reading-quest',
  lazy: () => import('./pages/games/reading-quest').then((module) => ({ Component: module.default }))
}, {
  path: '/games/word-search',
  lazy: () => import('./pages/games/word-search').then((module) => ({ Component: module.default }))
}, {
  path: '/games/crossword',
  lazy: () => import('./pages/games/crossword').then((module) => ({ Component: module.default }))
}, {
  path: '/games/sudoku',
  lazy: () => import('./pages/games/sudoku').then((module) => ({ Component: module.default }))
}, {
  path: '/games/number-puzzle',
  lazy: () => import('./pages/games/number-puzzle').then((module) => ({ Component: module.default }))
}, {
  path: '/games/colour-book',
  lazy: () => import('./pages/games/colour-book').then((module) => ({ Component: module.default }))
}, {
  path: '/games/alphabet-explorer',
  lazy: () => import('./pages/games/alphabet-explorer').then((module) => ({ Component: module.default }))
}, {
  path: '/games/times-tables-reader',
  lazy: () => import('./pages/games/times-tables-reader').then((module) => ({ Component: module.default }))
}, {
  path: '/games/reading',
  lazy: () => import('./pages/games/reading-hub').then((module) => ({ Component: module.default }))
}, {
  path: '/games/maths',
  lazy: () => import('./pages/games/maths-hub').then((module) => ({ Component: module.default }))
}, {
  path: '/games/spelling',
  lazy: () => import('./pages/games/spelling-hub').then((module) => ({ Component: module.default }))
}, {
  path: '/games/animal-kingdom',
  lazy: () => import('./pages/games/animal-kingdom').then((module) => ({ Component: module.default }))
}, {
  path: '/games/nature-explorer',
  lazy: () => import('./pages/games/nature-explorer').then((module) => ({ Component: module.default }))
}, {
  path: '/games/geography-quiz',
  lazy: () => import('./pages/games/geography-quiz').then((module) => ({ Component: module.default }))
}, {
  path: '/games/mental-maths-sprint',
  lazy: () => import('./pages/games/mental-maths-sprint').then((module) => ({ Component: module.default }))
}, {
  path: '/games/colour-learn',
  lazy: () => import('./pages/games/colour-learn').then((module) => ({ Component: module.default }))
},
// Maths games (new)
{
  path: '/games/odd-even',
  lazy: () => import('./pages/games/odd-even').then((module) => ({ Component: module.default }))
}, {
  path: '/games/place-value',
  lazy: () => import('./pages/games/place-value').then((module) => ({ Component: module.default }))
}, {
  path: '/games/geography-uk',
  lazy: () => import('./pages/games/geography-uk').then((module) => ({ Component: module.default }))
}, {
  path: '/games/synonyms-antonyms',
  lazy: () => import('./pages/games/synonyms-antonyms').then((module) => ({ Component: module.default }))
}, {
  path: '/games/multiplication-grid',
  lazy: () => import('./pages/games/multiplication-grid').then((module) => ({ Component: module.default }))
}, {
  path: '/games/division-dash',
  lazy: () => import('./pages/games/division-dash').then((module) => ({ Component: module.default }))
}, {
  path: '/games/number-line',
  lazy: () => import('./pages/games/number-line').then((module) => ({ Component: module.default }))
}, {
  path: '/games/maths-mystery',
  lazy: () => import('./pages/games/maths-mystery').then((module) => ({ Component: module.default }))
}, {
  path: '/games/game-pattern-maker',
  element: <Navigate to="/games/pattern-maker" replace />,
}, {
  path: '/games/pattern-maker',
  lazy: () => import('./pages/games/pattern-maker').then((module) => ({ Component: module.default }))
}, {
  path: '/games/angle-explorer',
  lazy: () => import('./pages/games/angle-explorer').then((module) => ({ Component: module.default }))
}, {
  path: '/games/perimeter-quest',
  lazy: () => import('./pages/games/perimeter-quest').then((module) => ({ Component: module.default }))
}, {
  path: '/games/area-adventure',
  lazy: () => import('./pages/games/area-adventure').then((module) => ({ Component: module.default }))
}, {
  path: '/games/data-detective',
  lazy: () => import('./pages/games/data-detective').then((module) => ({ Component: module.default }))
}, {
  path: '/games/fraction-match',
  lazy: () => import('./pages/games/fraction-match').then((module) => ({ Component: module.default }))
}, {
  path: '/games/speed-tables',
  lazy: () => import('./pages/games/speed-tables').then((module) => ({ Component: module.default }))
}, {
  path: '/games/rounding-rocket',
  lazy: () => import('./pages/games/rounding-rocket').then((module) => ({ Component: module.default }))
}, {
  path: '/games/negative-numbers',
  lazy: () => import('./pages/games/negative-numbers').then((module) => ({ Component: module.default }))
}, {
  path: '/games/coordinates-grid',
  lazy: () => import('./pages/games/coordinates-grid').then((module) => ({ Component: module.default }))
}, {
  path: '/games/symmetry-studio',
  lazy: () => import('./pages/games/symmetry-studio').then((module) => ({ Component: module.default }))
}, {
  path: '/games/time-teller',
  lazy: () => import('./pages/games/time-teller').then((module) => ({ Component: module.default }))
}, {
  path: '/games/maths-word-problems',
  lazy: () => import('./pages/games/maths-word-problems').then((module) => ({ Component: module.default }))
}, {
  path: '/games/ordering-numbers',
  lazy: () => import('./pages/games/ordering-numbers').then((module) => ({ Component: module.default }))
}, {
  path: '/games/missing-numbers',
  lazy: () => import('./pages/games/missing-numbers').then((module) => ({ Component: module.default }))
}, {
  path: '/games/maths-snap',
  lazy: () => import('./pages/games/maths-snap').then((module) => ({ Component: module.default }))
}, {
  path: '/games/ratio-recipe',
  lazy: () => import('./pages/games/ratio-recipe').then((module) => ({ Component: module.default }))
}, {
  path: '/games/prime-numbers',
  lazy: () => import('./pages/games/prime-numbers').then((module) => ({ Component: module.default }))
}, {
  path: '/games/algebra-quest',
  lazy: () => import('./pages/games/algebra-quest').then((module) => ({ Component: module.default }))
}, {
  path: '/games/maths-challenge',
  lazy: () => import('./pages/games/maths-challenge').then((module) => ({ Component: module.default }))
}, {
  path: '/games/maths-bingo',
  lazy: () => import('./pages/games/maths-bingo').then((module) => ({ Component: module.default }))
}, {
  path: '/games/coin-counter',
  lazy: () => import('./pages/games/coin-counter').then((module) => ({ Component: module.default }))
},
// Spelling games (new)
{
  path: '/games/letter-sounds',
  lazy: () => import('./pages/games/letter-sounds').then((module) => ({ Component: module.default }))
}, {
  path: '/games/rhyme-time',
  lazy: () => import('./pages/games/rhyme-time').then((module) => ({ Component: module.default }))
}, {
  path: '/games/syllable-split',
  lazy: () => import('./pages/games/syllable-split').then((module) => ({ Component: module.default }))
}, {
  path: '/games/prefix-power',
  lazy: () => import('./pages/games/prefix-power').then((module) => ({ Component: module.default }))
}, {
  path: '/games/suffix-quest',
  lazy: () => import('./pages/games/suffix-quest').then((module) => ({ Component: module.default }))
}, {
  path: '/games/homophones',
  lazy: () => import('./pages/games/homophones').then((module) => ({ Component: module.default }))
}, {
  path: '/games/compound-words',
  lazy: () => import('./pages/games/compound-words').then((module) => ({ Component: module.default }))
}, {
  path: '/games/spelling-challenge',
  lazy: () => import('./pages/games/spelling-challenge').then((module) => ({ Component: module.default }))
}, {
  path: '/games/word-families',
  lazy: () => import('./pages/games/word-families').then((module) => ({ Component: module.default }))
}, {
  path: '/games/missing-letters',
  lazy: () => import('./pages/games/missing-letters').then((module) => ({ Component: module.default }))
}, {
  path: '/games/anagram-attack',
  lazy: () => import('./pages/games/anagram-attack').then((module) => ({ Component: module.default }))
}, {
  path: '/games/silent-letters',
  lazy: () => import('./pages/games/silent-letters').then((module) => ({ Component: module.default }))
}, {
  path: '/games/double-letters',
  lazy: () => import('./pages/games/double-letters').then((module) => ({ Component: module.default }))
}, {
  path: '/games/vowel-sounds',
  lazy: () => import('./pages/games/vowel-sounds').then((module) => ({ Component: module.default }))
}, {
  path: '/games/spelling-snap',
  lazy: () => import('./pages/games/spelling-snap').then((module) => ({ Component: module.default }))
}, {
  path: '/games/word-builder',
  lazy: () => import('./pages/games/word-builder').then((module) => ({ Component: module.default }))
}, {
  path: '/games/dictionary-dash',
  lazy: () => import('./pages/games/dictionary-dash').then((module) => ({ Component: module.default }))
}, {
  path: '/games/contraction-station',
  lazy: () => import('./pages/games/contraction-station').then((module) => ({ Component: module.default }))
}, {
  path: '/games/plural-rules',
  lazy: () => import('./pages/games/plural-rules').then((module) => ({ Component: module.default }))
}, {
  path: '/games/word-match',
  lazy: () => import('./pages/games/word-match').then((module) => ({ Component: module.default }))
}, {
  path: '/games/spelling-race',
  lazy: () => import('./pages/games/spelling-race').then((module) => ({ Component: module.default }))
},
// Reading games (new)
{
  path: '/games/comprehension-quest',
  lazy: () => import('./pages/games/comprehension-quest').then((module) => ({ Component: module.default }))
}, {
  path: '/games/story-sequence',
  lazy: () => import('./pages/games/story-sequence').then((module) => ({ Component: module.default }))
}, {
  path: '/games/reading-detective',
  lazy: () => import('./pages/games/reading-detective').then((module) => ({ Component: module.default }))
}, {
  path: '/games/punctuation-patrol',
  lazy: () => import('./pages/games/punctuation-patrol').then((module) => ({ Component: module.default }))
}, {
  path: '/games/grammar-garage',
  lazy: () => import('./pages/games/grammar-garage').then((module) => ({ Component: module.default }))
}, {
  path: '/games/noun-spotter',
  lazy: () => import('./pages/games/noun-spotter').then((module) => ({ Component: module.default }))
}, {
  path: '/games/verb-volcano',
  lazy: () => import('./pages/games/verb-volcano').then((module) => ({ Component: module.default }))
}, {
  path: '/games/adjective-adventure',
  lazy: () => import('./pages/games/adjective-adventure').then((module) => ({ Component: module.default }))
}, {
  path: '/games/synonym-swap',
  lazy: () => import('./pages/games/synonym-swap').then((module) => ({ Component: module.default }))
}, {
  path: '/games/antonym-arena',
  lazy: () => import('./pages/games/antonym-arena').then((module) => ({ Component: module.default }))
}, {
  path: '/games/reading-speed',
  lazy: () => import('./pages/games/reading-speed').then((module) => ({ Component: module.default }))
}, {
  path: '/games/poetry-corner',
  lazy: () => import('./pages/games/poetry-corner').then((module) => ({ Component: module.default }))
}, {
  path: '/games/text-types',
  lazy: () => import('./pages/games/text-types').then((module) => ({ Component: module.default }))
}, {
  path: '/games/reading-map',
  lazy: () => import('./pages/games/reading-map').then((module) => ({ Component: module.default }))
}, {
  path: '/games/word-meaning',
  lazy: () => import('./pages/games/word-meaning').then((module) => ({ Component: module.default }))
}, {
  path: '/games/speech-marks',
  lazy: () => import('./pages/games/speech-marks').then((module) => ({ Component: module.default }))
}, {
  path: '/games/connectives-bridge',
  lazy: () => import('./pages/games/connectives-bridge').then((module) => ({ Component: module.default }))
}, {
  path: '/games/reading-fluency',
  lazy: () => import('./pages/games/reading-fluency').then((module) => ({ Component: module.default }))
}, {
  path: '/games/book-review',
  lazy: () => import('./pages/games/book-review').then((module) => ({ Component: module.default }))
}, {
  path: '/games/reading-bingo',
  lazy: () => import('./pages/games/reading-bingo').then((module) => ({ Component: module.default }))
}, {
  path: '/games/story-map',
  lazy: () => import('./pages/games/story-map').then((module) => ({ Component: module.default }))
}, {
  path: '/games/reading-challenge',
  lazy: () => import('./pages/games/reading-challenge').then((module) => ({ Component: module.default }))
},
// Science games (new)
{
  path: '/games/human-body',
  lazy: () => import('./pages/games/human-body').then((module) => ({ Component: module.default }))
}, {
  path: '/games/money-maths',
  lazy: () => import('./pages/games/money-maths').then((module) => ({ Component: module.default }))
}, {
  path: '/games/parts-of-speech',
  lazy: () => import('./pages/games/parts-of-speech').then((module) => ({ Component: module.default }))
}, {
  path: '/games/telling-time',
  lazy: () => import('./pages/games/telling-time').then((module) => ({ Component: module.default }))
}, {
  path: '/games/solar-system',
  lazy: () => import('./pages/games/solar-system').then((module) => ({ Component: module.default }))
}, {
  path: '/games/food-chains',
  lazy: () => import('./pages/games/food-chains').then((module) => ({ Component: module.default }))
}, {
  path: '/games/states-of-matter',
  lazy: () => import('./pages/games/states-of-matter').then((module) => ({ Component: module.default }))
}, {
  path: '/games/forces-lab',
  lazy: () => import('./pages/games/forces-lab').then((module) => ({ Component: module.default }))
}, {
  path: '/games/electricity-circuit',
  lazy: () => import('./pages/games/electricity-circuit').then((module) => ({ Component: module.default }))
}, {
  path: '/games/plant-parts',
  lazy: () => import('./pages/games/plant-parts').then((module) => ({ Component: module.default }))
}, {
  path: '/games/life-cycles',
  lazy: () => import('./pages/games/life-cycles').then((module) => ({ Component: module.default }))
}, {
  path: '/games/weather-watch',
  lazy: () => import('./pages/games/weather-watch').then((module) => ({ Component: module.default }))
}, {
  path: '/games/rock-detective',
  lazy: () => import('./pages/games/rock-detective').then((module) => ({ Component: module.default }))
}, {
  path: '/games/light-shadows',
  lazy: () => import('./pages/games/light-shadows').then((module) => ({ Component: module.default }))
}, {
  path: '/games/sound-science',
  lazy: () => import('./pages/games/sound-science').then((module) => ({ Component: module.default }))
}, {
  path: '/games/materials-sort',
  lazy: () => import('./pages/games/materials-sort').then((module) => ({ Component: module.default }))
}, {
  path: '/games/skeleton-builder',
  lazy: () => import('./pages/games/skeleton-builder').then((module) => ({ Component: module.default }))
}, {
  path: '/games/healthy-eating',
  lazy: () => import('./pages/games/healthy-eating').then((module) => ({ Component: module.default }))
}, {
  path: '/games/microhabitats',
  lazy: () => import('./pages/games/microhabitats').then((module) => ({ Component: module.default }))
}, {
  path: '/games/magnets-magic',
  lazy: () => import('./pages/games/magnets-magic').then((module) => ({ Component: module.default }))
}, {
  path: '/games/water-cycle',
  lazy: () => import('./pages/games/water-cycle').then((module) => ({ Component: module.default }))
}, {
  path: '/games/classification-keys',
  lazy: () => import('./pages/games/classification-keys').then((module) => ({ Component: module.default }))
}, {
  path: '/games/earth-space',
  lazy: () => import('./pages/games/earth-space').then((module) => ({ Component: module.default }))
}, {
  path: '/games/evolution-explorer',
  lazy: () => import('./pages/games/evolution-explorer').then((module) => ({ Component: module.default }))
}, {
  path: '/games/science-quiz',
  lazy: () => import('./pages/games/science-quiz').then((module) => ({ Component: module.default }))
}, {
  path: '/reviews',
  element: <ReviewsPage />,
}, {
  path: '/rewards',
  element: <RewardsPage />,
}, {
  path: '/voice-studio',
  element: <VoiceStudioPage />,
}, {
  path: '/story-writer',
  element: <StoryWriterPage />,
}, {
  path: '/pricing',
  element: <PricingPage />
}, {
  path: '/download',
  element: <AppDownloadPage />
}, {
  path: '/legal',
  element: <LegalPage />
}, {
  path: '/contact',
  element: <ContactPage />
}, {
  path: '/login',
  element: <LoginRedirectPage />
}, {
  path: '/hub',
  element: <HubPage />
}, {
  path: '/hub/login',
  element: <HubLoginPage />
}, {
  path: '/hub/signup',
  element: <HubSignupPage />
}, {
  path: '/signup',
  element: <HubSignupPage />
}, {
  path: '/hub/child/:childId',
  element: <ChildProgressPage />
}, {
  path: '/hub/profile',
  element: <ProfilePage />,
}, {
  path: '/profile',
  element: <ProfilePage />,
}, {
  path: '/hub/notifications',
  element: <HubNotificationsPage />,
}, {
  path: '/hub/subscription',
  element: <HubSubscriptionPage />,
}, {
  path: '/teacher-hub',
  element: <TeacherHubDashboard />,
}, {
  path: '/teacher-hub/login',
  element: <TeacherHubLoginPage />,
}, {
  path: '/teacher-hub/student/:studentId',
  element: <StudentDetailPage />,
}, {
  path: '/onboarding',
  element: <OnboardingPage />,
}, {
  path: '/star-bank',
  element: <StarBankPage />,
}, {
  path: '/game-of-the-week',
  element: <GameOfTheWeekPage />,
}, {
  path: '/referral',
  element: <ReferralPage />,
}, {
  path: '/hub/progress',
  element: <HubProgressPage />,
}, {
  path: '/notifications',
  element: <NotificationsPage />,
}, {
  path: '/badges',
  element: <BadgesPage />,
}, {
  path: '/cart',
  element: <CartPage />
}, {
  path: '/leaderboard',
  element: <LeaderboardPage />,
}, {
  path: '/parent-dashboard',
  element: <ParentDashboardPage />,
}, {
  path: '/daily-challenge',
  element: <DailyChallengePage />,
}, {
  path: '/hub/forgot-password',
  element: <ForgotPasswordPage />,
}, {
  path: '/hub/reset-password',
  element: <ResetPasswordPage />,
}, {
  path: '/parents',
  element: <ParentsPage />
}, {
  path: '/games/number-bonds',
  lazy: () => import('./pages/games/number-bonds').then((module) => ({ Component: module.default }))
}, {
  path: '/games/animal-habitats',
  lazy: () => import('./pages/games/animal-habitats').then((module) => ({ Component: module.default }))
}, {
  path: '/games/sentence-builder',
  lazy: () => import('./pages/games/sentence-builder').then((module) => ({ Component: module.default }))
}, {
  path: '/cartoon-mode',
  // Keep one canonical World system.  The previous CartoonModePage contained
  // a second, conflicting set of World labels and activity routes, which could
  // make the selected subject disagree with the page that opened.
  element: <SodafomAdventurePage />
}, {
  path: '/cartoons',
  element: <CartoonTheatrePage />
}, {
  path: '/ai-teacher',
  element: <AITeacherPage />
}, {
  path: '/mock-exams',
  element: <MockExamsPage />
}, {
  path: '/sodafom-bot',
  element: <SodafomBotPage />
}, {
  path: '/certificates',
  element: <CertificatesPage />,
}, {
  path: '/checkout/success',
  element: <CheckoutSuccess />
}, {
  path: '/checkout/cancel',
  element: <CheckoutCancel />
}, {
  path: '/shop/back-to-school',
  element: <BackToSchoolShopPage />
}, {
  path: '/ask-archie',
  element: <ChatbotPage />
}, {
  // Legacy /chat alias — redirects to /ask-archie
  path: '/chat',
  element: <ChatbotPage />
}, {
  path: '*',
  // Broken/legacy links must never strand a child on a 404 screen.
  // Send unknown in-app routes back to the safe home screen instead.
  element: <Navigate to="/" replace />
}];
export type Path = '/' | '/subjects' | '/games' | '/pricing' | '/hub' | '/hub/login' | '/hub/signup';
export type Params = Record<string, string | undefined>;
