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
  { question: 'Unscramble: ELPEP (people)', options: ['people','peepl','pepel','peple'], answer: 'people' },
  { question: 'Unscramble: EATRH (the planet)', options: ['earth','heart','hater','rathe'], answer: 'earth' },
  { question: 'Unscramble: RETAW (H₂O)', options: ['water','tawer','wrate','rawet'], answer: 'water' },
  { question: 'Unscramble: OUSHE (a building)', options: ['house','shove','hoves','ohesu'], answer: 'house' },
  { question: 'Unscramble: TNPLA (it grows)', options: ['plant','plnat','panlt','tplan'], answer: 'plant' },
  { question: 'Unscramble: IRCLE (a round shape)', options: ['circle','clire','irlce','recil'], answer: 'circle' },
  { question: 'Unscramble: RNEAT (to learn)', options: ['earnt','learn','reant','trane'], answer: 'earnt' },
  { question: 'Unscramble: SEATL (not early)', options: ['least','steal','tales','slate'], answer: 'least' },
];
const L3: QuizQuestion[] = [
  { question: 'Unscramble: IELST (a place to sleep)', options: ['islet','tiles','stile','lites'], answer: 'islet' },
  { question: 'Unscramble: EART (4 possible answers)', options: ['rate','tear','tare','all of these'], answer: 'all of these' },
  { question: 'Unscramble: ODWL', options: ['wold','word','wild','dowl'], answer: 'wold' },
  { question: 'Unscramble: TNEILS (to hear)', options: ['listen','silent','tinsel','enlist'], answer: 'listen' },
  { question: 'Unscramble: RNAEGL (a country)', options: ['England','langer','glaner','nregal'], answer: 'England' },
  { question: 'Unscramble: AERTCEH (in school)', options: ['teacher','cheater','treache','hectare'], answer: 'teacher' },
  { question: 'Unscramble: RNBDEA (a flag)', options: ['banner','bander','braned','ranbed'], answer: 'banner' },
  { question: 'Unscramble: ELTAB (furniture)', options: ['table','bleat','blate','tabel'], answer: 'table' },
  { question: 'Unscramble: NRPTI (to make copies)', options: ['print','tprin','pinrt','rnpit'], answer: 'print' },
  { question: 'Unscramble: LBCAK (a colour)', options: ['black','blcak','bcalk','klacb'], answer: 'black' },
  { question: 'Unscramble: HTWI (together)', options: ['with','whit','twhi','itwh'], answer: 'with' },
  { question: 'Unscramble: RNFOT (the front)', options: ['front','ftnor','rnoft','tronf'], answer: 'front' },
];
const L4: QuizQuestion[] = [
  { question: 'Unscramble: AEPRST (to separate)', options: ['repost','repast','tapers','drapes'], answer: 'repast' },
  { question: 'Unscramble: LAERTS (to change)', options: ['alters','alerts','stelar','restal'], answer: 'alters' },
  { question: 'Unscramble: SRTEA (a feeling)', options: ['tears','stare','rates','aster'], answer: 'tears' },
  { question: 'Unscramble: AELRN (to study)', options: ['learn','renal','laner','earln'], answer: 'learn' },
  { question: 'Unscramble: IESRP (a cost)', options: ['price','spire','prise','ripes'], answer: 'price' },
  { question: 'Unscramble: TNEAM (intended)', options: ['meant','ament','mante','etnam'], answer: 'meant' },
  { question: 'Unscramble: RNPIG (spring season)', options: ['spring','pring','grpin','nrpig'], answer: 'spring' },
  { question: 'Unscramble: AEPRS (to save)', options: ['spare','reaps','pears','rapes'], answer: 'spare' },
  { question: 'Unscramble: TRSAE (to look hard)', options: ['stare','tears','rates','aster'], answer: 'stare' },
  { question: 'Unscramble: EALRG (big)', options: ['large','glare','lager','regal'], answer: 'large' },
  { question: 'Unscramble: RNPTI (to make copies)', options: ['print','tprin','pinrt','rnpit'], answer: 'print' },
  { question: 'Unscramble: AELRST (to change)', options: ['alters','alerts','stelar','restal'], answer: 'alters' },
];
const L5: QuizQuestion[] = [
  { question: 'Unscramble: AEPRST (to separate)', options: ['repost','repast','tapers','drapes'], answer: 'repast' },
  { question: 'Unscramble: AELRST (to change)', options: ['alters','alerts','stelar','restal'], answer: 'alters' },
  { question: 'Unscramble: AEPRST (to separate)', options: ['repost','repast','tapers','drapes'], answer: 'repast' },
  { question: 'Unscramble: AEIMRST (a sailor)', options: ['maestri','semitar','imarets','smartie'], answer: 'smartie' },
  { question: 'Unscramble: AEPRSTU (a meadow)', options: ['pasture','uprates','repaust','tapeurs'], answer: 'pasture' },
  { question: 'Unscramble: AELMNST (a feeling)', options: ['laments','mantles','stamen','alment'], answer: 'laments' },
  { question: 'Unscramble: AEINRST (a country)', options: ['nastier','retains','retsina','stainer'], answer: 'retains' },
  { question: 'Unscramble: AELPRST (to plaster)', options: ['plaster','psalter','stapler','replats'], answer: 'plaster' },
  { question: 'Unscramble: AEINRSTU (a country)', options: ['urinates','ruinates','trainuse','austrine'], answer: 'urinates' },
  { question: 'Unscramble: AELMNRST (a monster)', options: ['entralms','sternmal','entralms','entralms'], answer: 'entralms' },
  { question: 'Unscramble: AELMNRSTU (a monster)', options: ['entralmus','sternmalu','entralmus','entralmus'], answer: 'entralmus' },
  { question: 'Unscramble: AELMNRSTUV (a monster)', options: ['entralmusv','sternmaluv','entralmusv','entralmusv'], answer: 'entralmusv' },
];

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
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-secondary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
