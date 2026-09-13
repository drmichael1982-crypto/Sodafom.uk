import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Subtitles,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import ArchieCharacter from "@/components/ArchieCharacter";
import { stopTts, ttsSpeak } from "@/lib/voice-context";
import {
  HEALTH_BODY_EPISODE,
  type HealthBodyScene,
  type HealthBodySpeaker,
  type HealthBodyStage,
} from "@/features/cartoons/healthBodyEpisode";

const STAGE_STYLE: Record<
  HealthBodyStage,
  { label: string; background: string; accent: string }
> = {
  playground: {
    label: "Sunshine playground",
    background: "from-sky-300 via-cyan-300 to-emerald-300",
    accent: "bg-emerald-500",
  },
  "body-lab": {
    label: "Body discovery lab",
    background: "from-violet-300 via-fuchsia-300 to-pink-300",
    accent: "bg-violet-600",
  },
  kitchen: {
    label: "Rainbow picnic",
    background: "from-amber-200 via-orange-300 to-rose-300",
    accent: "bg-orange-600",
  },
  "wash-station": {
    label: "Sparkly wash station",
    background: "from-cyan-200 via-sky-300 to-indigo-300",
    accent: "bg-sky-600",
  },
  "team-field": {
    label: "Friendship field",
    background: "from-lime-300 via-emerald-300 to-teal-300",
    accent: "bg-emerald-700",
  },
  "quiet-garden": {
    label: "Calm-down garden",
    background: "from-indigo-300 via-violet-300 to-fuchsia-300",
    accent: "bg-indigo-700",
  },
};

const SPEAKER_ASSET: Record<
  Exclude<HealthBodySpeaker, "Founder">,
  { src: string; alt: string }
