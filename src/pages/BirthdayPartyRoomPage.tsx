import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";
import { Link } from "react-router";
import {
  CakeSlice,
  Gift,
  Music,
  Music2,
  PartyPopper,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  clampPartyVolume,
  DEFAULT_PARTY_VOLUME,
  PARTY_BALLOONS,
  partyBalloonsRemaining,
  togglePartyBalloon,
} from "@/lib/birthday-party-room";

type BrowserAudioContextConstructor = new () => AudioContext;

function getBrowserAudioContext(): BrowserAudioContextConstructor | undefined {
  return (
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: BrowserAudioContextConstructor })
      .webkitAudioContext
  );
}

function playPartyBeat(context: AudioContext, volume: number): void {
  const now = context.currentTime;
  [261.63, 329.63, 392].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 1 ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, volume * 0.08),
      now + 0.02,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + index * 0.08);
    oscillator.stop(now + 0.42 + index * 0.08);
  });
}

export default function BirthdayPartyRoomPage() {
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(DEFAULT_PARTY_VOLUME);
  const [musicStatus, setMusicStatus] = useState("Music is off.");
  const [poppedBalloons, setPoppedBalloons] = useState<Set<number>>(
    () => new Set(),
  );
  const [candlesLit, setCandlesLit] = useState(true);
  const [danceMode, setDanceMode] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const musicVolumeRef = useRef(DEFAULT_PARTY_VOLUME);
  const balloonsLeft = partyBalloonsRemaining(poppedBalloons);

  const stopBeat = useCallback(() => {
    if (musicTimerRef.current !== null) {
      window.clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopBeat();
      const context = audioContextRef.current;
      if (context && context.state !== "closed") {
        void context.close().catch(() => undefined);
      }
    };
  }, [stopBeat]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (
        document.visibilityState !== "hidden" ||
        musicTimerRef.current === null
      )
        return;
      stopBeat();
      setMusicPlaying(false);
      setMusicStatus("Music paused while the room is in the background.");
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () =>
      document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [stopBeat]);

  const toggleMusic = async () => {
    if (musicPlaying) {
      stopBeat();
      setMusicPlaying(false);
      setMusicStatus("Music is paused.");
      return;
    }

    const AudioContextClass = getBrowserAudioContext();
    if (!AudioContextClass) {
      setMusicStatus(
        "Party music is not available in this browser. You can still enjoy the activities.",
      );
      return;
    }

    try {
      const context = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = context;
      if (context.state === "suspended") await context.resume();
      stopBeat();
      playPartyBeat(context, musicVolumeRef.current);
      musicTimerRef.current = window.setInterval(() => {
        if (context.state !== "closed")
          playPartyBeat(context, musicVolumeRef.current);
      }, 1100);
      setMusicPlaying(true);
      setMusicStatus("Party music is playing.");
    } catch {
      stopBeat();
      setMusicPlaying(false);
      setMusicStatus(
        "Party music could not start on this device. You can still enjoy the activities.",
      );
    }
  };

  const changeMusicVolume = (value: number) => {
    const safeVolume = clampPartyVolume(value);
    musicVolumeRef.current = safeVolume;
    setMusicVolume(safeVolume);
  };

  return (
    <>
      <Helmet>
        <title>Birthday Party Room — Sodafom</title>
        <meta
          name="description"
          content="A private, local birthday party room with gentle music, balloon pop, make a wish and freeze dance."
        />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-pink-100 via-violet-100 to-cyan-100 px-4 py-8 text-slate-950 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-full bg-white px-4 py-2 text-sm font-black text-violet-800 shadow-sm transition hover:bg-violet-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-500"
          >
            ← Back to Sodafom
          </Link>

          <section
            className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-pink-500 via-fuchsia-600 to-violet-700 px-5 py-10 text-center text-white shadow-2xl sm:px-10"
            aria-labelledby="birthday-party-title"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-3 flex justify-around text-3xl sm:text-4xl"
            >
              <span className="animate-bounce motion-reduce:animate-none">
                🎈
              </span>
              <span className="animate-pulse motion-reduce:animate-none">
                🎉
              </span>
              <span className="animate-bounce motion-reduce:animate-none">
                🎁
              </span>
              <span className="animate-pulse motion-reduce:animate-none">
                ⭐
              </span>
              <span className="animate-bounce motion-reduce:animate-none">
                🎈
              </span>
            </div>
            <PartyPopper
              className="mx-auto mt-7"
              size={54}
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-black uppercase tracking-[0.2em] text-pink-100">
              A local celebration space
            </p>
            <h1
              id="birthday-party-title"
              className="mt-2 text-4xl font-black sm:text-5xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Birthday Party Room
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base font-bold text-white/90 sm:text-lg">
              Decorate the room with your imagination, play gentle activities,
              and celebrate without entering or saving any birthday details.
            </p>
          </section>

          <section
            className="mt-5 rounded-[2rem] border-4 border-violet-200 bg-white p-5 shadow-xl"
            aria-labelledby="party-music-heading"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <Music2 size={30} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="party-music-heading"
                  className="text-2xl font-black text-violet-950"
                >
                  Party music
                </h2>
                <p className="mt-1 font-bold text-slate-600">
                  An original, gentle beat generated only in this browser after
                  you press play.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void toggleMusic()}
                aria-pressed={musicPlaying}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-violet-700 px-5 py-3 font-black text-white shadow-lg transition hover:bg-violet-800 active:scale-95 focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-400"
              >
                {musicPlaying ? (
                  <>
                    <Pause size={19} aria-hidden="true" /> Pause music
                  </>
                ) : (
                  <>
                    <Play size={19} aria-hidden="true" /> Play music
                  </>
                )}
              </button>
              <label
                className="flex min-h-12 min-w-[16rem] flex-1 items-center gap-3 rounded-full bg-violet-100 px-4 font-black text-violet-950"
                htmlFor="party-volume"
              >
                {musicVolume === 0 ? (
                  <VolumeX size={20} aria-hidden="true" />
                ) : (
                  <Volume2 size={20} aria-hidden="true" />
                )}
                <span className="sr-only">Party music volume</span>
                <input
                  id="party-volume"
                  aria-label="Party music volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(event) =>
                    changeMusicVolume(Number(event.target.value))
                  }
                  className="w-full accent-violet-700"
                />
              </label>
            </div>
            <p
              className="mt-3 min-h-6 text-sm font-bold text-slate-600"
              aria-live="polite"
            >
              {musicStatus}
            </p>
          </section>

          <section className="mt-5" aria-labelledby="party-games-heading">
            <div className="mb-3 flex items-center gap-2 text-violet-950">
              <Gift size={28} aria-hidden="true" />
              <h2 id="party-games-heading" className="text-2xl font-black">
                Party games
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-[2rem] border-4 border-white bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 p-5 text-center text-sky-950 shadow-xl">
                <h3 className="text-2xl font-black">Balloon Pop</h3>
                <p className="mt-1 font-bold">
                  {balloonsLeft === 0
                    ? "You popped them all!"
                    : `${balloonsLeft} balloons left.`}
                </p>
                <div
                  className="mt-4 grid grid-cols-3 gap-3"
                  aria-label="Balloons to pop"
                >
                  {PARTY_BALLOONS.map((balloon, index) => {
                    const popped = poppedBalloons.has(index);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setPoppedBalloons((previous) =>
                            togglePartyBalloon(previous, index),
                          )
                        }
                        disabled={popped}
                        aria-label={
                          popped
                            ? `Balloon ${index + 1} popped`
                            : `Pop balloon ${index + 1}`
                        }
                        className="min-h-20 rounded-3xl bg-white/85 text-5xl shadow-md transition-transform hover:scale-105 active:scale-75 disabled:cursor-default disabled:opacity-45 motion-reduce:transition-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-950"
                      >
                        {popped ? "✨" : balloon}
                      </button>
                    );
                  })}
                </div>
                {balloonsLeft === 0 && (
                  <button
                    type="button"
                    onClick={() => setPoppedBalloons(new Set())}
                    className="mx-auto mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-blue-800 px-5 py-3 font-black text-white shadow-lg transition hover:bg-blue-900 active:scale-95 focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-950"
                  >
                    <RotateCcw size={18} aria-hidden="true" /> Play again
                  </button>
                )}
              </article>

              <article className="rounded-[2rem] border-4 border-white bg-gradient-to-br from-yellow-200 via-orange-300 to-pink-500 p-5 text-center text-purple-950 shadow-xl">
                <CakeSlice
                  className="mx-auto text-pink-700"
                  size={44}
                  aria-hidden="true"
                />
                <h3 className="mt-2 text-2xl font-black">Make a Wish</h3>
                <div
                  className="my-4 text-6xl"
                  role="img"
                  aria-label={
                    candlesLit
                      ? "Birthday cake with lit candles"
                      : "Birthday cake with candles blown out"
                  }
                >
                  {candlesLit ? "🎂" : "🍰"}
                </div>
                <p className="font-bold">
                  {candlesLit
                    ? "Think of a happy wish, then blow out the candles."
                    : "Great wish! The candles are out."}
                </p>
                <button
                  type="button"
                  onClick={() => setCandlesLit((previous) => !previous)}
                  className="mt-4 min-h-12 rounded-full bg-pink-700 px-5 py-3 font-black text-white shadow-lg transition hover:bg-pink-800 active:scale-95 focus-visible:outline focus-visible:outline-4 focus-visible:outline-pink-950"
                >
                  {candlesLit ? "Blow out candles" : "Light candles again"}
                </button>
              </article>
            </div>
          </section>

          <section
            className="mt-5 rounded-[2rem] border-4 border-white bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-600 p-6 text-center text-teal-950 shadow-2xl"
            aria-labelledby="party-activities-heading"
          >
            <Sparkles className="mx-auto" size={44} aria-hidden="true" />
            <h2
              id="party-activities-heading"
              className="mt-2 text-2xl font-black"
            >
              Freeze Dance
            </h2>
            <p className="mx-auto mt-2 max-w-2xl font-bold">
              Start dancing, then tap freeze and hold your funniest pose. There
              is no camera, microphone, score, or recording involved.
            </p>
            <button
              type="button"
              onClick={() => setDanceMode((previous) => !previous)}
              aria-pressed={danceMode}
              className="mx-auto mt-4 inline-flex min-h-14 items-center gap-2 rounded-full bg-teal-900 px-6 py-3 text-lg font-black text-white shadow-lg transition hover:bg-teal-950 active:scale-95 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-950"
            >
              <Music size={21} aria-hidden="true" />{" "}
              {danceMode ? "FREEZE!" : "Start dancing"}
            </button>
            <p className="mt-3 min-h-7 text-lg font-black" aria-live="polite">
              {danceMode
                ? "Dance, dance, dance! 🎵"
                : "Ready for freeze dance! ⭐"}
            </p>
          </section>

          <p className="mx-auto mt-6 max-w-3xl text-center text-sm font-bold text-slate-600">
            This room is for local play. It does not request a birthday date,
            name, photo, microphone, camera, account change, purchase, or AI
            response.
          </p>
        </div>
      </main>
    </>
  );
}
