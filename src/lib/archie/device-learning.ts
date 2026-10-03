/**
 * Offline Archie learning memory.
 * Bundled historical notes answer common questions without a network. All
 * question/answer pairs are held only in this browser profile and can be cleared.
 */
export type SavedLearningTurn = { question: string; answer: string; age: number; savedAt: string };
const KEY = 'sodafom_archie_learning_v1';
const MAX_TURNS = 120;

const HISTORY = [
  { keys: ['christopher columbus', 'columbus'], ages: [5, 6, 7], answer: 'Christopher Columbus was a sailor from Genoa, in present-day Italy. In 1492, he sailed west across the Atlantic with support from the Spanish Crown. He reached islands in the Caribbean, where Indigenous peoples already lived. He did not discover an empty continent: the Americas had long histories and many communities. His voyages began a lasting period of European colonisation and profound harm to Indigenous peoples.' },
  { keys: ['christopher columbus', 'columbus'], ages: [8, 9, 10], answer: 'Christopher Columbus was a Genoese sailor whose 1492 Atlantic voyage was funded by the Spanish Crown. He reached Caribbean islands already inhabited by Indigenous peoples, including Taíno communities. His voyages connected Europe and the Americas more regularly, but also helped begin European colonisation, enslavement and devastating disease impacts. Calling this simply “discovering America” leaves out the people already living there.' },
  { keys: ['christopher columbus', 'columbus'], ages: [11, 12, 13], answer: 'Christopher Columbus (probably born in Genoa around 1451) crossed the Atlantic in 1492 under the Spanish Crown and reached the Caribbean. The Americas were not “discovered” in the sense of being unknown or uninhabited: Indigenous societies had lived there for millennia. Columbus’s voyages initiated sustained European colonisation, associated with dispossession, forced labour, enslavement and disease. Historians examine both the changing global connections and their unequal human consequences.' },
  { keys: ['jesus', 'jesus christ', 'christianity'], ages: [5, 6, 7], answer: 'Jesus is central to Christianity. Christians believe he is the Son of God and that he rose from the dead. Historians generally place his life in the first century CE, in the region of Judea. People from different religions and beliefs understand Jesus in different ways. Would you like to learn about his life, the Roman world, or the timeline?' },
  { keys: ['jesus', 'jesus christ', 'christianity'], ages: [8, 9, 10, 11, 12, 13], answer: 'Jesus of Nazareth was a Jewish teacher who lived in the first century CE under Roman rule. The exact dates of his birth are uncertain; historians often place it a few years before 1 CE, and his death around 30 CE. Christians believe Jesus is the Messiah and that he rose from the dead; other faiths and non-religious historians describe him differently. We can explore the historical evidence and religious beliefs separately.' },
  { keys: ['history timeline', 'timeline', 'present day', 'today'], ages: [5, 6, 7], answer: 'Here is a big timeline: Prehistory (before written records); ancient civilisations; the Roman Empire; the Middle Ages; the early modern period; the Industrial Revolution; and modern history, including the world today. People lived all over the world in every period. Which part would you like to explore?' },
  { keys: ['history timeline', 'timeline', 'present day', 'today'], ages: [8, 9, 10, 11, 12, 13], answer: 'A broad world-history timeline is: prehistoric societies; ancient civilisations (including Egypt, Greece, Rome, China and many others); post-classical societies and empires; medieval periods (which differed by region); early modern global connections and colonisation; industrialisation; and contemporary history. These periods overlap and are experienced differently around the world. Tell me a place or period and we can zoom in.' },
] as const;

function normalise(value: string) { return value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }

export function loadSavedLearning(): SavedLearningTurn[] {
  if (typeof window === 'undefined') return [];
  try {
    const rows = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(rows)) return [];
    return rows.filter((x): x is SavedLearningTurn => x && typeof x.question === 'string' && typeof x.answer === 'string' && Number.isInteger(x.age)).slice(-MAX_TURNS);
  } catch { return []; }
}
export function saveLearningTurn(question: string, answer: string, age = 9): void {
  if (typeof window === 'undefined' || !question.trim() || !answer.trim()) return;
  try {
    const rows = loadSavedLearning().filter(x => normalise(x.question) !== normalise(question) || x.age !== age);
    rows.push({ question: question.trim().slice(0, 1000), answer: answer.trim().slice(0, 6000), age, savedAt: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(rows.slice(-MAX_TURNS)));
  } catch { /* private browsing/storage limits: keep the current answer usable */ }
}
export function clearSavedLearning(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY);
}
export function answerFromDevice(question: string, age = 9): string | null {
  const q = normalise(question);
  if (!q) return null;
  const saved = loadSavedLearning().find(x => normalise(x.question) === q && x.age === age);
  if (saved) return saved.answer;
  const entry = HISTORY.find(item => item.ages.includes(age as never) && item.keys.some(key => q.includes(key)));
  if (entry) return entry.answer;
  return null;
}
