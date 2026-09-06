import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Camera, PenLine, Send, Sparkles, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { API_PREFIX } from '@/lib/config';
import { ttsSpeak } from '@/lib/voice-context';
import { getActiveChild, setActiveChild, type AgeGroup } from '@/hooks/useChildAge';

const CURRICULUM = [
  { age: 5, year: 'Year 1', stage: 'Key Stage 1', topics: 'phonics, number bonds, addition and subtraction, shapes, plants and animals' },
  { age: 6, year: 'Year 2', stage: 'Key Stage 1', topics: 'fluent reading, spelling, place value, times tables, fractions, habitats and materials' },
  { age: 7, year: 'Year 3', stage: 'Key Stage 2', topics: 'reading comprehension, paragraphs, multiplication and division, fractions, forces and rocks' },
  { age: 8, year: 'Year 4', stage: 'Key Stage 2', topics: 'vocabulary, grammar, times tables, decimals, area, sound and electricity' },
  { age: 9, year: 'Year 5', stage: 'Key Stage 2', topics: 'inference, composition, fractions and decimals, geometry, Earth and space' },
  { age: 10, year: 'Year 6', stage: 'Key Stage 2', topics: 'reading analysis, purposeful writing, ratio, algebra, statistics, evolution and light' },
  { age: 11, year: 'Year 7', stage: 'Key Stage 3', topics: 'literary analysis, structured writing, number and algebra, cells, particles and forces' },
  { age: 12, year: 'Year 8', stage: 'Key Stage 3', topics: 'critical reading, accurate writing, equations, geometry, ecosystems, reactions and energy' },
  { age: 13, year: 'Year 9', stage: 'Key Stage 3', topics: 'comparison and argument, algebra and probability, genetics, chemistry and physics' },
] as const;

const ageGroupFor = (age: number): AgeGroup => age <= 7 ? '5-7' : age <= 10 ? '8-10' : '11-13';

const SUBJECTS = [
  { name: 'Maths', emoji: '🔢', route: '/games/maths', prompt: 'Teach me maths one step at a time.' },
  { name: 'Reading', emoji: '📖', route: '/games/reading', prompt: 'Help me practise reading.' },
  { name: 'Writing', emoji: '✍️', route: '/story-writer', prompt: 'Help me write a brilliant sentence.' },
  { name: 'Spelling', emoji: '🔤', route: '/games/spelling', prompt: 'Help me practise spelling.' },
  { name: 'Science', emoji: '🔬', route: '/games?subject=science', prompt: 'Teach me an interesting science topic.' },
  { name: 'Any Subject', emoji: '🌈', route: '/games', prompt: 'What would you like to learn today?' },
];

