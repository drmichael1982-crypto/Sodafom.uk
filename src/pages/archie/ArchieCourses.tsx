import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  BookOpen,
  Calculator,
  Castle,
  FlaskConical,
  Check,
  ChevronRight,
  Flag,
  KeyRound,
  Pause,
  Play,
  Star,
  Volume2,
} from "lucide-react";
import { Page } from "./ArchiePages";
import { useArchieData } from "@/lib/archie/storage";
import { useArchieContext } from "@/contexts/ArchieContext";
import { useVoice } from "@/lib/voice-context";
import {
  COURSE_PHASES,
  type CourseLesson,
  type CourseSubject,
} from "@/lib/archie/course-types";
import { MATHS_LESSONS } from "@/lib/archie/maths-course";
import { HISTORY_LESSONS } from "@/lib/archie/history-course";
import { ENGLISH_LESSONS } from "@/lib/archie/english-course";
import { SCIENCE_LESSONS } from "@/lib/archie/science-course";
import {
  blankCourseProgress,
  clearCourseProgress,
  readCourseProgress,
  saveCourseProgress,
} from "@/lib/archie/course-progress";
import "./courses.css";
import LearningModel from "./LearningModel";
import GrownUpGate from "@/components/GrownUpGate";
import {
  listenForGameAnswer,
  normaliseVoiceAnswer,
} from "@/lib/archie/game-voice";
import { nextLessonInPath } from "@/lib/archie/course-sequence";
import {
  revealsAnswer,
  subjectMethod,
  type LessonCoachContext,
  type LessonPhase,
} from "@/lib/archie/lesson-coach";

