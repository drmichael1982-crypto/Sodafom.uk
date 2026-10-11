import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Unscramble: TAC', options: ['cat','bat','hat','mat'], answer: 'cat' },
  { question: 'Unscramble: GOD', options: ['dog','log','fog','bog'], answer: 'dog' },
  { question: 'Unscramble: PCA', options: ['cap','map','tap','nap'], answer: 'cap' },
  { question: 'Unscramble: NUS', options: ['sun','bun','fun','run'], answer: 'sun' },
  { question: 'Unscramble: GEB', options: ['beg','leg','peg','keg'], answer: 'beg' },
  { question: 'Unscramble: TPA', options: ['pat','bat','cat','rat'], answer: 'pat' },
  { question: 'Unscramble: PIT', options: ['tip','dip','hip','lip'], answer: 'tip' },
  { question: 'Unscramble: OTP', options: ['pot','dot','hot','lot'], answer: 'pot' },
  { question: 'Unscramble: NUB', options: ['bun','fun','gun','run'], answer: 'bun' },
  { question: 'Unscramble: WEB', options: ['web','bed','red','fed'], answer: 'web' },
  { question: 'Unscramble: GIP', options: ['pig','big','dig','fig'], answer: 'pig' },
  { question: 'Unscramble: NHE', options: ['hen','ten','pen','men'], answer: 'hen' },
];
const L2: QuizQuestion[] = [
  { question: 'Unscramble: ELPPA (a fruit)', options: ['apple','papel','appel','lapep'], answer: 'apple' },
  { question: 'Unscramble: OOLSCH (a place to learn)', options: ['school','scohol','shoocl','scoohl'], answer: 'school' },
  { question: 'Unscramble: DRIFNE (someone you like)', options: ['friend','finder','fridge','fender'], answer: 'friend' },
  { question: 'Unscramble: TNHIG (opposite of day)', options: ['night','thing','tying','hting'], answer: 'night' },
  { question: 'Unscramble: POEPEL (more than one person)', options: ['people','pepper','purple','pencil'], answer: 'people' },
  { question: 'Unscramble: EATRH (the planet)', options: ['earth','heart','hater','rathe'], answer: 'earth' },
  { question: 'Unscramble: RETAW (H₂O)', options: ['water','tawer','wrate','rawet'], answer: 'water' },
  { question: 'Unscramble: OUSHE (a building)', options: ['house','shove','hoves','ohesu'], answer: 'house' },
  { question: 'Unscramble: TNPLA (it grows)', options: ['plant','plnat','panlt','tplan'], answer: 'plant' },
  { question: 'Unscramble: CEIRCL (a round shape)', options: ['circle','cereal','centre','curling'], answer: 'circle' },
  { question: 'Unscramble: AELNR (to gain knowledge)', options: ['learn','later','clear','nearby'], answer: 'learn' },
  { question: 'Unscramble: AELT (not early)', options: ['late','tale','teal','deal'], answer: 'late' },
];
const L3: QuizQuestion[] = [
  { question: 'Unscramble: WILLOP (you rest your head on it)', options: ['pillow','willow','follow','yellow'], answer: 'pillow' },
  { question: 'Unscramble: EART (to rip)', options: ['tear','rate','tare','earn'], answer: 'tear' },
  { question: 'Unscramble: DORW (a unit of language)', options: ['word','world','work','wore'], answer: 'word' },
  { question: 'Unscramble: TNEILS (to hear)', options: ['listen','silent','tinsel','enlist'], answer: 'listen' },
  { question: 'Unscramble: LADNGEN (a country in the UK)', options: ['England','Ireland','Iceland','Finland'], answer: 'England' },
  { question: 'Unscramble: AERTCEH (in school)', options: ['teacher','cheater','treache','hectare'], answer: 'teacher' },
  { question: 'Unscramble: ABNNER (a flag or sign)', options: ['banner','branch','border','button'], answer: 'banner' },
  { question: 'Unscramble: ELTAB (furniture)', options: ['table','bleat','blate','tabel'], answer: 'table' },
  { question: 'Unscramble: NRPTI (to make copies)', options: ['print','tprin','pinrt','rnpit'], answer: 'print' },
  { question: 'Unscramble: LBCAK (a colour)', options: ['black','blcak','bcalk','klacb'], answer: 'black' },
  { question: 'Unscramble: HTWI (together)', options: ['with','whit','twhi','itwh'], answer: 'with' },
  { question: 'Unscramble: RNFOT (the front)', options: ['front','ftnor','rnoft','tronf'], answer: 'front' },
];
const L4: QuizQuestion[] = [
  { question: 'Unscramble: AEPRSTAE (to divide or keep apart)', options: ['separate','operate','prepare','repeat'], answer: 'separate' },
  { question: 'Unscramble: LAERTS (to change)', options: ['alters','alerts','stelar','restal'], answer: 'alters' },
  { question: 'Unscramble: SRTEA (a feeling)', options: ['tears','stare','rates','aster'], answer: 'tears' },
  { question: 'Unscramble: AELRN (to study)', options: ['learn','renal','laner','earln'], answer: 'learn' },
  { question: 'Unscramble: CIRPE (a cost)', options: ['price','piece','prize','press'], answer: 'price' },
  { question: 'Unscramble: TNEAM (intended)', options: ['meant','ament','mante','etnam'], answer: 'meant' },
  { question: 'Unscramble: RSPING (the season after winter)', options: ['spring','string','sprint','singer'], answer: 'spring' },
  { question: 'Unscramble: AEPRS (to save)', options: ['spare','reaps','pears','rapes'], answer: 'spare' },
  { question: 'Unscramble: TRSAE (to look hard)', options: ['stare','tears','rates','aster'], answer: 'stare' },
  { question: 'Unscramble: EALRG (big)', options: ['large','glare','lager','regal'], answer: 'large' },
  { question: 'Unscramble: OBRSVEE (to watch carefully)', options: ['observe','reserve','deserve','reverse'], answer: 'observe' },
  { question: 'Unscramble: GNAHCE (to make different)', options: ['change','chance','chain','charge'], answer: 'change' },
];
const L5: QuizQuestion[] = [
  { question: 'Unscramble: SILYSANA (a careful study of information)', options: ['analysis','analogy','answer','accuracy'], answer: 'analysis' },
  { question: 'Unscramble: MOONSTARER (a scientist who studies space)', options: ['astronomer','researcher','navigator','meteorologist'], answer: 'astronomer' },
  { question: 'Unscramble: ACIDTIRONY (a book that explains word meanings)', options: ['dictionary','directory','documentary','vocabulary'], answer: 'dictionary' },
  { question: 'Unscramble: UPREADSE (to convince someone)', options: ['persuade','preserve','prepare','pursue'], answer: 'persuade' },
  { question: 'Unscramble: CLUECATAL (to work out using numbers)', options: ['calculate','calibrate','collect','translate'], answer: 'calculate' },
  { question: 'Unscramble: HOTPOGRAPH (a picture made with a camera)', options: ['photograph','paragraph','autograph','graphite'], answer: 'photograph' },
  { question: 'Unscramble: PREMATUREET (a measure of how hot or cold something is)', options: ['temperature','measurement','thermometer','atmosphere'], answer: 'temperature' },
  { question: 'Unscramble: MOVERNGETN (the group that runs a country)', options: ['government','movement','agreement','department'], answer: 'government' },
  { question: 'Unscramble: QUAKERTHEA (a sudden shaking of the ground)', options: ['earthquake','aftershock','landslide','eruption'], answer: 'earthquake' },
  { question: 'Unscramble: BRACELETE (to mark a happy occasion)', options: ['celebrate','decorate','remember','congratulate'], answer: 'celebrate' },
  { question: 'Unscramble: VUNREADTE (an exciting experience)', options: ['adventure','departure','discovery','journey'], answer: 'adventure' },
  { question: 'Unscramble: GLOWKNEDE (facts and understanding)', options: ['knowledge','learning','evidence','wisdom'], answer: 'knowledge' },
];

export const ANAGRAM_QUESTION_BANKS = [L1, L2, L3, L4, L5];

export default function AnagramAttack() {
  return (
    <>
      <Helmet>
        <title>Anagram Attack — Sodafom</title>
        <meta name="description" content="Unscramble the letters to find the hidden word. Anagram puzzles for all ages!" />
        <link rel="canonical" href="https://sodafom.uk/games/anagram-attack" />
        <meta property="og:title" content="Anagram Attack — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Anagram Attack — Spelling Game for Kids — Sodafom</h1>
      <GameShell title="Anagram Attack" emoji="🔀" subject="spelling" ageGroups={['8–10', '11–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="anagram-attack"
            title="Anagram Attack"
            emoji="🔀"
            questionsByLevel={ANAGRAM_QUESTION_BANKS}
            accentClass="bg-secondary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
