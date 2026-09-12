import React, { Component } from 'react';
import { ArchieCharacter } from '@/components/ArchieCharacter';
import { ISLANDS, beginRound, chooseAnswer, createIslandRound, nextQuestion, type IslandId, type RoundState } from '@/lib/island-adventures';
import { startChoiceListening, supportsIslandSpeech, type SpeechHost } from '@/lib/island-speech';

type Props = { islandId: IslandId; onBack: () => void; onNavigate: (path: string) => void };
type State = { round: RoundState | null; listening: boolean; voiceMessage: string; speechAvailable: boolean };

/** A focused, responsive destination for every island. Existing games remain intact. */
export default class IslandAdventure extends Component<Props, State> {
  state: State = { round: null, listening: false, voiceMessage: '', speechAvailable: false };
  private currentRound: RoundState | null = null;
  private stopListening: (() => void) | null = null;
  private mounted = false;
  private speaking = false;
  private heading: HTMLHeadingElement | null = null;

  componentDidMount() {
    this.mounted = true;
    this.setState({ speechAvailable: supportsIslandSpeech(window as unknown as SpeechHost) });
    this.heading?.focus();
  }
  componentWillUnmount() { this.mounted = false; this.stopAudio(); }
  private stopAudio = () => {
    this.stopListening?.();
    this.stopListening = null;
    if (this.speaking && typeof window !== 'undefined') window.speechSynthesis?.cancel();
    this.speaking = false;
  };
  private startRound = () => {
    this.stopAudio();
    this.currentRound = beginRound(createIslandRound(this.props.islandId));
    this.setState({ round: this.currentRound, listening: false, voiceMessage: '' }, () => this.heading?.focus());
  };
  private answer = (choice: string) => {
    if (!this.currentRound) return;
    const next = chooseAnswer(this.currentRound, choice);
    if (next === this.currentRound) return;
    this.stopAudio();
    this.currentRound = next;
    this.setState({ round: next, listening: false, voiceMessage: '' });
  };
  private advance = () => {
    if (!this.currentRound) return;
    const next = nextQuestion(this.currentRound);
    if (next === this.currentRound) return;
    this.stopAudio();
    this.currentRound = next;
    this.setState({ round: next, listening: false, voiceMessage: '' }, () => this.heading?.focus());
  };
  private readQuestion = () => {
    const round = this.currentRound;
    if (!round || round.complete) return;
    this.stopAudio();
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      this.setState({ voiceMessage: 'Read-aloud is unavailable here. The question and every answer are shown on screen.' });
      return;
    }
    const question = round.questions[round.index];
    const text = `${question.prompt} ${question.choices.map((choice, i) => `Option ${'ABC'[i]}: ${choice}`).join('. ')}`;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB'; utterance.rate = 0.88;
      utterance.onend = () => { this.speaking = false; };
      utterance.onerror = () => {
        this.speaking = false;
        if (this.mounted) this.setState({ voiceMessage: 'Read-aloud stopped. You can still read and tap every answer.' });
      };
      this.speaking = true;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.speaking = false;
      this.setState({ voiceMessage: 'Read-aloud could not start. You can still tap every answer.' });
    }
  };
  private listen = () => {
    if (this.state.listening) { this.stopAudio(); return; }
    const round = this.currentRound;
    if (!round || round.complete || round.selected !== null) return;
    this.stopAudio();
    this.setState({ voiceMessage: 'Starting the microphone…' });
    const expectedId = round.questions[round.index].id;
    this.stopListening = startChoiceListening(round.questions[round.index].choices, choice => {
      if (this.mounted && this.currentRound === round && this.currentRound.questions[this.currentRound.index].id === expectedId) this.answer(choice);
    }, (status, voiceMessage) => {
      if (this.mounted) this.setState({ listening: status === 'listening', voiceMessage });
    }, window as unknown as SpeechHost);
  };
  private leave = () => { this.stopAudio(); this.props.onBack(); };

  render() {
    const island = ISLANDS.find(item => item.id === this.props.islandId)!;
    const { round, listening, voiceMessage, speechAvailable } = this.state;
    const question = round && !round.complete ? round.questions[round.index] : null;
    const stars = round?.complete ? (round.score >= 9 ? 3 : round.score >= 6 ? 2 : round.score > 0 ? 1 : 0) : 0;
    return (
      <main className="relative min-h-[100svh] overflow-x-hidden bg-gradient-to-b from-sky-200 via-cyan-50 to-emerald-100 px-4 py-5 text-slate-900 sm:px-8" aria-label={`${island.name} Island`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/assets/approved/game-islands.png')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-4xl">
          <nav className="mb-5 flex flex-wrap items-center justify-between gap-3" aria-label="Island navigation">
            <button type="button" onClick={this.leave} className="min-h-12 rounded-full border-2 border-sky-700 bg-white px-5 py-3 font-bold shadow-sm focus-visible:ring-4 focus-visible:ring-amber-400">← All islands</button>
            <span className="rounded-full bg-white/95 px-4 py-2 font-bold text-sky-900">{island.icon} {island.name} Island</span>
          </nav>
          <section className="rounded-3xl border-4 border-white bg-white/95 p-5 shadow-xl sm:p-8">
            <div className="mb-4 flex items-center gap-4">
              <div aria-hidden="true" className="shrink-0 motion-safe:animate-bounce"><ArchieCharacter size={80} /></div>
              <div>
                <p className="mb-1 font-bold text-sky-700">Adventure with Archie</p>
                <h1 ref={element => { this.heading = element; }} tabIndex={-1} className="text-2xl font-black outline-none sm:text-4xl">
                  {round?.complete ? 'Treasure challenge complete!' : question ? `${island.name} treasure challenge` : `Welcome to ${island.name} Island!`}
                </h1>
              </div>
            </div>
            {!round && <>
              <p className="mb-5 text-lg leading-relaxed">{island.description}</p>
              <button type="button" onClick={this.startRound} className="min-h-16 w-full rounded-2xl bg-sky-700 px-6 py-5 text-xl font-black text-white shadow-lg transition hover:bg-sky-800 focus-visible:ring-4 focus-visible:ring-amber-400">🗝️ Start the 10-question treasure challenge</button>
              <p className="mt-3 text-center text-sm text-slate-600">Starter practice. No timer — take your time. New rounds shuffle these practice questions.</p>
              {island.games.length > 0 && <>
                <h2 className="mb-3 mt-8 text-xl font-black">More games on this island</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {island.games.map(([name, path, icon]) => <button key={path} type="button" onClick={() => { this.stopAudio(); this.props.onNavigate(path); }} className="min-h-28 rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-left font-bold shadow-sm transition hover:-translate-y-1 hover:border-sky-500 focus-visible:ring-4 focus-visible:ring-amber-400"><span aria-hidden="true" className="mb-2 block text-3xl">{icon}</span>{name}<span className="mt-2 block text-sm text-sky-700">Play game →</span></button>)}
                </div>
              </>}
            </>}
            {round?.complete && <div className="text-center">
              <div className="my-5 text-5xl" aria-label={`${stars} stars`}>{stars ? '⭐'.repeat(stars) : '🌱'}</div>
              <p role="status" className="text-3xl font-black">You scored {round.score} out of {round.questions.length}.</p>
              <p className="mt-3 text-lg">{round.score >= 9 ? 'Wonderful exploring!' : 'Every try helps you learn. Ready to practise again?'}</p>
              <p className="mt-2 text-sm text-slate-600">This is a practice result for this round; it is not added to school reports.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={this.startRound} className="min-h-12 rounded-2xl bg-sky-700 px-6 py-4 font-bold text-white focus-visible:ring-4 focus-visible:ring-amber-400">Play another round</button>
                <button type="button" onClick={this.leave} className="min-h-12 rounded-2xl border-2 border-sky-700 px-6 py-4 font-bold focus-visible:ring-4 focus-visible:ring-amber-400">Explore another island</button>
              </div>
            </div>}
            {round && question && <>
              <div className="my-5 flex items-center justify-between gap-3 font-bold"><span>Question {round.index + 1} of {round.questions.length}</span><span>⭐ {round.score} correct</span></div>
              <div role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={round.questions.length} aria-valuenow={round.index + Number(round.selected !== null)} className="mb-6 flex gap-1">
                {round.questions.map((item, i) => <span key={item.id} aria-hidden="true" className={`h-3 flex-1 rounded-full ${i < round.index || (i === round.index && round.selected !== null) ? 'bg-amber-400' : 'bg-sky-100'}`} />)}
              </div>
              <h2 className="mb-5 text-xl font-bold leading-relaxed sm:text-2xl">{question.prompt}</h2>
              <div className="grid gap-3" aria-label="Answer choices">
                {question.choices.map((choice, index) => {
                  const correct = round.selected !== null && choice === question.answer;
                  const incorrect = round.selected === choice && choice !== question.answer;
                  return <button key={choice} type="button" disabled={round.selected !== null} onClick={() => this.answer(choice)} className={`min-h-16 rounded-2xl border-2 px-5 py-4 text-left text-lg font-bold focus-visible:ring-4 focus-visible:ring-amber-400 ${correct ? 'border-emerald-700 bg-emerald-100' : incorrect ? 'border-amber-600 bg-amber-50' : 'border-sky-200 bg-white enabled:hover:bg-sky-50'}`}><span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-900">{'ABC'[index]}</span>{choice}{correct && ' ✓ Correct answer'}{incorrect && ' — Your answer'}</button>;
                })}
              </div>
              {round.selected !== null ? <div className="mt-6">
                <p role="status" className="mb-4 text-lg font-bold">{round.selected === question.answer ? 'Well done! You found it. 🌟' : `Good try! The answer is ${question.answer}.`}</p>
                <button type="button" onClick={this.advance} className="min-h-14 w-full rounded-2xl bg-sky-700 px-6 py-4 text-lg font-black text-white focus-visible:ring-4 focus-visible:ring-amber-400">{round.index + 1 === round.questions.length ? 'See my treasure result' : 'Next question →'}</button>
              </div> : <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={this.readQuestion} className="min-h-12 rounded-full border-2 border-sky-700 px-5 py-3 font-bold focus-visible:ring-4 focus-visible:ring-amber-400">🔊 Read question and answers</button>
                {speechAvailable && <button type="button" onClick={this.listen} aria-pressed={listening} className={`min-h-12 rounded-full border-2 px-5 py-3 font-bold focus-visible:ring-4 focus-visible:ring-amber-400 ${listening ? 'border-rose-600 bg-rose-100' : 'border-sky-700'}`}>{listening ? '⏹ Stop microphone' : '🎤 Speak my answer'}</button>}
              </div>}
              <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm text-slate-700">{voiceMessage}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{speechAvailable ? 'Voice is optional and only starts when you tap the microphone. Your browser may use an online speech service. This game does not save audio recordings.' : 'Voice answers are unavailable in this browser. All questions work by tapping an answer.'}</p>
            </>}
          </section>
        </div>
      </main>
    );
  }
}
