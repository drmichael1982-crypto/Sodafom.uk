import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What does "big" mean?', options: ['small','large','fast','quiet'], answer: 'large' },
  { question: 'What does "happy" mean?', options: ['sad','angry','joyful','tired'], answer: 'joyful' },
  { question: 'What does "fast" mean?', options: ['slow','quiet','quick','heavy'], answer: 'quick' },
  { question: 'What does "cold" mean?', options: ['warm','hot','chilly','bright'], answer: 'chilly' },
  { question: 'What does "brave" mean?', options: ['cowardly','fearful','courageous','timid'], answer: 'courageous' },
  { question: 'What does "angry" mean?', options: ['calm','furious','happy','tired'], answer: 'furious' },
  { question: 'What does "tired" mean?', options: ['energetic','exhausted','lively','active'], answer: 'exhausted' },
  { question: 'What does "strange" mean?', options: ['normal','ordinary','peculiar','usual'], answer: 'peculiar' },
  { question: 'What does "old" mean?', options: ['new','modern','ancient','fresh'], answer: 'ancient' },
  { question: 'What does "begin" mean?', options: ['end','finish','stop','start'], answer: 'start' },
  { question: 'What does "walk" mean?', options: ['fly','swim','stroll','jump'], answer: 'stroll' },
  { question: 'What does "smart" mean?', options: ['foolish','clever','slow','careless'], answer: 'clever' },
];
const L2: QuizQuestion[] = [
  { question: 'What does "benevolent" mean?', options: ['cruel','kind and generous','sad','angry'], answer: 'kind and generous' },
  { question: 'What does "melancholy" mean?', options: ['very happy','very angry','a feeling of sadness','very excited'], answer: 'a feeling of sadness' },
  { question: 'What does "tenacious" mean?', options: ['giving up easily','holding on firmly, determined','very fast','very quiet'], answer: 'holding on firmly, determined' },
  { question: 'What does "ambivalent" mean?', options: ['very certain','having mixed feelings','very happy','very angry'], answer: 'having mixed feelings' },
  { question: 'What does "eloquent" mean?', options: ['speaking poorly','speaking fluently and persuasively','silent','confused'], answer: 'speaking fluently and persuasively' },
  { question: 'What does "diligent" mean?', options: ['lazy','careless','hardworking and careful','fast'], answer: 'hardworking and careful' },
  { question: 'What does "serene" mean?', options: ['noisy','calm and peaceful','busy','angry'], answer: 'calm and peaceful' },
  { question: 'What does "audacious" mean?', options: ['timid','bold and daring','quiet','careful'], answer: 'bold and daring' },
  { question: 'What does "meticulous" mean?', options: ['careless','very careful and precise','fast','loud'], answer: 'very careful and precise' },
  { question: 'What does "resilient" mean?', options: ['easily broken','able to recover quickly from difficulties','very strong','very fast'], answer: 'able to recover quickly from difficulties' },
  { question: 'What does "verbose" mean?', options: ['concise','using too many words','silent','confused'], answer: 'using too many words' },
  { question: 'What does "frugal" mean?', options: ['extravagant','wasteful','careful with money','generous'], answer: 'careful with money' },
];
const L3: QuizQuestion[] = [
  { question: 'What does "ephemeral" mean?', options: ['permanent','lasting forever','lasting only a short time','very large'], answer: 'lasting only a short time' },
  { question: 'What does "obsequious" mean?', options: ['rude','excessively eager to please','independent','confident'], answer: 'excessively eager to please' },
  { question: 'What does "perspicacious" mean?', options: ['confused','having a ready insight into things','careless','slow'], answer: 'having a ready insight into things' },
  { question: 'What does "equivocal" mean?', options: ['clear and definite','open to more than one interpretation','very loud','very quiet'], answer: 'open to more than one interpretation' },
  { question: 'What does "magnanimous" mean?', options: ['petty','generous and forgiving','angry','selfish'], answer: 'generous and forgiving' },
  { question: 'What does "sycophantic" mean?', options: ['independent','excessively flattering to gain favour','honest','critical'], answer: 'excessively flattering to gain favour' },
  { question: 'What does "perfidious" mean?', options: ['loyal','trustworthy','deceitful and untrustworthy','honest'], answer: 'deceitful and untrustworthy' },
  { question: 'What does "recalcitrant" mean?', options: ['obedient','cooperative','stubbornly resistant to authority','helpful'], answer: 'stubbornly resistant to authority' },
  { question: 'What does "loquacious" mean?', options: ['silent','very talkative','thoughtful','careful'], answer: 'very talkative' },
  { question: 'What does "inimical" mean?', options: ['friendly','helpful','hostile and harmful','neutral'], answer: 'hostile and harmful' },
  { question: 'What does "pellucid" mean?', options: ['murky','translucently clear','dark','confusing'], answer: 'translucently clear' },
  { question: 'What does "pusillanimous" mean?', options: ['brave','bold','showing a lack of courage','determined'], answer: 'showing a lack of courage' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'word-meaning',
  title: 'Word Meaning',
  emoji: '💡',
  subject: 'reading',
  ageGroups: ['8–10', '11–13'],
  description: 'Learn the meaning of ambitious vocabulary words. Expand your word power!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