export const COURSE_LESSONS = [
  ...MATHS_LESSONS,
  ...HISTORY_LESSONS,
  ...ENGLISH_LESSONS,
  ...SCIENCE_LESSONS,
];
const SUBJECTS = {
  maths: "Maths",
  history: "History",
  english: "English",
  science: "Science",
};
const savedId = (id: string) => "course-" + id;
const PHASE_KEYS: LessonPhase[] = [
  "discover",
  "example",
  "practice",
  "mission",
  "reflection",
];
export default function ArchieCourses() {
  const { lessonId } = useParams();
  const lesson = lessonId
    ? COURSE_LESSONS.find((item) => item.id === lessonId)
    : undefined;
  if (lessonId && !lesson)
    return (
      <Page title="Let's find your adventure">
        <p className="a-panel">
          This lesson is not in this learning path. Choose a lesson from your
          year.
        </p>
        <Link className="a-button" to="/courses">
          Find a lesson
        </Link>
      </Page>
    );
  return lesson ? (
    <CoursePlayer key={lesson.id} lesson={lesson} />
  ) : (
    <CourseLibrary />
  );
}
function CourseLibrary() {
  const { settings, activities } = useArchieData();
  const [params, setParams] = useSearchParams();
  const requestedYear = Number(params.get("year"));
  const year =
    Number.isInteger(requestedYear) && requestedYear >= 1 && requestedYear <= 9
      ? requestedYear
      : settings.year;
  const requestedSubject = params.get("subject") as CourseSubject;
  const subject: CourseSubject = Object.hasOwn(SUBJECTS, requestedSubject)
    ? requestedSubject
    : "maths";
  const lessons = COURSE_LESSONS.filter(
    (item) => item.year === year && item.subject === subject,
  );
  const completed = new Set(activities.map((activity) => activity.id));
  const finished = lessons.filter((lesson) =>
    completed.has(savedId(lesson.id)),
  ).length;
  const next =
    lessons.find((lesson) => !completed.has(savedId(lesson.id))) ?? lessons[0];
  const setChoice = (nextYear: number, nextSubject: CourseSubject) =>
    setParams({ year: String(nextYear), subject: nextSubject });
  return (
    <Page
      title="Your learning adventures"
      intro="A little discovery, a little practice, and a mission of your own. Archie is ready when you are."
    >
      <div className="course-picker">
        <label className="a-field">
          Choose your school year
          <select
            value={year}
            onChange={(event) => setChoice(Number(event.target.value), subject)}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Year {i + 1} · ages {i + 5}–{i + 6}
              </option>
            ))}
          </select>
        </label>
        <div className="a-tabs" aria-label="Learning subjects">
          {(["maths", "history", "english", "science"] as const).map((item) => (
            <button
              className="a-button"
              aria-pressed={subject === item}
              onClick={() => setChoice(year, item)}
              key={item}
            >
              {item === "maths" ? (
                <Calculator size={20} />
              ) : item === "history" ? (
                <Castle size={20} />
              ) : item === "science" ? (
                <FlaskConical size={20} />
              ) : (
                <BookOpen size={20} />
              )}{" "}
              {SUBJECTS[item]}
            </button>
          ))}
        </div>
      </div>
      <section className="a-panel course-next" aria-label="Your next adventure">
        <div>
          <span className="a-eyebrow">
            Year {year} · {SUBJECTS[subject]}
          </span>
          <h2>
            {finished === lessons.length
              ? "You explored every lesson!"
              : "Your next adventure"}
          </h2>
          <p>{next.title}</p>
          <p className="a-note">
            36 teaching weeks · {lessons.length} lessons · planned for 30
            minutes each
          </p>
          <label className="quest-progress">
            {finished} of {lessons.length} adventures completed
            <progress value={finished} max={lessons.length} />
          </label>
        </div>
        <Link className="a-button" to={"/courses/" + next.id}>
          <Play size={20} />{" "}
          {finished === lessons.length ? "Practise again" : "Start or continue"}
          <ChevronRight size={20} />
        </Link>
      </section>
      <p className="a-note">
        Choose any lesson, or follow the path in order. Your stars and place are
        saved on this device when storage is available.
      </p>
      <section className="a-panel course-current-week">
        <h2>This week · week {next.week}</h2>
        <p>{next.unit}</p>
        <div className="course-week-lessons">
          {lessons
            .filter((item) => item.week === next.week)
            .map((item) => (
              <Link
                className="course-lesson-link"
                key={item.id}
                to={"/courses/" + item.id}
              >
                <span className="course-step-icon" aria-hidden="true">
                  {completed.has(savedId(item.id)) ? <Check /> : <BookOpen />}
                </span>
                <span>
                  <strong>
                    {subject === "maths" ? "Day " + item.session + " · " : ""}
                    {item.title}
                  </strong>
                  <small>
                    30-minute{" "}
                    {item.sensitive ? "learning session" : "adventure"}
                  </small>
                </span>
                <ChevronRight size={18} />
              </Link>
            ))}
        </div>
      </section>
      <h2>Browse the whole year</h2>
      {[0, 1, 2].map((term) => (
        <details className="a-panel course-term" key={term}>
          <summary>
            Term {term + 1} · weeks {term * 12 + 1}–{term * 12 + 12}
          </summary>
          {Array.from({ length: 12 }, (_, i) => term * 12 + i + 1).map(
            (week) => (
              <section className="course-week" key={week}>
                <h3>
                  Week {week} ·{" "}
                  {lessons.find((item) => item.week === week)?.unit}
                </h3>
                <div className="course-week-lessons">
                  {lessons
                    .filter((item) => item.week === week)
                    .map((item) => (
                      <Link
                        className="course-lesson-link"
                        to={"/courses/" + item.id}
                        key={item.id}
                      >
                        <span className="course-step-icon" aria-hidden="true">
                          {completed.has(savedId(item.id)) ? (
                            <Check />
                          ) : item.sensitive ? (
                            <BookOpen />
                          ) : (
                            <KeyRound />
                          )}
                        </span>
                        <span>
                          <strong>
                            {subject === "maths"
                              ? "Day " + item.session + " · "
                              : ""}
                            {item.title}
                          </strong>
                          <small>
                            30-minute{" "}
                            {item.sensitive ? "learning session" : "adventure"}
                            {completed.has(savedId(item.id))
                              ? " · completed"
                              : ""}
                          </small>
                        </span>
                        <ChevronRight size={18} />
                      </Link>
                    ))}
                </div>
              </section>
            ),
          )}
        </details>
      ))}
      <details className="a-panel">
        <summary>For grown-ups: pace and curriculum</summary>
        <p>
          This programme provides 360 lessons per school year: 180 maths, 108
          English, 36 history and 36 science sessions. Across Years 1–9, that is
          3,240 lessons. The suggested 36-week pace is five maths, three
          English, one history and one science session each week. Each 30-minute
          plan includes reading, conversation and practical work; children can
          take more time, pause or stop whenever they need.
        </p>
        <p>
          England's programmes of study guide the content. Some objectives are
          grouped across years or a whole key stage, so our year allocation is a
          suggested teaching order, including Years 7–9. Year 9 includes
          children who start that school year aged 13. Local-history
          investigations need a grown-up to choose a suitable place or source.
          This is a learning resource requiring teacher review, not a guarantee
          that every statutory requirement has been met.
        </p>
        <p>
          For younger children, work together and read the activity aloud. Avoid
          entering a child's name, school or personal information.
        </p>
        <details>
          <summary>Open the external source with a grown-up</summary>
          <GrownUpGate
            key={next.source}
            purpose="Review a link that opens outside the learning app"
          >
            <a href={next.source} target="_blank" rel="noopener noreferrer">
              Read the curriculum or evidence source for this unit
            </a>
          </GrownUpGate>
        </details>
      </details>
    </Page>
  );
}
export function CoursePlayer({ lesson }: { lesson: CourseLesson }) {
  if (lesson.sensitive)
    return (
      <GrownUpGate
        key={lesson.id}
        purpose="Review this sensitive history lesson and learn together"
        cancel={
          <Link
            className="a-button"
            to={"/courses?year=" + lesson.year + "&subject=" + lesson.subject}
          >
            Back to my learning path
          </Link>
        }
      >
        <CourseSession lesson={lesson} />
      </GrownUpGate>
    );
  return <CourseSession lesson={lesson} />;
}
function CourseSession({ lesson }: { lesson: CourseLesson }) {
  const { complete, activities } = useArchieData();
  const { setGameContext, clearGameContext } = useArchieContext();
  const { speak, stop } = useVoice();
  const [progress, setProgress] = useState(() =>
    readCourseProgress(lesson.id, lesson.questions.length),
  );
  const [paused, setPaused] = useState(false);
  const [hint, setHint] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [storageOkay, setStorageOkay] = useState(true);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nextQuestionRef = useRef<HTMLButtonElement>(null);
  const answeredButtonRef = useRef<HTMLButtonElement | null>(null);
  const sensitive = lesson.sensitive === true;
  const phase = Math.min(progress.phase, 4);
  const finished = progress.phase === 5;
  const question = lesson.questions[progress.question];
  const correct = progress.answers[progress.question] === question.answer;
  const correctCount = lesson.questions.filter(
    (item, i) => progress.answers[i] === item.answer,
  ).length;
  const alreadyEarned = activities.some(
    (activity) => activity.id === savedId(lesson.id),
  );
  const back = "/courses?year=" + lesson.year + "&subject=" + lesson.subject;
  const nextLesson = useMemo(
    () => nextLessonInPath(COURSE_LESSONS, lesson),
    [lesson],
  );
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const wrongAttemptsRef = useRef(0);
  function resetAttempts() {
    wrongAttemptsRef.current = 0;
    setWrongAttempts(0);
  }
  useEffect(() => {
    setStorageOkay(saveCourseProgress(lesson.id, progress));
  }, [lesson.id, progress]);
  useEffect(() => {
    const practising = phase === 2 && !finished;
    const phaseKey: LessonPhase = finished ? "complete" : PHASE_KEYS[phase];
    const details: LessonCoachContext = {
      phase: phaseKey,
      phaseLabel: finished ? "Lesson complete" : COURSE_PHASES[phase].name,
      subject: lesson.subject,
      year: lesson.year,
      objective: lesson.objective,
      keyPoint: lesson.teaching[0],
      vocabulary: lesson.vocabulary.map((item) => item.word),
      workedExample: lesson.example,
      ...(practising
        ? {
            hint: question.hint,
            correctOption: question.options[question.answer],
            answeredCorrectly: correct,
            wrongAttempts,
            ...(correct ? { explanation: question.explanation } : {}),
          }
        : {}),
      ...(phase === 3 && !finished
        ? { missionSteps: lesson.mission.instructions }
        : {}),
      ...(phase === 4 && !finished ? { reflection: lesson.reflection } : {}),
      ...(finished ? { nextLessonTitle: nextLesson?.title ?? null } : {}),
    };
    setGameContext(
      lesson.title,
      SUBJECTS[lesson.subject],
      practising ? question.prompt : lesson.objective,
      practising ? question.options : [],
      details,
    );
    return clearGameContext;
  }, [
    lesson,
    phase,
    finished,
    question,
    correct,
    wrongAttempts,
    nextLesson,
    setGameContext,
    clearGameContext,
  ]);
  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    titleRef.current?.focus();
  }, [progress.phase, progress.question, paused]);
  useEffect(() => {
    if (!correct) return;
    const answeredButton = answeredButtonRef.current;
    answeredButtonRef.current = null;
    // Only continue focus from an answer activated while it held focus.
    // Tutor submissions must keep focus in the helper, even if practice updates.
    if (
      answeredButton &&
      (document.activeElement === answeredButton ||
        document.activeElement === document.body)
    ) {
      nextQuestionRef.current?.focus();
    }
  }, [correct]);
  function movePhase(nextPhase: number) {
    stop();
    setProgress((previous) => ({ ...previous, phase: nextPhase }));
    setFeedback("");
    setHint(false);
    resetAttempts();
  }
  /** Kind retry feedback. After two tries, point back to the worked method, never the answer. */
  function methodNudge(attempts: number) {
    if (attempts < 2) return "";
    const example =
      lesson.example.prompt + " " + lesson.example.explanation;
    const correctOption = question.options[question.answer];
    return (
      " " +
      subjectMethod(lesson.subject) +
      (revealsAnswer(example, correctOption)
        ? ""
        : " Look back at the worked example: " +
          example +
          " Use the same method here.")
    );
  }
  function chooseAnswer(index: number, answerButton?: HTMLButtonElement) {
    if (correct) return;
    if (index === question.answer) {
      answeredButtonRef.current =
        answerButton && document.activeElement === answerButton
          ? answerButton
          : null;
      setProgress((previous) => {
        const answers = [...previous.answers];
        answers[previous.question] = index;
        return { ...previous, answers };
      });
      setFeedback(
        (sensitive ? "Well explained. " : "You found a key! ") +
          question.explanation,
      );
    } else {
      const attempts = wrongAttemptsRef.current + 1;
      wrongAttemptsRef.current = attempts;
      setWrongAttempts(attempts);
      setHint(true);
      setFeedback(
        "Not quite yet, and that is okay. Take another look at the hint, then have another go." +
          methodNudge(attempts),
      );
    }
  }
  function nextQuestion() {
    stop();
    setHint(false);
    setFeedback("");
    resetAttempts();
    if (progress.question + 1 === lesson.questions.length) movePhase(3);
    else
      setProgress((previous) => ({
        ...previous,
        question: previous.question + 1,
      }));
  }
  useEffect(
    () =>
      listenForGameAnswer(lesson.title, (text) => {
        if (phase !== 2 || finished || paused || correct) return;
        const answer = normaliseVoiceAnswer(text);
        const index = question.options.findIndex(
          (option) => normaliseVoiceAnswer(option) === answer,
        );
        if (index < 0) return;
        chooseAnswer(index);
        return index === question.answer
          ? "Well done. " + question.explanation
          : "Not quite yet. Have another go. " +
              question.hint +
              methodNudge(wrongAttemptsRef.current);
      }),
    [lesson.title, phase, finished, paused, correct, question],
  );
  function finish() {
    complete({
      id: savedId(lesson.id),
      kind: "lesson",
      title: lesson.title + " · Year " + lesson.year,
      stars: sensitive ? 0 : 2,
    });
    movePhase(5);
  }
  function restart() {
    stop();
    clearCourseProgress(lesson.id);
    setProgress(blankCourseProgress());
    setHint(false);
    setFeedback("");
    resetAttempts();
  }
  const recapNarration =
    "Recap. Today's goal: " +
    lesson.objective +
    ". " +
    lesson.vocabulary
      .slice(0, 3)
      .map((item) => item.word + ": " + item.meaning)
      .join(". ") +
    (lesson.teaching[0] ? ". " + lesson.teaching[0] : "");
  const narration =
    phase === 0
      ? lesson.objective + ". " + lesson.teaching.join(" ")
      : phase === 1
        ? lesson.example.prompt + ". " + lesson.example.explanation
        : phase === 2
          ? question.prompt + ". " + question.options.join(". ")
          : phase === 3
            ? lesson.mission.title +
              ". " +
              lesson.mission.instructions.join(". ")
            : lesson.reflection;
  return (
    <Page
      title={lesson.title}
      calm={sensitive}
      intro={
        "Year " +
        lesson.year +
        " · " +
        SUBJECTS[lesson.subject] +
        " · week " +
        lesson.week +
        (lesson.subject === "maths" ? ", day " + lesson.session : "")
      }
    >
      <div className="a-actions">
        <Link className="a-button" to={back}>
          <BookOpen size={20} /> My learning path
        </Link>
        {!finished && (
          <button
            className="a-button"
            onClick={() => {
              stop();
              setPaused(true);
            }}
          >
            <Pause size={20} /> Take a breather
          </button>
        )}
      </div>
      {!storageOkay && (
        <p role="status" className="quest-hint">
          Your browser cannot save your place right now. You can keep learning,
          but this place may be lost when you close the page.
        </p>
      )}
      <ol className="course-trail" aria-label="30-minute lesson plan">
        {COURSE_PHASES.map((item, i) => (
          <li
            className={
              progress.phase > i
                ? "complete"
                : progress.phase === i
                  ? "current"
                  : ""
            }
            key={item.name}
            aria-current={progress.phase === i ? "step" : undefined}
          >
            <span aria-hidden="true">
              {progress.phase > i ? <Check size={18} /> : i + 1}
            </span>
            <strong>{item.name}</strong>
            <small>{item.minutes} min</small>
          </li>
        ))}
      </ol>
      <section
        className="a-panel course-board"
        aria-label={sensitive ? "Learning session" : "Lesson adventure"}
      >
        {paused ? (
          <div className="course-celebration">
            <Pause size={48} />
            <h2 tabIndex={-1} ref={titleRef}>
              Time for a breather
            </h2>
            <p>
              Stretch, look away from the screen or have a drink. Your place is
              kept.
            </p>
            <button className="a-button" onClick={() => setPaused(false)}>
              <Play size={20} />{" "}
              {sensitive ? "Resume my learning session" : "Resume my adventure"}
            </button>
          </div>
        ) : finished ? (
          <div className="course-celebration">
            {!sensitive && (
              <div className="course-earned" aria-hidden="true">
                <Star />
                <Star />
              </div>
            )}
            <h2 ref={titleRef} tabIndex={-1}>
              {sensitive ? "Learning session complete" : "Adventure complete!"}
            </h2>
            <p>
              {sensitive
                ? "Your learning record is saved. Take time to reflect or talk with a trusted grown-up."
                : alreadyEarned
                  ? "Your two adventure stars are saved. You can always practise again."
                  : "Well done for exploring and trying."}
            </p>
            <p>Tell someone one new thing you learned.</p>
            <section className="quest-hint course-recap" aria-label="Lesson recap">
              <h3>Recap</h3>
              <p>
                <strong>Today's goal:</strong> {lesson.objective}
              </p>
              {lesson.vocabulary.length > 0 && (
                <ul>
                  {lesson.vocabulary.slice(0, 3).map((item) => (
                    <li key={item.word}>
                      <strong>{item.word}</strong>: {item.meaning}
                    </li>
                  ))}
                </ul>
              )}
              {lesson.teaching[0] && (
                <p>
                  <strong>Key point:</strong> {lesson.teaching[0]}
                </p>
              )}
              <button
                className="a-button"
                onClick={() => speak("read:course", recapNarration)}
              >
                <Volume2 size={20} /> Read the recap
              </button>
            </section>
            {nextLesson ? (
              <div className="a-actions">
                <Link
                  className="a-button"
                  to={"/courses/" + nextLesson.id}
                  onClick={() => stop()}
                >
                  Next lesson: {nextLesson.title} <ChevronRight size={20} />
                </Link>
              </div>
            ) : (
              <div className="a-panel" role="note" aria-label="End of this path">
                <p>
                  <strong>
                    You have reached the end of the Year {lesson.year}{" "}
                    {SUBJECTS[lesson.subject]} path.
                  </strong>{" "}
                  You can review any lesson from this year, or choose another
                  subject.
                </p>
                <div className="a-actions">
                  <Link className="a-button" to={back}>
                    Review this year's lessons
                  </Link>
                  {(Object.keys(SUBJECTS) as CourseSubject[])
                    .filter((item) => item !== lesson.subject)
                    .map((item) => (
                      <Link
                        className="a-button"
                        key={item}
                        to={"/courses?year=" + lesson.year + "&subject=" + item}
                      >
                        Choose {SUBJECTS[item]}
                      </Link>
                    ))}
                </div>
              </div>
            )}
            <div className="a-actions">
              <Link className="a-button" to={back}>
                {sensitive
                  ? "Back to my learning path"
                  : "Choose a different adventure"}
              </Link>
              {!sensitive && (
                <Link className="a-button" to="/rewards">
                  See my stars
                </Link>
              )}
              <button className="a-button" onClick={restart}>
                Practise this again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="course-board-heading">
              <div>
                <span className="a-eyebrow">
                  {sensitive ? "Part" : "Camp"} {phase + 1} of 5 · about{" "}
                  {COURSE_PHASES[phase].minutes} minutes
                </span>
                <h2 ref={titleRef} tabIndex={-1}>
                  {COURSE_PHASES[phase].name}
                </h2>
              </div>
              <button
                className="a-button"
                onClick={() => speak("read:course", narration)}
              >
                <Volume2 size={20} /> Read this part
              </button>
            </div>
            {phase === 0 && (
              <>
                <p className="course-goal">
                  <Flag size={22} />
                  <strong>Today's discovery: {lesson.objective}</strong>
                </p>
                {lesson.teaching.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                <dl className="course-vocabulary">
                  {lesson.vocabulary.map((item) => (
                    <div key={item.word}>
                      <dt>{item.word}</dt>
                      <dd>{item.meaning}</dd>
                    </div>
                  ))}
                </dl>
                <p className="a-note">
                  Take time to read or listen. Explain the new words in your own
                  way.
                </p>
                <button className="a-button" onClick={() => movePhase(1)}>
                  Let's try together <ChevronRight size={20} />
                </button>
              </>
            )}
            {phase === 1 && (
              <>
                <h3>{lesson.example.prompt}</h3>
                {lesson.subject === "maths" && (
                  <LearningModel prompt={lesson.example.prompt} />
                )}
                <div className="quest-hint">
                  <strong>Archie thinks it through</strong>
                  <p>{lesson.example.explanation}</p>
                </div>
                <p>
                  Try explaining that back to Archie or a grown-up. You can draw
                  or use objects to help.
                </p>
                <button className="a-button" onClick={() => movePhase(2)}>
                  {sensitive
                    ? "Try the understanding checks"
                    : "Ready to find some keys"}{" "}
                  {!sensitive && <KeyRound size={20} />}
                </button>
              </>
            )}
            {phase === 2 && (
              <>
                {sensitive ? (
                  <p>
                    {correctCount} of {lesson.questions.length} understanding
                    checks completed
                  </p>
                ) : (
                  <div
                    className="course-keys"
                    aria-label={
                      correctCount +
                      " of " +
                      lesson.questions.length +
                      " practice keys found"
                    }
                  >
                    {lesson.questions.map((item, i) => (
                      <span
                        className={
                          progress.answers[i] === item.answer ? "found" : ""
                        }
                        key={i}
                        aria-hidden="true"
                      >
                        <KeyRound size={24} />
                      </span>
                    ))}
                  </div>
                )}
                <p className="a-note">
                  Challenge {progress.question + 1} of {lesson.questions.length}
                  . Take your time. A hint is always here.
                </p>
                <h3>{question.prompt}</h3>
                <div
                  className="quest-options"
                  role="group"
                  aria-label="Choose an answer"
                >
                  {question.options.map((option, index) => (
                    <button
                      className="a-button"
                      key={index}
                      disabled={correct}
                      onClick={(event) =>
                        chooseAnswer(index, event.currentTarget)
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="a-actions">
                  <button
                    className="a-button course-hint-button"
                    aria-expanded={hint}
                    aria-controls="course-hint"
                    onClick={() => setHint((value) => !value)}
                  >
                    {hint ? "Hide hint" : "Archie, give me a hint"}
                  </button>
                </div>
                {hint && (
                  <div id="course-hint">
                    <p className="quest-hint">{question.hint}</p>
                    {lesson.subject === "maths" && (
                      <LearningModel prompt={question.prompt} />
                    )}
                  </div>
                )}
                <p role="status" className="quest-feedback">
                  {feedback ||
                    (correct
                      ? "Your answer is correct. " + question.explanation
                      : "")}
                </p>
                {correct && (
                  <button
                    ref={nextQuestionRef}
                    className="a-button"
                    onClick={nextQuestion}
                  >
                    {progress.question + 1 === lesson.questions.length
                      ? sensitive
                        ? "Continue to the reflection activity"
                        : "All keys found · mission time"
                      : sensitive
                        ? "Next question"
                        : "Next key"}
                    <ChevronRight size={20} />
                  </button>
                )}
              </>
            )}
            {phase === 3 && (
              <>
                <h3>{lesson.mission.title}</h3>
                <p>
                  Now make, draw, investigate or explain. You can use paper and
                  a pencil. Work with a grown-up when you need help.
                </p>
                <div className="course-mission">
                  {lesson.mission.instructions.map((instruction, index) => (
                    <label key={index} className="a-check">
                      <input
                        type="checkbox"
                        checked={progress.missions.includes(index)}
                        onChange={(event) =>
                          setProgress((previous) => ({
                            ...previous,
                            missions: event.target.checked
                              ? [...previous.missions, index]
                              : previous.missions.filter(
                                  (item) => item !== index,
                                ),
                          }))
                        }
                      />
                      <span>{instruction}</span>
                    </label>
                  ))}
                </div>
                <p className="a-note">
                  Tick each step when you have tried it. Talking or drawing your
                  idea is fine too.
                </p>
                <button
                  className="a-button"
                  disabled={lesson.mission.instructions.some(
                    (_, i) => !progress.missions.includes(i),
                  )}
                  onClick={() => movePhase(4)}
                >
                  I tried my mission <Flag size={20} />
                </button>
              </>
            )}
            {phase === 4 && (
              <>
                <h3>{lesson.reflection}</h3>
                <p>
                  Tell Archie, a grown-up or yourself what you think. You can
                  draw your answer. There is no need to type private
                  information.
                </p>
                <div
                  className="quest-options"
                  role="group"
                  aria-label={
                    sensitive
                      ? "How did this learning session feel?"
                      : "How did your adventure feel?"
                  }
                >
                  {[
                    "I can explain a new thing",
                    "I would like more practice",
                    "I want to explore more",
                  ].map((item) => (
                    <button
                      key={item}
                      className="a-button"
                      aria-pressed={progress.reflection === item}
                      onClick={() =>
                        setProgress((previous) => ({
                          ...previous,
                          reflection: item,
                        }))
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {progress.reflection === "I would like more practice" && (
                  <p className="quest-hint">
                    {sensitive
                      ? "You can revisit this learning session with a trusted grown-up when you are ready."
                      : "Practice helps our brains grow. You can repeat the adventure any time, and Archie will keep the hints ready."}
                  </p>
                )}
                <div className="a-actions">
                  <button
                    className="a-button"
                    disabled={!progress.reflection}
                    onClick={finish}
                  >
                    {sensitive
                      ? "Finish my learning session"
                      : "Finish my adventure · 2 stars"}{" "}
                    {!sensitive && <Star size={20} />}
                  </button>
                  <button className="a-button" onClick={() => movePhase(0)}>
                    Look back at the discovery
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </section>
      <details className="a-panel course-source">
        <summary>For grown-ups: this lesson</summary>
        <p>
          Suggested 30-minute pace, including conversation and the practical
          mission. Pause whenever needed. Completion records participation in
          this resource; it is not a formal assessment of mastery.
        </p>
        <details>
          <summary>Open the external source with a grown-up</summary>
          <GrownUpGate
            key={lesson.source}
            purpose="Review a link that opens outside the learning app"
          >
            <a href={lesson.source} target="_blank" rel="noopener noreferrer">
              Curriculum or historical evidence source
            </a>
          </GrownUpGate>
        </details>
      </details>
    </Page>
  );
}
