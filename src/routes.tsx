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
import NumberPopGame from './pages/games/number-pop';
import TimesTableRaceGame from './pages/games/times-table-race';
import FractionPizzaGame from './pages/games/fraction-pizza';
import WordScrambleGame from './pages/games/word-scramble';
import TimesTablesChallengeGame from './pages/games/times-tables-challenge';
import SentenceScrambleGame from './pages/games/sentence-scramble';
import ScienceLabGame from './pages/games/science-lab';
import ShapeSorterGame from './pages/games/shape-sorter';
import WordWizardGame from './pages/games/word-wizard';
import SpellingBeeGame from './pages/games/spelling-bee';
import TrickyWordHuntGame from './pages/games/tricky-word-hunt';
import StoryBuilderGame from './pages/games/story-builder';
import PhonicsParrotGame from './pages/games/phonics-parrot';
import ReadingQuestGame from './pages/games/reading-quest';
import WordSearchGame from './pages/games/word-search';
import CrosswordGame from './pages/games/crossword';
import Header from './layouts/parts/Header';
import SudokuGame from './pages/games/sudoku';
import NumberPuzzleGame from './pages/games/number-puzzle';
import ColourBookGame from './pages/games/colour-book';
import AlphabetExplorerGame from './pages/games/alphabet-explorer';
import TimesTablesReaderGame from './pages/games/times-tables-reader';
import ReviewsPage from './pages/reviews';
import RewardsPage from './pages/rewards';
import VoiceStudioPage from './pages/voice-studio';
import StoryWriterPage from './pages/story-writer';
import ReadingHubPage from './pages/games/reading-hub';
import MathsHubPage from './pages/games/maths-hub';
import SpellingHubPage from './pages/games/spelling-hub';
import NumberBondsGame from './pages/games/number-bonds';
import AnimalHabitatsGame from './pages/games/animal-habitats';
import SentenceBuilderGame from './pages/games/sentence-builder';
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
import AnimalKingdomGame from './pages/games/animal-kingdom';
import NatureExplorerGame from './pages/games/nature-explorer';
import GeographyQuizGame from './pages/games/geography-quiz';
import MentalMathsSprintGame from './pages/games/mental-maths-sprint';
import ColourLearnGame from './pages/games/colour-learn';
// Maths games (new)
import OddEvenGame from './pages/games/odd-even';
import PlaceValueGame from './pages/games/place-value';
import MultiplicationGridGame from './pages/games/multiplication-grid';
import DivisionDashGame from './pages/games/division-dash';
import NumberLineGame from './pages/games/number-line';
import MathsMysteryGame from './pages/games/maths-mystery';
import PatternMakerGame from './pages/games/pattern-maker';
import AngleExplorerGame from './pages/games/angle-explorer';
import PerimeterQuestGame from './pages/games/perimeter-quest';
import AreaAdventureGame from './pages/games/area-adventure';
import DataDetectiveGame from './pages/games/data-detective';
import FractionMatchGame from './pages/games/fraction-match';
import SpeedTablesGame from './pages/games/speed-tables';
import RoundingRocketGame from './pages/games/rounding-rocket';
import NegativeNumbersGame from './pages/games/negative-numbers';
import CoordinatesGridGame from './pages/games/coordinates-grid';
import SymmetryStudioGame from './pages/games/symmetry-studio';
import TimeTellerGame from './pages/games/time-teller';
import MathsWordProblemsGame from './pages/games/maths-word-problems';
import OrderingNumbersGame from './pages/games/ordering-numbers';
import MissingNumbersGame from './pages/games/missing-numbers';
import MathsSnapGame from './pages/games/maths-snap';
import RatioRecipeGame from './pages/games/ratio-recipe';
import PrimeNumbersGame from './pages/games/prime-numbers';
import AlgebraQuestGame from './pages/games/algebra-quest';
import MathsChallengeGame from './pages/games/maths-challenge';
import MathsBingoGame from './pages/games/maths-bingo';
import CoinCounterGame from './pages/games/coin-counter';
// Spelling games (new)
import LetterSoundsGame from './pages/games/letter-sounds';
import RhymeTimeGame from './pages/games/rhyme-time';
import SyllableSplitGame from './pages/games/syllable-split';
import PrefixPowerGame from './pages/games/prefix-power';
import SuffixQuestGame from './pages/games/suffix-quest';
import HomophonesGame from './pages/games/homophones';
import CompoundWordsGame from './pages/games/compound-words';
import SpellingChallengeGame from './pages/games/spelling-challenge';
import WordFamiliesGame from './pages/games/word-families';
import MissingLettersGame from './pages/games/missing-letters';
import AnagramAttackGame from './pages/games/anagram-attack';
import SilentLettersGame from './pages/games/silent-letters';
import DoubleLettersGame from './pages/games/double-letters';
import VowelSoundsGame from './pages/games/vowel-sounds';
import SpellingSnapGame from './pages/games/spelling-snap';
import WordBuilderGame from './pages/games/word-builder';
import DictionaryDashGame from './pages/games/dictionary-dash';
import ContractionStationGame from './pages/games/contraction-station';
import PluralRulesGame from './pages/games/plural-rules';
import WordMatchGame from './pages/games/word-match';
import SpellingRaceGame from './pages/games/spelling-race';
// Reading games (new)
import ComprehensionQuestGame from './pages/games/comprehension-quest';
import StorySequenceGame from './pages/games/story-sequence';
import ReadingDetectiveGame from './pages/games/reading-detective';
import PunctuationPatrolGame from './pages/games/punctuation-patrol';
import MoneyMathsGame from './pages/games/money-maths';
import PartsOfSpeechGame from './pages/games/parts-of-speech';
import TellingTimeGame from './pages/games/telling-time';
import GeographyUKGame from './pages/games/geography-uk';
import SynonymsAntonymsGame from './pages/games/synonyms-antonyms';
import GrammarGarageGame from './pages/games/grammar-garage';
import NounSpotterGame from './pages/games/noun-spotter';
import VerbVolcanoGame from './pages/games/verb-volcano';
import AdjectiveAdventureGame from './pages/games/adjective-adventure';
import SynonymSwapGame from './pages/games/synonym-swap';
import AntonymArenaGame from './pages/games/antonym-arena';
import ReadingSpeedGame from './pages/games/reading-speed';
import PoetryCornerGame from './pages/games/poetry-corner';
import TextTypesGame from './pages/games/text-types';
import ReadingMapGame from './pages/games/reading-map';
import WordMeaningGame from './pages/games/word-meaning';
import SpeechMarksGame from './pages/games/speech-marks';
import ConnectivesBridgeGame from './pages/games/connectives-bridge';
import ReadingFluencyGame from './pages/games/reading-fluency';
import BookReviewGame from './pages/games/book-review';
import ReadingBingoGame from './pages/games/reading-bingo';
import StoryMapGame from './pages/games/story-map';
import ReadingChallengeGame from './pages/games/reading-challenge';
// Science games (new)
import HumanBodyGame from './pages/games/human-body';
import SolarSystemGame from './pages/games/solar-system';
import FoodChainsGame from './pages/games/food-chains';
import StatesOfMatterGame from './pages/games/states-of-matter';
import ForcesLabGame from './pages/games/forces-lab';
import ElectricityCircuitGame from './pages/games/electricity-circuit';
import PlantPartsGame from './pages/games/plant-parts';
import LifeCyclesGame from './pages/games/life-cycles';
import WeatherWatchGame from './pages/games/weather-watch';
import RockDetectiveGame from './pages/games/rock-detective';
import LightShadowsGame from './pages/games/light-shadows';
import SoundScienceGame from './pages/games/sound-science';
import MaterialsSortGame from './pages/games/materials-sort';
import SkeletonBuilderGame from './pages/games/skeleton-builder';
import HealthyEatingGame from './pages/games/healthy-eating';
import MicrohabitatsGame from './pages/games/microhabitats';
import MagnetsMagicGame from './pages/games/magnets-magic';
import WaterCycleGame from './pages/games/water-cycle';
import ClassificationKeysGame from './pages/games/classification-keys';
import EarthSpaceGame from './pages/games/earth-space';
import EvolutionExplorerGame from './pages/games/evolution-explorer';
import ScienceQuizGame from './pages/games/science-quiz';
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
  element: <NumberPopGame />
}, {
  path: '/games/times-table-race',
  element: <TimesTableRaceGame />
}, {
  path: '/games/fraction-pizza',
  element: <FractionPizzaGame />
}, {
  path: '/games/word-scramble',
  element: <WordScrambleGame />
}, {
  path: '/games/times-tables-challenge',
  element: <TimesTablesChallengeGame />
}, {
  path: '/games/sentence-scramble',
  element: <SentenceScrambleGame />
}, {
  path: '/games/science-lab',
  element: <ScienceLabGame />
}, {
  path: '/games/shape-sorter',
  element: <ShapeSorterGame />
}, {
  path: '/games/word-wizard',
  element: <WordWizardGame />
}, {
  path: '/games/spelling-bee',
  element: <SpellingBeeGame />
}, {
  path: '/games/tricky-word-hunt',
  element: <TrickyWordHuntGame />
}, {
  path: '/games/story-builder',
  element: <StoryBuilderGame />
}, {
  path: '/games/phonics-parrot',
  element: <PhonicsParrotGame />
}, {
  path: '/games/reading-quest',
  element: <ReadingQuestGame />
}, {
  path: '/games/word-search',
  element: <WordSearchGame />
}, {
  path: '/games/crossword',
  element: <CrosswordGame />
}, {
  path: '/games/sudoku',
  element: <SudokuGame />
}, {
  path: '/games/number-puzzle',
  element: <NumberPuzzleGame />,
}, {
  path: '/games/colour-book',
  element: <ColourBookGame />,
}, {
  path: '/games/alphabet-explorer',
  element: <AlphabetExplorerGame />,
}, {
  path: '/games/times-tables-reader',
  element: <TimesTablesReaderGame />,
}, {
  path: '/games/reading',
  element: <ReadingHubPage />,
}, {
  path: '/games/maths',
  element: <MathsHubPage />,
}, {
  path: '/games/spelling',
  element: <SpellingHubPage />,
}, {
  path: '/games/animal-kingdom',
  element: <AnimalKingdomGame />,
}, {
  path: '/games/nature-explorer',
  element: <NatureExplorerGame />,
}, {
  path: '/games/geography-quiz',
  element: <GeographyQuizGame />,
}, {
  path: '/games/mental-maths-sprint',
  element: <MentalMathsSprintGame />,
}, {
  path: '/games/colour-learn',
  element: <ColourLearnGame />,
},
// Maths games (new)
{
  path: '/games/odd-even',
  element: <OddEvenGame />,
}, {
  path: '/games/place-value',
  element: <PlaceValueGame />,
}, {
  path: '/games/geography-uk',
  element: <GeographyUKGame />,
}, {
  path: '/games/synonyms-antonyms',
  element: <SynonymsAntonymsGame />,
}, {
  path: '/games/multiplication-grid',
  element: <MultiplicationGridGame />,
}, {
  path: '/games/division-dash',
  element: <DivisionDashGame />,
}, {
  path: '/games/number-line',
  element: <NumberLineGame />,
}, {
  path: '/games/maths-mystery',
  element: <MathsMysteryGame />,
}, {
  path: '/games/game-pattern-maker',
  element: <Navigate to="/games/pattern-maker" replace />,
}, {
  path: '/games/pattern-maker',
  element: <PatternMakerGame />,
}, {
  path: '/games/angle-explorer',
  element: <AngleExplorerGame />,
}, {
  path: '/games/perimeter-quest',
  element: <PerimeterQuestGame />,
}, {
  path: '/games/area-adventure',
  element: <AreaAdventureGame />,
}, {
  path: '/games/data-detective',
  element: <DataDetectiveGame />,
}, {
  path: '/games/fraction-match',
  element: <FractionMatchGame />,
}, {
  path: '/games/speed-tables',
  element: <SpeedTablesGame />,
}, {
  path: '/games/rounding-rocket',
  element: <RoundingRocketGame />,
}, {
  path: '/games/negative-numbers',
  element: <NegativeNumbersGame />,
}, {
  path: '/games/coordinates-grid',
  element: <CoordinatesGridGame />,
}, {
  path: '/games/symmetry-studio',
  element: <SymmetryStudioGame />,
}, {
  path: '/games/time-teller',
  element: <TimeTellerGame />,
}, {
  path: '/games/maths-word-problems',
  element: <MathsWordProblemsGame />,
}, {
  path: '/games/ordering-numbers',
  element: <OrderingNumbersGame />,
}, {
  path: '/games/missing-numbers',
  element: <MissingNumbersGame />,
}, {
  path: '/games/maths-snap',
  element: <MathsSnapGame />,
}, {
  path: '/games/ratio-recipe',
  element: <RatioRecipeGame />,
}, {
  path: '/games/prime-numbers',
  element: <PrimeNumbersGame />,
}, {
  path: '/games/algebra-quest',
  element: <AlgebraQuestGame />,
}, {
  path: '/games/maths-challenge',
  element: <MathsChallengeGame />,
}, {
  path: '/games/maths-bingo',
  element: <MathsBingoGame />,
}, {
  path: '/games/coin-counter',
  element: <CoinCounterGame />,
},
// Spelling games (new)
{
  path: '/games/letter-sounds',
  element: <LetterSoundsGame />,
}, {
  path: '/games/rhyme-time',
  element: <RhymeTimeGame />,
}, {
  path: '/games/syllable-split',
  element: <SyllableSplitGame />,
}, {
  path: '/games/prefix-power',
  element: <PrefixPowerGame />,
}, {
  path: '/games/suffix-quest',
  element: <SuffixQuestGame />,
}, {
  path: '/games/homophones',
  element: <HomophonesGame />,
}, {
  path: '/games/compound-words',
  element: <CompoundWordsGame />,
}, {
  path: '/games/spelling-challenge',
  element: <SpellingChallengeGame />,
}, {
  path: '/games/word-families',
  element: <WordFamiliesGame />,
}, {
  path: '/games/missing-letters',
  element: <MissingLettersGame />,
}, {
  path: '/games/anagram-attack',
  element: <AnagramAttackGame />,
}, {
  path: '/games/silent-letters',
  element: <SilentLettersGame />,
}, {
  path: '/games/double-letters',
  element: <DoubleLettersGame />,
}, {
  path: '/games/vowel-sounds',
  element: <VowelSoundsGame />,
}, {
  path: '/games/spelling-snap',
  element: <SpellingSnapGame />,
}, {
  path: '/games/word-builder',
  element: <WordBuilderGame />,
}, {
  path: '/games/dictionary-dash',
  element: <DictionaryDashGame />,
}, {
  path: '/games/contraction-station',
  element: <ContractionStationGame />,
}, {
  path: '/games/plural-rules',
  element: <PluralRulesGame />,
}, {
  path: '/games/word-match',
  element: <WordMatchGame />,
}, {
  path: '/games/spelling-race',
  element: <SpellingRaceGame />,
},
// Reading games (new)
{
  path: '/games/comprehension-quest',
  element: <ComprehensionQuestGame />,
}, {
  path: '/games/story-sequence',
  element: <StorySequenceGame />,
}, {
  path: '/games/reading-detective',
  element: <ReadingDetectiveGame />,
}, {
  path: '/games/punctuation-patrol',
  element: <PunctuationPatrolGame />,
}, {
  path: '/games/grammar-garage',
  element: <GrammarGarageGame />,
}, {
  path: '/games/noun-spotter',
  element: <NounSpotterGame />,
}, {
  path: '/games/verb-volcano',
  element: <VerbVolcanoGame />,
}, {
  path: '/games/adjective-adventure',
  element: <AdjectiveAdventureGame />,
}, {
  path: '/games/synonym-swap',
  element: <SynonymSwapGame />,
}, {
  path: '/games/antonym-arena',
  element: <AntonymArenaGame />,
}, {
  path: '/games/reading-speed',
  element: <ReadingSpeedGame />,
}, {
  path: '/games/poetry-corner',
  element: <PoetryCornerGame />,
}, {
  path: '/games/text-types',
  element: <TextTypesGame />,
}, {
  path: '/games/reading-map',
  element: <ReadingMapGame />,
}, {
  path: '/games/word-meaning',
  element: <WordMeaningGame />,
}, {
  path: '/games/speech-marks',
  element: <SpeechMarksGame />,
}, {
  path: '/games/connectives-bridge',
  element: <ConnectivesBridgeGame />,
}, {
  path: '/games/reading-fluency',
  element: <ReadingFluencyGame />,
}, {
  path: '/games/book-review',
  element: <BookReviewGame />,
}, {
  path: '/games/reading-bingo',
  element: <ReadingBingoGame />,
}, {
  path: '/games/story-map',
  element: <StoryMapGame />,
}, {
  path: '/games/reading-challenge',
  element: <ReadingChallengeGame />,
},
// Science games (new)
{
  path: '/games/human-body',
  element: <HumanBodyGame />,
}, {
  path: '/games/money-maths',
  element: <MoneyMathsGame />,
}, {
  path: '/games/parts-of-speech',
  element: <PartsOfSpeechGame />,
}, {
  path: '/games/telling-time',
  element: <TellingTimeGame />,
}, {
  path: '/games/solar-system',
  element: <SolarSystemGame />,
}, {
  path: '/games/food-chains',
  element: <FoodChainsGame />,
}, {
  path: '/games/states-of-matter',
  element: <StatesOfMatterGame />,
}, {
  path: '/games/forces-lab',
  element: <ForcesLabGame />,
}, {
  path: '/games/electricity-circuit',
  element: <ElectricityCircuitGame />,
}, {
  path: '/games/plant-parts',
  element: <PlantPartsGame />,
}, {
  path: '/games/life-cycles',
  element: <LifeCyclesGame />,
}, {
  path: '/games/weather-watch',
  element: <WeatherWatchGame />,
}, {
  path: '/games/rock-detective',
  element: <RockDetectiveGame />,
}, {
  path: '/games/light-shadows',
  element: <LightShadowsGame />,
}, {
  path: '/games/sound-science',
  element: <SoundScienceGame />,
}, {
  path: '/games/materials-sort',
  element: <MaterialsSortGame />,
}, {
  path: '/games/skeleton-builder',
  element: <SkeletonBuilderGame />,
}, {
  path: '/games/healthy-eating',
  element: <HealthyEatingGame />,
}, {
  path: '/games/microhabitats',
  element: <MicrohabitatsGame />,
}, {
  path: '/games/magnets-magic',
  element: <MagnetsMagicGame />,
}, {
  path: '/games/water-cycle',
  element: <WaterCycleGame />,
}, {
  path: '/games/classification-keys',
  element: <ClassificationKeysGame />,
}, {
  path: '/games/earth-space',
  element: <EarthSpaceGame />,
}, {
  path: '/games/evolution-explorer',
  element: <EvolutionExplorerGame />,
}, {
  path: '/games/science-quiz',
  element: <ScienceQuizGame />,
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
  element: <NumberBondsGame />,
}, {
  path: '/games/animal-habitats',
  element: <AnimalHabitatsGame />,
}, {
  path: '/games/sentence-builder',
  element: <SentenceBuilderGame />,
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
