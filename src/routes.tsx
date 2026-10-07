import { ArchieHome, ArchieWorld, ArchieGames, ArchieLesson, ArchieLibrary, ArchieReader, ArchieHomework, ArchieRewards, ArchieParents, ArchieCartoons, ArchieAskRoute, ArchieArtworkGallery } from '@/pages/archie/ArchiePages';
import ArchieQuests from '@/pages/archie/ArchieQuests';
import ArchiePrivacy from '@/pages/archie/ArchiePrivacy';
import ArchieClockLab from '@/pages/archie/ArchieClockLab';
import ArchiePreviewAdmin from '@/pages/archie/ArchiePreviewAdmin';
import { RouteObject } from "react-router";
import { lazy } from 'react';
const ArchieCourses = lazy(() => import('@/pages/archie/ArchieCourses'));
import { Navigate } from 'react-router';
const HomePage = lazy(() => import('./pages/index'));
const SodafomAdventurePage = lazy(() => import('./pages/SodafomAdventurePage'));
const CartoonTheatrePage = lazy(() => import('./pages/CartoonTheatrePage'));
const AITeacherPage = lazy(() => import('./pages/AITeacherPage'));
const TeacherModePage = lazy(() => import('./pages/tutor/TeacherModePage'));
const SubjectsPage = lazy(() => import('./pages/subjects'));
const MathsSubjectPage = lazy(() => import('./pages/subjects/maths'));
const SpellingSubjectPage = lazy(() => import('./pages/subjects/spelling'));
const ReadingSubjectPage = lazy(() => import('./pages/subjects/reading'));
const ScienceSubjectPage = lazy(() => import('./pages/subjects/science'));
const PricingPage = lazy(() => import('./pages/pricing'));
const DemoPage = lazy(() => import('./pages/demo'));
const SubscribePage = lazy(() => import('./pages/subscribe'));
const LoginRedirectPage = lazy(() => import('./pages/login'));
const HubPage = lazy(() => import('./pages/hub/index'));
const HubLoginPage = lazy(() => import('./pages/hub/login'));
const HubSignupPage = lazy(() => import('./pages/hub/signup'));
const ChildProgressPage = lazy(() => import('./pages/hub/child/[childId]'));
const AppDownloadPage = lazy(() => import('./pages/app-download'));
const LegalPage = lazy(() => import('./pages/legal'));
const ContactPage = lazy(() => import('./pages/contact'));
const CartPage = lazy(() => import('./pages/cart'));
const ForgotPasswordPage = lazy(() => import('./pages/hub/forgot-password'));
const ResetPasswordPage = lazy(() => import('./pages/hub/reset-password'));
const ParentDashboardPage = lazy(() => import('./pages/parent-dashboard'));
const DailyChallengePage = lazy(() => import('./pages/daily-challenge'));
const CheckoutSuccess = lazy(() => import('./pages/checkout/success'));
const CheckoutCancel = lazy(() => import('./pages/checkout/cancel'));
const ProdNotFoundPage = lazy(() => import('./pages/_404'));
// Game pages
const NumberPopGame = lazy(() => import('./pages/games/number-pop'));
const NumberPlanetsGame = lazy(() => import('./pages/games/number-planets'));
const StarTrailGame = lazy(() => import('./pages/games/star-trail'));
const ArchieAdventureTrailGame = lazy(() => import('./pages/games/archie-adventure-trail'));
const TimesTableRaceGame = lazy(() => import('./pages/games/times-table-race'));
const FractionPizzaGame = lazy(() => import('./pages/games/fraction-pizza'));
const WordScrambleGame = lazy(() => import('./pages/games/word-scramble'));
const TimesTablesChallengeGame = lazy(() => import('./pages/games/times-tables-challenge'));
const SentenceScrambleGame = lazy(() => import('./pages/games/sentence-scramble'));
const ScienceLabGame = lazy(() => import('./pages/games/science-lab'));
const ShapeSorterGame = lazy(() => import('./pages/games/shape-sorter'));
const WordWizardGame = lazy(() => import('./pages/games/word-wizard'));
const SpellingBeeGame = lazy(() => import('./pages/games/spelling-bee'));
const TrickyWordHuntGame = lazy(() => import('./pages/games/tricky-word-hunt'));
const StoryBuilderGame = lazy(() => import('./pages/games/story-builder'));
const PhonicsParrotGame = lazy(() => import('./pages/games/phonics-parrot'));
const ReadingQuestGame = lazy(() => import('./pages/games/reading-quest'));
const WordSearchGame = lazy(() => import('./pages/games/word-search'));
const CrosswordGame = lazy(() => import('./pages/games/crossword'));
import Header from './layouts/parts/Header';
const SudokuGame = lazy(() => import('./pages/games/sudoku'));
const NumberPuzzleGame = lazy(() => import('./pages/games/number-puzzle'));
const ColourBookGame = lazy(() => import('./pages/games/colour-book'));
const AlphabetExplorerGame = lazy(() => import('./pages/games/alphabet-explorer'));
const TimesTablesReaderGame = lazy(() => import('./pages/games/times-tables-reader'));
const ReviewsPage = lazy(() => import('./pages/reviews'));
const RewardsPage = lazy(() => import('./pages/rewards'));
const VoiceStudioPage = lazy(() => import('./pages/voice-studio'));
const StoryWriterPage = lazy(() => import('./pages/story-writer'));
const ReadingHubPage = lazy(() => import('./pages/games/reading-hub'));
const MathsHubPage = lazy(() => import('./pages/games/maths-hub'));
const SpellingHubPage = lazy(() => import('./pages/games/spelling-hub'));
const NumberBondsGame = lazy(() => import('./pages/games/number-bonds'));
const AnimalHabitatsGame = lazy(() => import('./pages/games/animal-habitats'));
const SentenceBuilderGame = lazy(() => import('./pages/games/sentence-builder'));
const CertificatesPage = lazy(() => import('./pages/certificates'));
const MockExamsPage = lazy(() => import('./pages/mock-exams/index'));
const AdminPortal = lazy(() => import('./pages/admin/AdminPortal'));
const SodafomBotPage = lazy(() => import('./pages/chatbot/SodafomBotPage'));
const AdminPanelPage = lazy(() => import('./pages/admin-panel'));
// Teacher hub: backend dashboard normally; in the local Archie preview these
// entry points lead to the real lesson bank at /teacher (see TeacherHubEntry).
const TeacherHubDashboard = lazy(() => import('./pages/teacher-hub/TeacherHubEntry').then(m => ({ default: m.TeacherHubEntry })));
const TeacherHubLoginPage = lazy(() => import('./pages/teacher-hub/TeacherHubEntry').then(m => ({ default: m.TeacherHubLoginEntry })));
const StudentDetailPage = lazy(() => import('./pages/teacher-hub/TeacherHubEntry').then(m => ({ default: m.TeacherHubStudentEntry })));
const TeacherLessons = lazy(() => import('@/pages/archie/ArchieTeacherClass').then(m => ({ default: m.TeacherLessons })));
const ClassLessons = lazy(() => import('@/pages/archie/ArchieTeacherClass').then(m => ({ default: m.ClassLessons })));
const ProfilePage = lazy(() => import('./pages/hub/profile'));
const HubNotificationsPage = lazy(() => import('./pages/hub/notifications'));
const HubSubscriptionPage = lazy(() => import('./pages/hub/subscription'));
const BlogIndexPage = lazy(() => import('./pages/blog/index'));
const BlogPostPage = lazy(() => import('./pages/blog/[slug]'));
const AboutPage = lazy(() => import('./pages/about'));
const ParentsPage = lazy(() => import('./pages/parents'));
const LeaderboardPage = lazy(() => import('./pages/leaderboard'));
const OnboardingPage = lazy(() => import('./pages/onboarding'));
const ReferralPage = lazy(() => import('./pages/referral'));
const StarBankPage = lazy(() => import('./pages/star-bank'));
const GameOfTheWeekPage = lazy(() => import('./pages/game-of-the-week'));
const HubProgressPage = lazy(() => import('./pages/hub/progress'));
const NotificationsPage = lazy(() => import('./pages/notifications'));
const BadgesPage = lazy(() => import('./pages/badges'));
const BattleHubPage = lazy(() => import('./pages/battle/index'));
const BattleRoomPage = lazy(() => import('./pages/battle/[id]'));
const AnimalKingdomGame = lazy(() => import('./pages/games/animal-kingdom'));
const NatureExplorerGame = lazy(() => import('./pages/games/nature-explorer'));
const GeographyQuizGame = lazy(() => import('./pages/games/geography-quiz'));
const MentalMathsSprintGame = lazy(() => import('./pages/games/mental-maths-sprint'));
const ColourLearnGame = lazy(() => import('./pages/games/colour-learn'));
// Maths games (new)
const OddEvenGame = lazy(() => import('./pages/games/odd-even'));
const PlaceValueGame = lazy(() => import('./pages/games/place-value'));
const MultiplicationGridGame = lazy(() => import('./pages/games/multiplication-grid'));
const DivisionDashGame = lazy(() => import('./pages/games/division-dash'));
const NumberLineGame = lazy(() => import('./pages/games/number-line'));
const MathsMysteryGame = lazy(() => import('./pages/games/maths-mystery'));
const PatternMakerGame = lazy(() => import('./pages/games/pattern-maker'));
const AngleExplorerGame = lazy(() => import('./pages/games/angle-explorer'));
const PerimeterQuestGame = lazy(() => import('./pages/games/perimeter-quest'));
const AreaAdventureGame = lazy(() => import('./pages/games/area-adventure'));
const DataDetectiveGame = lazy(() => import('./pages/games/data-detective'));
const FractionMatchGame = lazy(() => import('./pages/games/fraction-match'));
const SpeedTablesGame = lazy(() => import('./pages/games/speed-tables'));
const RoundingRocketGame = lazy(() => import('./pages/games/rounding-rocket'));
const NegativeNumbersGame = lazy(() => import('./pages/games/negative-numbers'));
const CoordinatesGridGame = lazy(() => import('./pages/games/coordinates-grid'));
const SymmetryStudioGame = lazy(() => import('./pages/games/symmetry-studio'));
const TimeTellerGame = lazy(() => import('./pages/games/time-teller'));
const MathsWordProblemsGame = lazy(() => import('./pages/games/maths-word-problems'));
const OrderingNumbersGame = lazy(() => import('./pages/games/ordering-numbers'));
const MissingNumbersGame = lazy(() => import('./pages/games/missing-numbers'));
const MathsSnapGame = lazy(() => import('./pages/games/maths-snap'));
const RatioRecipeGame = lazy(() => import('./pages/games/ratio-recipe'));
const PrimeNumbersGame = lazy(() => import('./pages/games/prime-numbers'));
const AlgebraQuestGame = lazy(() => import('./pages/games/algebra-quest'));
const MathsChallengeGame = lazy(() => import('./pages/games/maths-challenge'));
const MathsBingoGame = lazy(() => import('./pages/games/maths-bingo'));
const CoinCounterGame = lazy(() => import('./pages/games/coin-counter'));
// Spelling games (new)
const LetterSoundsGame = lazy(() => import('./pages/games/letter-sounds'));
const RhymeTimeGame = lazy(() => import('./pages/games/rhyme-time'));
const SyllableSplitGame = lazy(() => import('./pages/games/syllable-split'));
const PrefixPowerGame = lazy(() => import('./pages/games/prefix-power'));
const SuffixQuestGame = lazy(() => import('./pages/games/suffix-quest'));
const HomophonesGame = lazy(() => import('./pages/games/homophones'));
const CompoundWordsGame = lazy(() => import('./pages/games/compound-words'));
const SpellingChallengeGame = lazy(() => import('./pages/games/spelling-challenge'));
const WordFamiliesGame = lazy(() => import('./pages/games/word-families'));
const MissingLettersGame = lazy(() => import('./pages/games/missing-letters'));
const AnagramAttackGame = lazy(() => import('./pages/games/anagram-attack'));
const SilentLettersGame = lazy(() => import('./pages/games/silent-letters'));
const DoubleLettersGame = lazy(() => import('./pages/games/double-letters'));
const VowelSoundsGame = lazy(() => import('./pages/games/vowel-sounds'));
const SpellingSnapGame = lazy(() => import('./pages/games/spelling-snap'));
const WordBuilderGame = lazy(() => import('./pages/games/word-builder'));
const DictionaryDashGame = lazy(() => import('./pages/games/dictionary-dash'));
const ContractionStationGame = lazy(() => import('./pages/games/contraction-station'));
const PluralRulesGame = lazy(() => import('./pages/games/plural-rules'));
const WordMatchGame = lazy(() => import('./pages/games/word-match'));
const SpellingRaceGame = lazy(() => import('./pages/games/spelling-race'));
// Reading games (new)
const ComprehensionQuestGame = lazy(() => import('./pages/games/comprehension-quest'));
const StorySequenceGame = lazy(() => import('./pages/games/story-sequence'));
const ReadingDetectiveGame = lazy(() => import('./pages/games/reading-detective'));
const PunctuationPatrolGame = lazy(() => import('./pages/games/punctuation-patrol'));
const MoneyMathsGame = lazy(() => import('./pages/games/money-maths'));
const PartsOfSpeechGame = lazy(() => import('./pages/games/parts-of-speech'));
const TellingTimeGame = lazy(() => import('./pages/games/telling-time'));
const GeographyUKGame = lazy(() => import('./pages/games/geography-uk'));
const SynonymsAntonymsGame = lazy(() => import('./pages/games/synonyms-antonyms'));
const GrammarGarageGame = lazy(() => import('./pages/games/grammar-garage'));
const NounSpotterGame = lazy(() => import('./pages/games/noun-spotter'));
const VerbVolcanoGame = lazy(() => import('./pages/games/verb-volcano'));
const AdjectiveAdventureGame = lazy(() => import('./pages/games/adjective-adventure'));
const SynonymSwapGame = lazy(() => import('./pages/games/synonym-swap'));
const AntonymArenaGame = lazy(() => import('./pages/games/antonym-arena'));
const ReadingSpeedGame = lazy(() => import('./pages/games/reading-speed'));
const PoetryCornerGame = lazy(() => import('./pages/games/poetry-corner'));
const TextTypesGame = lazy(() => import('./pages/games/text-types'));
const ReadingMapGame = lazy(() => import('./pages/games/reading-map'));
const WordMeaningGame = lazy(() => import('./pages/games/word-meaning'));
const SpeechMarksGame = lazy(() => import('./pages/games/speech-marks'));
const ConnectivesBridgeGame = lazy(() => import('./pages/games/connectives-bridge'));
const ReadingFluencyGame = lazy(() => import('./pages/games/reading-fluency'));
const BookReviewGame = lazy(() => import('./pages/games/book-review'));
const ReadingBingoGame = lazy(() => import('./pages/games/reading-bingo'));
const StoryMapGame = lazy(() => import('./pages/games/story-map'));
const ReadingChallengeGame = lazy(() => import('./pages/games/reading-challenge'));
// Science games (new)
const HumanBodyGame = lazy(() => import('./pages/games/human-body'));
const SolarSystemGame = lazy(() => import('./pages/games/solar-system'));
const FoodChainsGame = lazy(() => import('./pages/games/food-chains'));
const StatesOfMatterGame = lazy(() => import('./pages/games/states-of-matter'));
const ForcesLabGame = lazy(() => import('./pages/games/forces-lab'));
const ElectricityCircuitGame = lazy(() => import('./pages/games/electricity-circuit'));
const PlantPartsGame = lazy(() => import('./pages/games/plant-parts'));
const LifeCyclesGame = lazy(() => import('./pages/games/life-cycles'));
const WeatherWatchGame = lazy(() => import('./pages/games/weather-watch'));
const RockDetectiveGame = lazy(() => import('./pages/games/rock-detective'));
const LightShadowsGame = lazy(() => import('./pages/games/light-shadows'));
const SoundScienceGame = lazy(() => import('./pages/games/sound-science'));
const MaterialsSortGame = lazy(() => import('./pages/games/materials-sort'));
const SkeletonBuilderGame = lazy(() => import('./pages/games/skeleton-builder'));
const HealthyEatingGame = lazy(() => import('./pages/games/healthy-eating'));
const MicrohabitatsGame = lazy(() => import('./pages/games/microhabitats'));
const MagnetsMagicGame = lazy(() => import('./pages/games/magnets-magic'));
const WaterCycleGame = lazy(() => import('./pages/games/water-cycle'));
const ClassificationKeysGame = lazy(() => import('./pages/games/classification-keys'));
const EarthSpaceGame = lazy(() => import('./pages/games/earth-space'));
const EvolutionExplorerGame = lazy(() => import('./pages/games/evolution-explorer'));
const ScienceQuizGame = lazy(() => import('./pages/games/science-quiz'));
const BackToSchoolShopPage = lazy(() => import('./pages/shop/back-to-school'));
const ChatbotPage = lazy(() => import('./pages/chatbot/ChatbotPage'));
const NotFoundPage = ProdNotFoundPage;
export const routes: RouteObject[] = [
  { path: '/world', element: <ArchieWorld /> },
  { path: '/artwork', element: <ArchieArtworkGallery /> },
  { path: '/time-lab', element: <ArchieClockLab /> },
  { path: '/preview-admin', element: <ArchiePreviewAdmin /> },
  { path: '/quests', element: <ArchieQuests /> },
  { path: '/privacy', element: <ArchiePrivacy /> },
  { path: '/courses', element: <ArchieCourses /> },
  { path: '/courses/:lessonId', element: <ArchieCourses /> },
  { path: '/teacher', element: <TeacherLessons /> },
  { path: '/class', element: <ClassLessons /> },
  { path: '/lesson', element: <ArchieLesson /> },
  { path: '/library', element: <ArchieLibrary /> },
  { path: '/reader/:bookId', element: <ArchieReader /> },
  { path: '/homework', element: <ArchieHomework /> },
  { path: '/stickers', element: <ArchieRewards stickers /> },
  { path: '/progress', element: <ArchieRewards progress /> },
  { path: '/settings', element: <ArchieParents settingsOnly /> },
  { path: '/classic-adventure', element: <SodafomAdventurePage /> },
{
  path: '/',
  element: <ArchieHome />
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
  element: <ArchieGames />,
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
  path: '/games/number-planets',
  element: <NumberPlanetsGame />
}, {
  path: '/games/star-trail',
  element: <StarTrailGame />
}, {
  path: '/games/archie-adventure-trail',
  element: <ArchieAdventureTrailGame />
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
  element: <ArchieRewards />,
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
  element: <ArchieParents />
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
  element: <ArchieCartoons />
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
  element: <ArchieAskRoute />
}, {
  // Legacy /chat alias — redirects to /ask-archie
  path: '/chat',
  element: <ArchieAskRoute />
}, {
  path: '*',
  // Broken/legacy links must never strand a child on a 404 screen.
  // Send unknown in-app routes back to the safe home screen instead.
  element: <Navigate to="/" replace />
}];
export type Path = '/' | '/subjects' | '/games' | '/pricing' | '/hub' | '/hub/login' | '/hub/signup';
export type Params = Record<string, string | undefined>;