> = {
  Archie: {
    src: "/assets/images/archie-character-v2.png",
    alt: "Archie holding the golden heart key",
  },
  "Soda Bot": { src: "/assets/cartoon/friends/soda-bot.png", alt: "Soda Bot" },
  Sunny: { src: "/assets/cartoon/friends/sunny.png", alt: "Sunny" },
  Daisy: { src: "/assets/cartoon/friends/daisy.png", alt: "Daisy" },
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function speakerName(scene: HealthBodyScene) {
  return scene.temporaryVoice
    ? `${scene.speaker} · temporary voice`
    : scene.speaker;
}

function SceneCharacter({
  scene,
  speaking,
  reducedMotion,
}: {
  scene: HealthBodyScene;
  speaking: boolean;
  reducedMotion: boolean;
}) {
  if (scene.speaker === "Archie") {
    return (
      <motion.div
        animate={
          reducedMotion ? { y: 0 } : { y: [0, -12, 0], rotate: [0, -1, 1, 0] }
        }
        transition={{
          duration: 2.2,
          repeat: reducedMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      >
        <ArchieCharacter size={170} speaking={speaking} />
      </motion.div>
    );
  }

  const asset =
    scene.speaker === "Founder"
      ? SPEAKER_ASSET.Archie
      : SPEAKER_ASSET[scene.speaker];
  return (
    <motion.img
      src={asset.src}
      alt={
        scene.speaker === "Founder"
          ? "Archie listens to the Founder cameo"
          : asset.alt
      }
      className="h-44 w-44 object-contain drop-shadow-2xl sm:h-56 sm:w-56"
      animate={
        reducedMotion
          ? { y: 0 }
          : { y: [0, -10, 0], rotate: speaking ? [0, -2, 2, 0] : [0, -1, 1, 0] }
      }
      transition={{
        duration: speaking ? 0.65 : 2.4,
        repeat: reducedMotion ? 0 : Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/**
 * Temporary Agent 32 episode adapter.  It consumes the manifest above and can
 * be replaced by Agent 22's shared engine without changing the episode data.
 */
export default function HealthyBodyAdventurePage() {
  const navigate = useNavigate();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [finished, setFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [captionsOn, setCaptionsOn] = useState<boolean>(
    HEALTH_BODY_EPISODE.subtitlesDefault,
  );
  const [calmMotion, setCalmMotion] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const scene = HEALTH_BODY_EPISODE.scenes[sceneIndex];
  const stage = STAGE_STYLE[scene.stage];
  const reducedMotion = calmMotion || systemReducedMotion;
  const isLastScene = sceneIndex === HEALTH_BODY_EPISODE.scenes.length - 1;
  const elapsedBeforeScene = useMemo(
    () =>
      HEALTH_BODY_EPISODE.scenes
        .slice(0, sceneIndex)
        .reduce((total, item) => total + item.durationSeconds, 0),
    [sceneIndex],
  );
  const progress = finished
    ? 100
    : Math.round(
        (elapsedBeforeScene / HEALTH_BODY_EPISODE.estimatedRuntimeSeconds) *
          100,
      );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReducedMotion(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  const nextScene = useCallback(() => {
    if (isLastScene) {
      setFinished(true);
      setPlaying(false);
      stopTts();
      return;
    }
    setSceneIndex((current) => current + 1);
  }, [isLastScene]);

  useEffect(() => {
    if (!playing || finished) return undefined;
    const timer = window.setTimeout(nextScene, scene.durationSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [finished, nextScene, playing, scene.durationSeconds, scene.id]);

  useEffect(() => {
    stopTts();
    if (playing && soundOn && !finished) {
      ttsSpeak(`${speakerName(scene)}. ${scene.caption}`);
    }
    return () => stopTts();
  }, [finished, playing, scene, soundOn]);

  useEffect(() => () => stopTts(), []);

  const restart = () => {
    stopTts();
    setAnswers({});
    setSceneIndex(0);
    setFinished(false);
    setPlaying(true);
  };

  const togglePlaying = () => {
    if (finished) {
      restart();
      return;
    }
    setPlaying((value) => !value);
  };

  const previousScene = () => {
    stopTts();
    setFinished(false);
    setPlaying(true);
    setSceneIndex((current) => Math.max(0, current - 1));
  };

  const jumpToNextScene = () => {
    stopTts();
    setFinished(false);
    setPlaying(true);
    nextScene();
  };

  const chooseAnswer = (answerId: string) => {
    setAnswers((current) => ({ ...current, [scene.id]: answerId }));
  };

  const selectedChoice = scene.choices?.find(
    (choice) => choice.id === answers[scene.id],
  );

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-4 text-slate-950 sm:px-6 sm:py-6">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border-4 border-white/80 bg-white shadow-2xl sm:rounded-[3rem]">
        <header className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 px-4 py-3 text-white sm:px-6">
          <button
            type="button"
            onClick={() => {
              stopTts();
              navigate("/cartoons");
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 font-black text-slate-900 shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
          >
            <ArrowLeft size={18} aria-hidden="true" /> Cartoons
          </button>
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
              Agent 32 · final cartoon batch episode
            </p>
            <h1 className="text-lg font-black sm:text-2xl">
              Archie’s Healthy Body Adventure
            </h1>
          </div>
          <span
            className="rounded-full bg-white/15 px-3 py-2 text-xs font-black"
            data-testid="episode-runtime"
          >
            About {formatDuration(HEALTH_BODY_EPISODE.estimatedRuntimeSeconds)}
          </span>
        </header>

        <div
          className={`relative isolate overflow-hidden bg-gradient-to-br ${stage.background} px-4 py-5 sm:px-8 sm:py-8`}
          data-motion-mode={reducedMotion ? "reduced" : "full"}
        >
          <motion.div
            aria-hidden="true"
            className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-white/35 blur-2xl"
            animate={
              reducedMotion
                ? { opacity: 0.35 }
                : { x: [0, 80, 0], y: [0, 20, 0], opacity: [0.2, 0.55, 0.2] }
            }
            transition={{
              duration: 7,
              repeat: reducedMotion ? 0 : Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -right-16 bottom-2 h-56 w-56 rounded-full bg-yellow-200/65 blur-3xl"
            animate={
              reducedMotion
                ? { opacity: 0.5 }
                : { scale: [0.92, 1.08, 0.92], opacity: [0.35, 0.75, 0.35] }
            }
            transition={{
              duration: 5.5,
              repeat: reducedMotion ? 0 : Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative mx-auto grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
            <div className="order-2 rounded-[1.6rem] border-4 border-white/85 bg-white/92 p-4 shadow-xl backdrop-blur sm:p-6 lg:order-1">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide">
                <span
                  className={`rounded-full px-3 py-1.5 text-white ${stage.accent}`}
                >
                  {stage.label}
                </span>
                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-white">
                  Scene {sceneIndex + 1} of {HEALTH_BODY_EPISODE.scenes.length}
                </span>
                {scene.temporaryVoice && (
                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-950">
                    Temporary computer voice
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-slate-950 sm:text-4xl">
                {scene.title}
              </h2>
              {captionsOn && (
                <p
                  className="mt-4 rounded-2xl bg-slate-950 px-4 py-4 text-base font-bold leading-relaxed text-white shadow-inner sm:text-xl"
                  aria-live="polite"
                  data-testid="subtitle"
                >
                  <span className="mr-2 text-yellow-300">
                    {speakerName(scene)}:
                  </span>
                  {scene.caption}
                </p>
              )}
              {!captionsOn && (
                <p className="mt-4 text-sm font-bold text-slate-700">
                  Subtitles are hidden. Turn them back on with the Subtitles
                  button below.
                </p>
              )}

              {scene.challenge && (
                <aside
                  className="mt-4 rounded-2xl border-2 border-emerald-700 bg-emerald-50 p-4"
                  aria-label="Join-in movement challenge"
                >
                  <p className="font-black text-emerald-950">
                    🎯 {scene.challenge.title}
                  </p>
                  <p className="mt-1 font-semibold text-emerald-950">
                    {scene.challenge.instruction}
                  </p>
                  <p className="mt-2 text-sm font-bold text-emerald-800">
                    {scene.challenge.safeNote}
                  </p>
                </aside>
              )}

              {scene.choices && (
                <div className="mt-4" aria-label="Pause and think question">
                  <p className="font-black text-slate-900">
                    Choose an answer if you would like to:
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {scene.choices.map((choice) => {
                      const selected = selectedChoice?.id === choice.id;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => chooseAnswer(choice.id)}
                          aria-pressed={selected}
                          className={`min-h-12 rounded-xl border-2 px-3 py-2 text-left text-sm font-black shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 ${selected ? (choice.correct ? "border-emerald-700 bg-emerald-100 text-emerald-950" : "border-rose-700 bg-rose-100 text-rose-950") : "border-slate-300 bg-white text-slate-900 hover:border-indigo-500"}`}
                        >
                          {choice.label}
                        </button>
                      );
                    })}
                  </div>
                  {selectedChoice && (
                    <p
                      className={`mt-3 rounded-xl px-3 py-2 font-bold ${selectedChoice.correct ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}
                      role="status"
                    >
                      {selectedChoice.feedback}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="order-1 flex min-h-48 items-end justify-center rounded-[1.6rem] border-4 border-white/80 bg-white/25 p-3 shadow-xl lg:order-2">
              <SceneCharacter
                scene={scene}
                speaking={playing && soundOn && !finished}
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
        </div>

        <section
          className="bg-slate-950 px-4 py-4 text-white sm:px-6"
          aria-label="Cartoon controls"
        >
          <div className="mx-auto max-w-5xl">
            <div
              className="h-3 overflow-hidden rounded-full bg-white/20"
              aria-label={`${progress}% through cartoon`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <motion.div
                className="h-full rounded-full bg-yellow-300"
                animate={{ width: `${progress}%` }}
                transition={{ duration: reducedMotion ? 0 : 0.35 }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={previousScene}
                disabled={sceneIndex === 0}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-4 font-black disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
              >
                <ChevronLeft size={19} aria-hidden="true" /> Previous
              </button>
              <button
                type="button"
                onClick={togglePlaying}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-yellow-300 px-5 font-black text-slate-950 shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
              >
                {playing ? (
                  <Pause size={20} aria-hidden="true" />
                ) : (
                  <Play size={20} aria-hidden="true" />
                )}
                {playing ? "Pause" : finished ? "Play again" : "Play"}
              </button>
              <button
                type="button"
                onClick={jumpToNextScene}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-4 font-black focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
              >
                Next <ChevronRight size={19} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white/15 px-4 font-black focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
              >
                <RotateCcw size={18} aria-hidden="true" /> Restart
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setSoundOn((value) => !value)}
                aria-pressed={soundOn}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-3 font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
              >
                {soundOn ? (
                  <Volume2 size={17} aria-hidden="true" />
                ) : (
                  <VolumeX size={17} aria-hidden="true" />
                )}{" "}
                Sound {soundOn ? "on" : "off"}
              </button>
              <button
                type="button"
                onClick={() => setCaptionsOn((value) => !value)}
                aria-pressed={captionsOn}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-3 font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
              >
                <Subtitles size={17} aria-hidden="true" /> Subtitles{" "}
                {captionsOn ? "on" : "off"}
              </button>
              <button
                type="button"
                onClick={() => setCalmMotion((value) => !value)}
                aria-pressed={calmMotion}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-3 font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
              >
                <Waves size={17} aria-hidden="true" /> Calm motion{" "}
                {reducedMotion ? "on" : "off"}
              </button>
            </div>
            {finished && (
              <p
                className="mt-3 rounded-2xl bg-emerald-400 px-4 py-3 text-center font-black text-emerald-950"
                role="status"
              >
                Adventure complete — brilliant kind moving, thinking and
                cheering!
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