export default function AITeacherPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [age, setAge] = useState(() => {
    const stored = Number(localStorage.getItem('sodafom_ai_teacher_age'));
    if (stored >= 5 && stored <= 13) return stored;
    const group = getActiveChild()?.ageGroup;
    return group === '5-7' ? 6 : group === '11-13' ? 12 : 9;
  });
  const curriculum = useMemo(() => CURRICULUM.find(item => item.age === age) ?? CURRICULUM[4], [age]);

  const selectAge = (nextAge: number) => {
    setAge(nextAge);
    localStorage.setItem('sodafom_ai_teacher_age', String(nextAge));
    const current = getActiveChild();
    setActiveChild({
      id: current?.id ?? 1,
      name: current?.name ?? 'Learner',
      avatarEmoji: current?.avatarEmoji ?? '⭐',
      ageGroup: ageGroupFor(nextAge),
    });
  };

  const askTeacher = async () => {
    if (!question.trim() || busy) return;
    setBusy(true); setError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${API_PREFIX}/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ messages: [{ role: 'user', content: question }], systemExtra: `Act as a patient teacher following the National Curriculum in England for a child aged ${age}, in ${curriculum.year} (${curriculum.stage}). Teach one clear step at a time, check understanding, use child-friendly language, and adapt examples to this level. Relevant learning includes ${curriculum.topics}.` }),
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Online teacher is not connected yet.');
      const text = await response.text();
      setAnswer(text); ttsSpeak(text);
    } catch (e) {
      clearTimeout(timeoutId);
      const fallbackText = `I am helping offline! For a child in ${curriculum.year} learning ${curriculum.topics}, regarding "${question}": Let's break it down into simple steps. Take your time, try a small example, and you'll get it!`;
      setAnswer(fallbackText);
      ttsSpeak(fallbackText);
      setError('Online teacher is unavailable (offline mode active).');
    }
    finally { setBusy(false); }
  };

  const readBookPage = async (file?: File) => {
    if (!file || busy) return;
    if (file.size > 6 * 1024 * 1024) { setError('Please choose a photograph smaller than 6 MB.'); return; }
    setBusy(true); setError(''); setAnswer('');
    const reader = new FileReader();
    reader.onload = async () => {
      const image = String(reader.result || '');
      setPreview(image);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(`${API_PREFIX}/ai-teacher/read-page`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ image, age }),
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(await response.text() || 'The page could not be read.');
        const text = await response.text();
        setAnswer(text); ttsSpeak(text);
      } catch (e) {
        clearTimeout(timeoutId);
        const fallbackText = `I have looked at your book page photo! For year ${curriculum.year}, focus on reading each word clearly, sounding out tricky parts, and asking what happens next in the story.`;
        setAnswer(fallbackText);
        ttsSpeak(fallbackText);
        setError('Online OCR is unavailable (offline reading guidance active).');
      }
      finally { setBusy(false); }
    };
    reader.onerror = () => { setBusy(false); setError('The photograph could not be opened.'); };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-amber-50 px-4 py-5 pb-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex min-h-12 items-center gap-2 rounded-full bg-white px-4 font-black text-sky-900 shadow"><ArrowLeft size={20}/> Home</button>
          <img src="/assets/images/sodafom-launcher-icon-v2.png" alt="Archie" className="h-16 w-16 rounded-full border-4 border-yellow-300 object-cover shadow-lg" />
          <div><h1 className="text-2xl font-black text-sky-950">Archie AI Teacher</h1><p className="text-sm font-bold text-sky-700">Learn any subject, one step at a time.</p></div>
        </div>

        <section className="mb-5 rounded-3xl border-2 border-yellow-200 bg-white p-5 shadow-lg">
          <label htmlFor="teacher-age" className="block text-lg font-black text-sky-950">How old is the learner?</label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <select id="teacher-age" value={age} onChange={event => selectAge(Number(event.target.value))} className="min-h-12 rounded-2xl border-2 border-sky-300 bg-white px-4 text-lg font-black text-sky-950">
              {CURRICULUM.map(item => <option key={item.age} value={item.age}>Age {item.age} — {item.year}</option>)}
            </select>
            <div><p className="font-black text-purple-800">{curriculum.year} · {curriculum.stage}</p><p className="text-sm font-semibold text-slate-600">Games and lessons now match this age group.</p></div>
          </div>
          <p className="mt-3 rounded-2xl bg-sky-50 p-3 text-sm font-bold text-sky-900">Suggested learning: {curriculum.topics}.</p>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SUBJECTS.map(subject => <button key={subject.name} onClick={() => { ttsSpeak(subject.prompt); navigate(subject.route); }} className="min-h-28 rounded-3xl border-2 border-white bg-white p-4 text-center shadow-lg active:scale-95"><span className="text-4xl">{subject.emoji}</span><p className="mt-2 font-black text-sky-950">{subject.name}</p></button>)}
        </section>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-xl">
          <h2 className="flex items-center gap-2 text-xl font-black text-sky-950"><Sparkles className="text-yellow-500"/> Ask your teacher</h2>
          <div className="mt-3 flex gap-2"><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="What would you like Archie to teach?" className="min-w-0 flex-1 rounded-2xl border-2 border-sky-200 px-4 py-3"/><button onClick={() => void askTeacher()} disabled={busy || !question.trim()} className="rounded-2xl bg-sky-600 px-4 text-white disabled:opacity-50"><Send/></button></div>
        </section>

        <section className="mt-5 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-800 p-5 text-white shadow-xl">
          <h2 className="flex items-center gap-2 text-xl font-black"><BookOpen/> Read a Book With Archie</h2>
          <p className="mt-1 text-sm font-bold text-white/85">Photograph one page. Archie will read the visible text and explain difficult words.</p>
          <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => void readBookPage(e.target.files?.[0])}/>
          <button onClick={() => inputRef.current?.click()} disabled={busy} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 font-black text-indigo-950 disabled:opacity-60"><Camera/> {busy ? 'Reading the page…' : 'Photograph a Book Page'}</button>
          {preview && <img src={preview} alt="Photographed book page" className="mt-4 max-h-72 w-full rounded-2xl bg-white object-contain"/>}
        </section>

        {answer && <section className="mt-5 rounded-3xl border-2 border-green-200 bg-white p-5 shadow"><h2 className="flex items-center gap-2 font-black text-green-800"><PenLine/> Archie’s lesson</h2><p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">{answer}</p><button onClick={() => ttsSpeak(answer)} className="mt-3 flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 font-black text-white"><Volume2/> Read aloud</button></section>}
        {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{error}</p>}
      </div>
    </main>
  );
}
