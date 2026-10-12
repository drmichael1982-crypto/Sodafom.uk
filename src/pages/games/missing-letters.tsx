import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'c_t (cat)', options: ['a','e','i','o'], answer: 'a' },
  { question: 'd_g (dog)', options: ['a','e','o','u'], answer: 'o' },
  { question: 'b_g (bag)', options: ['a','e','i','o'], answer: 'a' },
  { question: 'p_n (pen)', options: ['a','e','i','o'], answer: 'e' },
  { question: 'b_s (bus)', options: ['a','e','o','u'], answer: 'u' },
  { question: 'h_t (hat)', options: ['a','e','i','o'], answer: 'a' },
  { question: 's_t (sit)', options: ['a','e','i','o'], answer: 'i' },
  { question: 'c_p (cup)', options: ['a','e','o','u'], answer: 'u' },
  { question: 'b_d (bed)', options: ['a','e','i','o'], answer: 'e' },
  { question: 'f_x (fox)', options: ['a','e','o','u'], answer: 'o' },
  { question: 'p_g (pig)', options: ['a','e','i','o'], answer: 'i' },
  { question: 'r_n (run)', options: ['a','e','o','u'], answer: 'u' },
];
const L2: QuizQuestion[] = [
  { question: 'fr_end (friend)', options: ['a','i','o','u'], answer: 'i' },
  { question: 'bec_use (because)', options: ['a','e','i','o'], answer: 'a' },
  { question: 'sch_ol (school)', options: ['a','e','o','u'], answer: 'o' },
  { question: 'kn_w (know)', options: ['a','e','o','u'], answer: 'o' },
  { question: 'wh_le (whole)', options: ['a','e','i','o'], answer: 'o' },
  { question: 'p_ople (people)', options: ['a','e','i','o'], answer: 'e' },
  { question: 'beau_iful (beautiful)', options: ['t','d','f','s'], answer: 't' },
  { question: 'nec_ssary (necessary)', options: ['a','e','i','o'], answer: 'e' },
  { question: 'sep_rate (separate)', options: ['a','e','i','o'], answer: 'a' },
  { question: 'def_nitely (definitely)', options: ['a','e','i','o'], answer: 'i' },
  { question: 'env_ronment (environment)', options: ['a','e','i','o'], answer: 'i' },
  { question: 'gov_rnment (government)', options: ['a','e','i','o'], answer: 'e' },
];
const L3: QuizQuestion[] = [
  { question: 'acc_mmodate (accommodate)', options: ['a','e','o','u'], answer: 'o' },
  { question: 'ach_evement (achievement)', options: ['a','e','i','o'], answer: 'i' },
  { question: 'agg_essive (aggressive)', options: ['a','e','i','r'], answer: 'r' },
  { question: 'app_rent (apparent)', options: ['a','e','i','o'], answer: 'a' },
  { question: 'comm_ttee (committee)', options: ['a','e','i','o'], answer: 'i' },
  { question: 'consci_ntious (conscientious)', options: ['a','e','i','o'], answer: 'e' },
  { question: 'emb_rrassment (embarrassment)', options: ['a','e','i','o'], answer: 'a' },
  { question: 'exagg_rate (exaggerate)', options: ['a','e','i','o'], answer: 'e' },
  { question: 'harass_ent (harassment)', options: ['a','e','i','m'], answer: 'm' },
  { question: 'independ_nt (independent)', options: ['a','e','i','o'], answer: 'e' },
  { question: 'milli_nnium (millennium)', options: ['a','e','i','o'], answer: 'e' },
  { question: 'occ_sionally (occasionally)', options: ['a','e','i','o'], answer: 'a' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'missing-letters',
  title: 'Missing Letters',
  emoji: '🔡',
  subject: 'spelling',
  ageGroups: ['5–7', '8–10', '11–13'],
  description: 'Fill in the missing letter to complete each word. Can you spot the gap?',
  accentClass: 'bg-secondary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
