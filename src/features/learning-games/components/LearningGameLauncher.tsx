import { useMemo, useState } from "react";
import { learningGameCatalog } from "../catalog";
import type { LearningGameDefinition, LearningGameSubject } from "../types";

export interface LearningGameLauncherProps {
  games?: readonly LearningGameDefinition[];
  learnerAge?: number;
  onLaunch: (game: LearningGameDefinition) => void;
}

type SubjectFilter = "all" | LearningGameSubject;

export function LearningGameLauncher({
  games = learningGameCatalog,
  learnerAge,
  onLaunch,
}: LearningGameLauncherProps) {
  const [subject, setSubject] = useState<SubjectFilter>("all");

  const visibleGames = useMemo(
    () =>
      games.filter((game) => {
        const matchesSubject = subject === "all" || game.subject === subject;
        const matchesAge =
          learnerAge === undefined ||
          (learnerAge >= game.ageRange.min && learnerAge <= game.ageRange.max);
        return matchesSubject && matchesAge;
      }),
    [games, learnerAge, subject],
  );

  return (
    <section
      aria-labelledby="learning-games-heading"
      className="mx-auto max-w-5xl p-4 sm:p-6"
    >
      <div className="rounded-3xl bg-sky-50 p-5 text-slate-900 shadow-sm">
        <h1
          id="learning-games-heading"
          className="text-3xl font-black tracking-tight"
        >
          Learning games
        </h1>
        <p className="mt-2 max-w-2xl text-base">
          Pick a short, untimed activity. Every game has clear instructions and
          works with a keyboard or touch screen.
        </p>

        <fieldset className="mt-5">
          <legend className="font-bold">Choose a subject</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["all", "maths", "english"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={subject === option}
                onClick={() => setSubject(option)}
                className="min-h-12 rounded-full border-2 border-sky-700 px-5 py-2 font-bold capitalize focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500 aria-pressed:bg-sky-800 aria-pressed:text-white"
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="sr-only" aria-live="polite">
        {visibleGames.length} {visibleGames.length === 1 ? "game" : "games"}{" "}
        available
      </p>

      {visibleGames.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-amber-50 p-5 font-semibold text-amber-950">
          No games match this choice yet. Try another subject.
        </p>
      ) : (
        <ul
          className="mt-6 grid gap-4 sm:grid-cols-2"
          aria-label="Available learning games"
        >
          {visibleGames.map((game) => (
            <li
              key={game.id}
              className="flex rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm"
            >
              <article className="flex w-full flex-col">
                <p className="text-sm font-bold uppercase tracking-wide text-sky-800">
                  {game.subject} · Ages {game.ageRange.min}–{game.ageRange.max}
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  {game.title}
                </h2>
                <p className="mt-2 flex-1 text-slate-700">{game.summary}</p>
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  About {game.estimatedMinutes} minutes · No timer
                </p>
                <button
                  type="button"
                  onClick={() => onLaunch(game)}
                  className="mt-4 min-h-12 rounded-2xl bg-emerald-700 px-5 py-3 text-lg font-black text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                  aria-label={`Play ${game.title}`}
                >
                  Play game
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
