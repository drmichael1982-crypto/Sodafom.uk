import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { BookOpen, Calculator, Castle, Check, ChevronRight, FlaskConical, Play } from "lucide-react";
import { Page } from "./ArchiePages";
import LearningModel from "./LearningModel";
import GrownUpGate from "@/components/GrownUpGate";
import SceneArtwork, { sceneForSubject } from "@/components/SceneArtwork";
import { useArchieData } from "@/lib/archie/storage";
import type { CourseLesson, CourseSubject } from "@/lib/archie/course-types";
import {
  LESSON_BANK,
  SUBJECT_LABELS,
  buildInventory,
  courseActivityId,
  nextIncomplete,
  nextLessonInPath,
  unitsFor,
  type InventoryUnit,
} from "@/lib/archie/lesson-inventory";
import "./courses.css";
import "./teacher-class.css";

const INVENTORY = buildInventory(LESSON_BANK);
const SUBJECT_ICONS: Record<CourseSubject, typeof BookOpen> = {
  maths: Calculator,
  english: BookOpen,
  history: Castle,
  science: FlaskConical,
};

/** Year and subject come from ?year=&subject= so views stay shareable. */
function useLessonChoice() {
  const { settings } = useArchieData();
  const [params, setParams] = useSearchParams();
  const requestedYear = Number(params.get("year"));
  const savedYear = INVENTORY.years.includes(settings.year) ? settings.year : INVENTORY.years[0];
  const year = INVENTORY.years.includes(requestedYear) ? requestedYear : savedYear;
  const requestedSubject = params.get("subject") as CourseSubject | null;
  const subject =
    requestedSubject && INVENTORY.subjects.includes(requestedSubject)
      ? requestedSubject
      : INVENTORY.subjects[0];
  const choose = (nextYear: number, nextSubject: CourseSubject) =>
    setParams({ year: String(nextYear), subject: nextSubject }, { replace: true });
  return { year, subject, choose };
}

function PreviewNotice({ teacher }: { teacher: boolean }) {
  return (
    <aside className="a-panel tc-notice" aria-label="About this preview">
      <h2>School preview</h2>
      <ul>
        <li>This is a local preview. There are no class records and no cloud sync.</li>
        <li>No student tracking: nothing about any pupil is collected or shared.</li>
        <li>
          {teacher
            ? "Lesson plans and answers are for the adult leading the lesson. Do not enter pupil names."
            : "Ticks show lessons finished in this browser on this device only."}
        </li>
        <li>No real pupil data appears here. Any example used to explain this preview is fictional.</li>
      </ul>
    </aside>
  );
}

function DevicePuzzleLearning() {
  const { activities } = useArchieData();
  const puzzles = useMemo(
    () => activities
      .filter((activity) => activity.id.startsWith("history-jigsaw-") || activity.id.startsWith("fraction-jigsaw-year-"))
      .slice()
      .reverse(),
    [activities],
  );
  return (
    <section className="a-panel" aria-labelledby="teacher-puzzle-learning">
      <h2 id="teacher-puzzle-learning">Recent puzzle learning on this device</h2>
      <p className="a-note">This reuses the child’s on-device progress record. It does not create a pupil profile, send data online or award the puzzle twice.</p>
      {puzzles.length ? puzzles.map((activity) => (
        <div className="a-activity" key={activity.id}>
          <strong>{activity.title}</strong>
          <span>{activity.stars} ★ • {new Date(activity.date).toLocaleDateString("en-GB")}</span>
        </div>
      )) : <p>No History or Fraction picture puzzles have been completed on this device yet.</p>}
    </section>
  );
}

