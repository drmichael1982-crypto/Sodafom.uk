import { useState, useMemo } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap, ChevronRight, Calculator,
  BookOpen, Star, ShieldCheck, Pencil, FlaskConical, X
} from 'lucide-react';
import { PRIMARY_EXAMS, type YearExam } from '@/lib/curriculum-exams';
import MockExamEngine from '@/components/games/MockExamEngine';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useEffect } from 'react';

type SubjectFilter = 'All' | 'Maths' | 'Spelling' | 'Science';

export default function MockExamsPage() {
  const { setGameContext, clearGameContext } = useArchieContext();
  const [activeExam, setActiveExam] = useState<YearExam | null>(null);

  useEffect(() => {
    if (activeExam) {
      setGameContext(`${activeExam.subject} Year ${activeExam.year} Exam`, activeExam.subject.toLowerCase());
    } else {
      clearGameContext();
    }
    return () => clearGameContext();
  }, [activeExam, setGameContext, clearGameContext]);

  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('All');
  const [yearFilter, setYearFilter] = useState<number | 'All'>('All');

  const filteredExams = useMemo(() => {
    return PRIMARY_EXAMS.filter(exam => {
      const matchSubject = subjectFilter === 'All' || exam.subject === subjectFilter;
      const matchYear = yearFilter === 'All' || exam.year === yearFilter;
      return matchSubject && matchYear;
    });
  }, [subjectFilter, yearFilter]);

  const subjects: SubjectFilter[] = ['All', 'Maths', 'Spelling', 'Science'];
  const years: (number | 'All')[] = ['All', 1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Helmet>
        <title>Primary Mock Exam Center — Sodafom</title>
        <meta name="description" content="Official Sodafom Mock Exam Center. UK Curriculum aligned tests for Years 1-6. Track scores and improve skills." />
      </Helmet>

      <AnimatePresence mode="wait">
        {!activeExam ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto px-4 py-12"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-widest mb-4">
                <ShieldCheck size={14} /> 100% Curriculum Verified
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Mock Exam Center
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium">
                Professional practice tests designed to prepare children for SATs and end-of-year assessments.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-3xl border-2 border-border p-6 mb-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Filter by Subject</p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(s => (
                    <button
                      key={s}
                      onClick={() => setSubjectFilter(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-black transition-all border-2 ${
                        subjectFilter === s
                        ? 'bg-primary border-primary text-white shadow-md'
                        : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {s === 'Maths' && '🔢 '}
                      {s === 'Spelling' && '✏️ '}
                      {s === 'Science' && '🔬 '}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Select Year Group</p>
                <div className="flex flex-wrap gap-2">
                  {years.map(y => (
                    <button
                      key={String(y)}
                      onClick={() => setYearFilter(y)}
                      className={`w-11 h-11 flex items-center justify-center rounded-xl text-sm font-black transition-all border-2 ${
                        yearFilter === y
                        ? 'bg-accent border-accent text-accent-foreground shadow-md'
                        : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {y === 'All' ? 'All' : y}
                    </button>
                  ))}
                </div>
              </div>

              {(subjectFilter !== 'All' || yearFilter !== 'All') && (
                <button
                  onClick={() => { setSubjectFilter('All'); setYearFilter('All'); }}
                  className="flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
                >
                  <X size={14} /> Clear Filters
                </button>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExams.map((exam) => (
                <motion.div
                  key={`${exam.year}-${exam.subject}`}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-[2.5rem] border-4 border-border p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
                >
                  {/* Decorative background shape */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg border-2 border-white ${
                      exam.subject === 'Maths' ? 'bg-amber-400 text-white' :
                      exam.subject === 'Spelling' ? 'bg-red-400 text-white' :
                      'bg-blue-400 text-white'
                    }`}>
                      {exam.subject === 'Maths' ? <Calculator size={32} /> :
                       exam.subject === 'Spelling' ? <Pencil size={32} /> :
                       <FlaskConical size={32} />}
                    </div>
                    <div className="bg-muted px-4 py-2 rounded-2xl border border-border shadow-inner">
                      <span className="text-[10px] font-black text-muted-foreground uppercase block text-center leading-none mb-1">Year</span>
                      <p className="font-black text-foreground text-xl text-center leading-none">{exam.year}</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {exam.subject} Practice
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">
                    Comprehensive test covering {exam.questions.length} key questions from the Year {exam.year} {exam.subject} curriculum.
                  </p>

                  <button
                    onClick={() => setActiveExam(exam)}
                    className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg hover:scale-[1.03] active:scale-95 transition-all ${
                      exam.subject === 'Maths' ? 'bg-amber-400 text-white shadow-amber-200' :
                      exam.subject === 'Spelling' ? 'bg-red-400 text-white shadow-red-200' :
                      'bg-blue-500 text-white shadow-blue-200'
                    }`}
                  >
                    Start Exam <ChevronRight size={20} />
                  </button>
                </motion.div>
              ))}

              {filteredExams.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-black text-foreground mb-2">No exams found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters to see more tests.</p>
                </div>
              )}
            </div>

            {/* Bottom Tip Section */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-primary rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <GraduationCap size={180} />
                </div>
                <h2 className="text-3xl font-black mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Sodafom Exam Guarantee</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-black text-lg mb-1">Accurate Answers</p>
                      <p className="text-sm text-white/80 leading-relaxed">Every question is hand-checked for mathematical and factual accuracy.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <p className="font-black text-lg mb-1">Step-by-Step Learning</p>
                      <p className="text-sm text-white/80 leading-relaxed">Detailed explanations show children the correct logic after every question.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-accent rounded-[3rem] p-10 text-accent-foreground shadow-2xl flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mb-6">
                  <Star size={40} className="fill-current" />
                </div>
                <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Earn Your Certificate!</h2>
                <p className="font-bold text-lg mb-8 opacity-90">Get 100% on any exam to unlock your official Sodafom Excellence Certificate.</p>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <div className="w-3 h-3 rounded-full bg-white/50" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="exam"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MockExamEngine
              exam={activeExam}
              onExit={() => setActiveExam(null)}
              onQuestionChange={(q, opts) => setGameContext(`${activeExam.subject} Year ${activeExam.year} Exam`, activeExam.subject.toLowerCase(), q, opts)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
