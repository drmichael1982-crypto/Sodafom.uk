import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Camera, PenLine, Send, Sparkles, Volume2, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { API_PREFIX } from '@/lib/config';
import { ttsSpeak } from '@/lib/voice-context';
import { getActiveChild, setActiveChild, type AgeGroup } from '@/hooks/useChildAge';
import { rememberOnlineAnswer } from '@/lib/archie-device-memory';
import { tryLocalArchieResponse } from '@/lib/archie-local';

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
  { name: 'Maths', emoji: '🔢', artwork: '/assets/cartoon/worlds/maths.png', colour: 'from-blue-600 to-indigo-950' },
  { name: 'Reading', emoji: '📖', artwork: '/assets/cartoon/worlds/reading.png', colour: 'from-emerald-500 to-green-950' },
  { name: 'Writing', emoji: '✍️', artwork: '/assets/cartoon/worlds/reading.png', colour: 'from-rose-500 to-red-950' },
  { name: 'Spelling', emoji: '🔤', artwork: '/assets/cartoon/worlds/spelling.png', colour: 'from-purple-500 to-violet-950' },
  { name: 'Science', emoji: '🔬', artwork: '/assets/cartoon/worlds/science.png', colour: 'from-cyan-500 to-blue-950' },
  { name: 'Any Subject', emoji: '🌈', artwork: '/assets/cartoon/worlds/geography.png', colour: 'from-orange-500 to-purple-950' },
];