function LessonPicker({ year, subject, choose }: ReturnType<typeof useLessonChoice>) {
  return (
    <div className="course-picker tc-picker">
      <label className="a-field">
        School year
        <select value={year} onChange={(event) => choose(Number(event.target.value), subject)}>
          {INVENTORY.years.map((item) => (
            <option key={item} value={item}>
              Year {item}
            </option>
          ))}
        </select>
      </label>
      <div className="a-tabs tc-tabs" role="group" aria-label="Subjects">
        {INVENTORY.subjects.map((item) => {
          const Icon = SUBJECT_ICONS[item] ?? BookOpen;
          return (
            <button
              type="button"
              className="a-button"
              data-subject={item}
              aria-pressed={subject === item}
              onClick={() => choose(year, item)}
              key={item}
            >
              <Icon size={20} aria-hidden="true" /> {SUBJECT_LABELS[item] ?? item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A <details> whose contents only mount while open (keeps 180-lesson years light). */
function LazyDetails({
  summary,
  children,
  className = "",
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: () => ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details className={className} open={open}>
      <summary
        onClick={(event) => {
          event.preventDefault();
          setOpen((value) => !value);
        }}
      >
        {summary}
      </summary>
      {open && children()}
    </details>
  );
}

const lessonLabel = (lesson: CourseLesson) =>
  "Week " + lesson.week + ", day " + lesson.session + " · " + lesson.title;
const weeksLabel = (unit: InventoryUnit) =>
  unit.firstWeek === unit.lastWeek
    ? "Week " + unit.firstWeek
    : "Weeks " + unit.firstWeek + "–" + unit.lastWeek;

function Heading({ year, subject, count }: { year: number; subject: CourseSubject; count: number }) {
  return (
    <h2 className="tc-heading">
      Year {year} {SUBJECT_LABELS[subject]} · {count} lessons
    </h2>
  );
}

/* ───────────────────────────── Teacher view ───────────────────────────── */

function TeacherLessonDetail({ lesson }: { lesson: CourseLesson }) {
  const next = nextLessonInPath(LESSON_BANK, lesson);
  return (
    <div className="tc-detail">
      {lesson.sensitive && (
        <p className="quest-hint">
          <strong>Sensitive topic:</strong> review this lesson before teaching. It opens behind the grown-up check.
        </p>
      )}
      <h4>Objective</h4>
      <p>{lesson.objective}</p>
      <h4>Teaching summary</h4>
      {lesson.teaching.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
      {lesson.vocabulary.length > 0 && (
        <>
          <h4>Vocabulary</h4>
          <dl className="course-vocabulary">
            {lesson.vocabulary.map((item) => (
              <div key={item.word}>
                <dt>{item.word}</dt>
                <dd>{item.meaning}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      <h4>Worked example</h4>
      <p>
        <strong>{lesson.example.prompt}</strong>
      </p>
      {lesson.subject === "maths" && <LearningModel prompt={lesson.example.prompt} />}
      <p>{lesson.example.explanation}</p>
      <h4>Practice questions with answers</h4>
      <ol className="tc-questions">
        {lesson.questions.map((question, i) => (
          <li key={i}>
            <p>{question.prompt}</p>
            <ul className="tc-options">
              {question.options.map((option, index) => (
                <li key={index} className={index === question.answer ? "tc-correct" : undefined}>
                  {option}
                  {index === question.answer && <strong> (correct)</strong>}
                </li>
              ))}
            </ul>
            <p data-testid="teacher-answer">
              <strong>Answer:</strong> {question.options[question.answer]}
            </p>
            <p>
              <strong>Hint:</strong> {question.hint}
            </p>
            <p>
              <strong>Explanation:</strong> {question.explanation}
            </p>
          </li>
        ))}
      </ol>
      <h4>Mission: {lesson.mission.title}</h4>
      <ol>
        {lesson.mission.instructions.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <h4>Reflection</h4>
      <p>{lesson.reflection}</p>
      <div className="a-actions">
        <Link className="a-button" to={"/courses/" + lesson.id}>
          Open lesson <span className="sr-only">: {lesson.title}</span>
        </Link>
        {next ? (
          <Link className="a-button" to={"/courses/" + next.id}>
            Next lesson: {next.title}
          </Link>
        ) : (
          <span className="a-note">End of the Year {lesson.year} {SUBJECT_LABELS[lesson.subject]} path.</span>
        )}
      </div>
    </div>
  );
}

function TeacherLessonList() {
  const choice = useLessonChoice();
  const { year, subject } = choice;
  const units = useMemo(() => unitsFor(year, subject, LESSON_BANK), [year, subject]);
  const count = units.reduce((total, unit) => total + unit.lessons.length, 0);
  return (
    <>
      <LessonPicker {...choice} />
      <section aria-labelledby="tc-teacher-heading" className="tc-list">
        <div id="tc-teacher-heading">
          <Heading year={year} subject={subject} count={count} />
        </div>
        <p className="a-note">
          {units.length} units in week order. Open a unit, then a lesson, to see the full plan with answers.
        </p>
        {units.map((unit) => (
          <LazyDetails
            key={year + subject + unit.firstWeek + unit.unit}
            className="a-panel tc-unit"
            summary={
              <>
                <strong>{unit.unit}</strong> <span className="tc-meta">{weeksLabel(unit)} · {unit.lessons.length} lessons</span>
              </>
            }
          >
            {() => (
              <ul className="tc-lessons">
                {unit.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <LazyDetails
                      className="tc-lesson"
                      summary={
                        <>
                          <strong>{lessonLabel(lesson)}</strong>
                          <span className="tc-objective">{lesson.objective}</span>
                        </>
                      }
                    >
                      {() => <TeacherLessonDetail lesson={lesson} />}
                    </LazyDetails>
                  </li>
                ))}
              </ul>
            )}
          </LazyDetails>
        ))}
      </section>
    </>
  );
}

export function TeacherLessons() {
  return (
    <Page
      title="Teacher lessons"
      back="/"
      intro="Every lesson by subject and year, including Maths, with answers for teachers."
      calm
    >
      <PreviewNotice teacher />
      <GrownUpGate
        purpose="Open teacher lesson plans, which include answers"
        cancel={
          <Link className="a-button" to="/class">
            Go to class lessons
          </Link>
        }
      >
        <DevicePuzzleLearning />
        <TeacherLessonList />
      </GrownUpGate>
      <p className="a-note">
        Looking for the pupil view? <Link to="/class">Open class lessons</Link> (no answers shown).
      </p>
    </Page>
  );
}

/* ────────────────────────────── Class view ────────────────────────────── */

export function ClassLessons() {
  const choice = useLessonChoice();
  const { year, subject } = choice;
  const { activities } = useArchieData();
  const completed = useMemo(() => new Set(activities.map((activity) => activity.id)), [activities]);
  const units = useMemo(() => unitsFor(year, subject, LESSON_BANK), [year, subject]);
  const all = units.flatMap((unit) => unit.lessons);
  const done = all.filter((lesson) => completed.has(courseActivityId(lesson.id))).length;
  const next = nextIncomplete(year, subject, completed, LESSON_BANK);
  const target = next ?? all[0];
  const nextLabel = !next ? "Practise again" : done === 0 ? "Start lesson" : "Continue next lesson";
  const SubjectIcon = SUBJECT_ICONS[subject] ?? BookOpen;
  return (
    <Page title="Class lessons" back="/" intro="Choose your year and subject, then start the next lesson." scene={sceneForSubject(subject)}>
      <div className="tc-class" data-subject={subject}>
      <LessonPicker {...choice} />
      {target && (
        <section className="a-panel course-next tc-class-next" aria-labelledby="tc-next-heading">
          <SceneArtwork scene={sceneForSubject(subject)} title={target.title} compact />
          <div className="tc-next-copy">
            <span className="a-eyebrow">
              Year {year} · {SUBJECT_LABELS[subject]}
            </span>
            <h2 id="tc-next-heading">{next ? "Next lesson" : "Every lesson finished on this device"}</h2>
            <p>{lessonLabel(target)}</p>
            <label className="quest-progress">
              {done} of {all.length} lessons finished on this device
              <progress value={done} max={all.length} />
            </label>
          </div>
          <Link className="a-button tc-next-action" to={"/courses/" + target.id} data-testid="class-next">
            <Play size={20} aria-hidden="true" /> {nextLabel}: {target.title}
          </Link>
        </section>
      )}
      <section aria-labelledby="tc-class-heading" className="tc-list">
        <div id="tc-class-heading">
          <Heading year={year} subject={subject} count={all.length} />
        </div>
        {units.map((unit, unitIndex) => {
          const unitDone = unit.lessons.filter((lesson) => completed.has(courseActivityId(lesson.id))).length;
          return (
            <LazyDetails
              key={year + subject + unit.firstWeek + unit.unit}
              className="a-panel tc-unit"
              defaultOpen={unit.lessons.some((lesson) => lesson.id === target?.id)}
              summary={
                <>
                  <span className="tc-unit-heading">
                    <span className="tc-unit-icon" aria-hidden="true"><SubjectIcon size={22} /><small>{unitIndex + 1}</small></span>
                    <strong>{unit.unit}</strong>
                  </span>{" "}
                  <span className="tc-meta">
                    {weeksLabel(unit)} · {unitDone} of {unit.lessons.length} finished
                  </span>
                </>
              }
            >
              {() => (
                <ul className="tc-lessons">
                  {unit.lessons.map((lesson) => {
                    const finished = completed.has(courseActivityId(lesson.id));
                    return (
                      <li key={lesson.id}>
                        <Link className="course-lesson-link" to={"/courses/" + lesson.id} data-finished={finished} data-next={lesson.id === target?.id}>
                          <span className="course-step-icon" aria-hidden="true">
                            {finished ? <Check /> : lesson.id === target?.id ? <Play /> : <SubjectIcon />}
                          </span>
                          <span>
                            <strong>{lessonLabel(lesson)}</strong>
                            <small>
                              {lesson.objective}
                              {finished ? " · finished" : ""}
                            </small>
                          </span>
                          <span className="sr-only">{finished ? "Practise again" : "Start lesson"}</span>
                          <ChevronRight size={18} aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </LazyDetails>
          );
        })}
      </section>
      <p className="a-note">
        Teachers: <Link to="/teacher">open teacher lessons</Link> (grown-up check, includes answers).
      </p>
      <details className="tc-preview-disclosure">
        <summary>About this school preview and device-only progress</summary>
        <PreviewNotice teacher={false} />
      </details>
      </div>
    </Page>
  );
}

export default TeacherLessons;
