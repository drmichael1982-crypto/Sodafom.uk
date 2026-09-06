import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the plural of "cat"?', options: ['cats','cates','caties','cat'], answer: 'cats' },
  { question: 'What is the plural of "dog"?', options: ['dogs','doges','dogies','dog'], answer: 'dogs' },
  { question: 'What is the plural of "box"?', options: ['boxes','boxs','boxies','box'], answer: 'boxes' },
  { question: 'What is the plural of "bus"?', options: ['buses','buss','busies','bus'], answer: 'buses' },
  { question: 'What is the plural of "dish"?', options: ['dishes','dishs','dishies','dish'], answer: 'dishes' },
  { question: 'What is the plural of "church"?', options: ['churches','churchs','churchies','church'], answer: 'churches' },
  { question: 'What is the plural of "baby"?', options: ['babies','babys','babyies','baby'], answer: 'babies' },
  { question: 'What is the plural of "city"?', options: ['cities','citys','cityies','city'], answer: 'cities' },
  { question: 'What is the plural of "leaf"?', options: ['leaves','leafs','leafies','leaf'], answer: 'leaves' },
  { question: 'What is the plural of "wolf"?', options: ['wolves','wolfs','wolfies','wolf'], answer: 'wolves' },
  { question: 'What is the plural of "knife"?', options: ['knives','knifes','knifeies','knife'], answer: 'knives' },
  { question: 'What is the plural of "life"?', options: ['lives','lifes','lifeies','life'], answer: 'lives' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the plural of "child"?', options: ['children','childs','childes','childies'], answer: 'children' },
  { question: 'What is the plural of "man"?', options: ['men','mans','manes','manies'], answer: 'men' },
  { question: 'What is the plural of "woman"?', options: ['women','womans','womanes','womanies'], answer: 'women' },
  { question: 'What is the plural of "tooth"?', options: ['teeth','tooths','toothes','toothies'], answer: 'teeth' },
  { question: 'What is the plural of "foot"?', options: ['feet','foots','footes','footies'], answer: 'feet' },
  { question: 'What is the plural of "mouse"?', options: ['mice','mouses','mousies','mices'], answer: 'mice' },
  { question: 'What is the plural of "goose"?', options: ['geese','gooses','goosies','geeses'], answer: 'geese' },
  { question: 'What is the plural of "ox"?', options: ['oxen','oxes','oxies','oxs'], answer: 'oxen' },
  { question: 'What is the plural of "sheep"?', options: ['sheep','sheeps','sheepies','sheepen'], answer: 'sheep' },
  { question: 'What is the plural of "deer"?', options: ['deer','deers','deeries','deeren'], answer: 'deer' },
  { question: 'What is the plural of "fish"?', options: ['fish','fishes','fishies','fishen'], answer: 'fish' },
  { question: 'What is the plural of "series"?', options: ['series','seriess','seriesies','seriesen'], answer: 'series' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the plural of "criterion"?', options: ['criteria','criterions','criterias','criteriones'], answer: 'criteria' },
  { question: 'What is the plural of "phenomenon"?', options: ['phenomena','phenomenons','phenomenas','phenomenones'], answer: 'phenomena' },
  { question: 'What is the plural of "datum"?', options: ['data','datums','datas','datumes'], answer: 'data' },
  { question: 'What is the plural of "medium"?', options: ['media','mediums','medias','mediumes'], answer: 'media' },
  { question: 'What is the plural of "cactus"?', options: ['cacti','cactuses','cactis','cactuses'], answer: 'cacti' },
  { question: 'What is the plural of "focus"?', options: ['foci','focuses','focis','focuses'], answer: 'foci' },
  { question: 'What is the plural of "nucleus"?', options: ['nuclei','nucleuses','nucleis','nucleuses'], answer: 'nuclei' },
  { question: 'What is the plural of "radius"?', options: ['radii','radiuses','radiis','radiuses'], answer: 'radii' },
  { question: 'What is the plural of "analysis"?', options: ['analyses','analysiss','analysises','analysies'], answer: 'analyses' },
  { question: 'What is the plural of "crisis"?', options: ['crises','crisiss','crisises','crisies'], answer: 'crises' },
  { question: 'What is the plural of "thesis"?', options: ['theses','thesiss','thesises','thesies'], answer: 'theses' },
  { question: 'What is the plural of "index"?', options: ['indices','indexes','indexs','indexies'], answer: 'indices' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'plural-rules',
  title: 'Plural Rules',
  emoji: '📚',
  subject: 'spelling',
  ageGroups: ['6–8', '9–11'],
  description: 'Master the rules for making words plural — regular and irregular!',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