export default function AITeacherPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [answerSource, setAnswerSource] = useState<'Local AI' | 'OpenAI' | null>(null);
  const [lessonMinutes, setLessonMinutes] = useState<15 | 20 | 30 | 60>(30);
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

  const startLesson = (subject: string) => {
    localStorage.setItem('sodafom_lesson_subject', subject);
    localStorage.setItem('sodafom_lesson_minutes', String(lessonMinutes));
    navigate('/tutor');
  };

  const askTeacher = async () => {
    if (!question.trim() || busy) return;
    setBusy(true); setError('');
    const localAnswer = tryLocalArchieResponse(question);
    if (localAnswer) {
      setAnswer(localAnswer.text);
      setAnswerSource('Local AI');
      ttsSpeak(localAnswer.text);
      setBusy(false);
      return;
    }
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
      rememberOnlineAnswer(question, text);
      setAnswer(text); setAnswerSource('OpenAI'); ttsSpeak(text);
    } catch (_e) {
      clearTimeout(timeoutId);
      const fallbackText = `I am helping offline! For a child in ${curriculum.year} learning ${curriculum.topics}, regarding "${question}": Let's break it down into simple steps. Take your time, try a small example, and you'll get it!`;
      setAnswer(fallbackText);
      setAnswerSource('Local AI');
      ttsSpeak(fallbackText);
      setError('Online teacher is unavailable (offline mode active).');
    }
    finally { setBusy(false); }
  };

  const readBookPage = async (file?: File) => {
    if (!file || busy) return;
    if (file.size > 6 * 1024 * 1024) { setError('Please choose a photograph smaller than 6 MB.'); return; }
    setBusy(true); setError(''); setAnswer('');
    setAnswerSource(null);
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
        setAnswer(text); setAnswerSource('OpenAI'); ttsSpeak(text);
      } catch (_e) {
        clearTimeout(timeoutId);
        const fallbackText = `I have looked at your book page photo! For year ${curriculum.year}, focus on reading each word clearly, sounding out tricky parts, and asking what happens next in the story.`;
        setAnswer(fallbackText);
        setAnswerSource('Local AI');
        ttsSpeak(fallbackText);
        setError('Online OCR is unavailable (offline reading guidance active).');
      }
      finally { setBusy(false); }
    };
    reader.onerror = () => { setBusy(false); setError('The photograph could not be opened.'); };
    reader.readAsDataURL(file);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-sky-700 px-4 py-5 pb-24">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/cartoon/home-landscape-v2.png')" }} aria-hidden="true" />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500/55 via-indigo-800/70 to-blue-950/95" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <header className="relative mb-5 min-h-56 overflow-hidden rounded-[2.25rem] border-4 border-white/80 bg-gradient-to-br from-sky-400 via-blue-600 to-purple-800 p-5 text-white shadow-2xl sm:min-h-64 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(255,255,255,0.38),transparent_35%)]" aria-hidden="true" />
          <button onClick={() => navigate('/')} className="relative z-20 flex min-h-12 items-center gap-2 rounded-full border-2 border-white/80 bg-white px-4 font-black text-sky-900 shadow-lg active:scale-95"><ArrowLeft size={20}/> Home</button>
          <div className="relative z-10 mt-4 max-w-[62%] sm:max-w-md">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">Learn · Play · Grow</p>
            <h1 className="mt-1 text-3xl font-black leading-tight drop-shadow sm:text-5xl">Archie AI Teacher</h1>
            <p className="mt-2 text-sm font-bold text-white/90 sm:text-lg">Pick a magical learning world and Archie will teach it one step at a time.</p>
          </div>
          <img src="/assets/images/archie-character-v2.png" alt="Archie holding the golden learning key" className="absolute -bottom-5 -right-5 h-52 w-44 object-contain drop-shadow-2xl sm:right-5 sm:h-64 sm:w-56" />
          <img src="/assets/cartoon/friends/soda-bot.png" alt="Soda Bot" className="absolute bottom-2 right-28 h-20 w-20 rounded-2xl object-contain drop-shadow-xl sm:right-48 sm:h-24 sm:w-24" />
        </header>

        <section className="mb-5 rounded-[2rem] border-4 border-yellow-300/90 bg-white/95 p-5 shadow-2xl backdrop-blur-sm">
          <label htmlFor="teacher-age" className="block text-lg font-black text-sky-950">How old is the learner?</label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <select id="teacher-age" value={age} onChange={event => selectAge(Number(event.target.value))} className="min-h-12 rounded-2xl border-2 border-sky-300 bg-white px-4 text-lg font-black text-sky-950">
              {CURRICULUM.map(item => <option key={item.age} value={item.age}>Age {item.age} — {item.year}</option>)}
            </select>
            <div><p className="font-black text-purple-800">{curriculum.year} · {curriculum.stage}</p><p className="text-sm font-semibold text-slate-600">Games and lessons now match this age group.</p></div>
          </div>
          <p className="mt-3 rounded-2xl bg-sky-50 p-3 text-sm font-bold text-sky-900">Suggested learning: {curriculum.topics}.</p>
        </section>

        <h2 className="mb-3 text-xl font-black text-white drop-shadow">Choose a learning world</h2>
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SUBJECTS.map(subject => (
            <button
              key={subject.name}
              onClick={() => { ttsSpeak(`Starting a ${lessonMinutes} minute ${subject.name} lesson.`); startLesson(subject.name); }}
              className={`group relative min-h-48 overflow-hidden rounded-[1.75rem] border-4 border-white/90 bg-gradient-to-b ${subject.colour} p-4 text-center text-white shadow-2xl active:scale-95`}
            >
              <img src={subject.artwork} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" aria-hidden="true" />
              <div className={`absolute inset-0 bg-gradient-to-t ${subject.colour} via-transparent to-transparent`} aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-lg font-black drop-shadow-md"><span aria-hidden="true">{subject.emoji}</span> {subject.name}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xs font-black text-white/90"><Clock3 size={14}/> {lessonMinutes}-minute lesson</p>
              </div>
            </button>
          ))}
        </section>

        <section className="mt-4 rounded-3xl border-4 border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
          <p className="font-black text-purple-900">Choose lesson time</p>
          <div className="mt-2 grid grid-cols-4 gap-2">{([15, 20, 30, 60] as const).map((minutes) => <button key={minutes} onClick={() => setLessonMinutes(minutes)} aria-pressed={lessonMinutes === minutes} className={`rounded-xl border-2 p-3 font-black ${lessonMinutes === minutes ? 'border-purple-700 bg-purple-700 text-white' : 'border-purple-100 text-purple-800'}`}>{minutes} min</button>)}</div>
        </section>

        <section className="mt-5 rounded-3xl border-4 border-white/80 bg-white/95 p-5 shadow-xl backdrop-blur-sm">
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

        {answer && <section className="mt-5 rounded-3xl border-4 border-green-200 bg-white/95 p-5 shadow-xl backdrop-blur-sm"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-black text-green-800"><PenLine/> Archie’s lesson</h2>{answerSource && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">{answerSource}</span>}</div><p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">{answer}</p><button onClick={() => ttsSpeak(answer)} className="mt-3 flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 font-black text-white"><Volume2/> Read aloud</button></section>}
        {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 font-bold text-red-700">{error}</p>}
      </div>
    </main>
  );
}
