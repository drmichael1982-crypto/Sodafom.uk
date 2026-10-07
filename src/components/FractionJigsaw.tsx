import { useState } from 'react';
import { useArchieData } from '@/lib/archie/storage';
import './fraction-jigsaw.css';

type FractionTask = readonly [numerator: number, denominator: number];

const YEAR_1_TASKS: FractionTask[] = [[1, 2], [1, 4]];
const YEAR_2_TASKS: FractionTask[] = [[1, 3], [1, 2], [1, 4], [2, 4], [3, 4]];
const LATER_TASKS: FractionTask[] = [[1, 8], [1, 2], [1, 4], [3, 4], [2, 8], [3, 8]];

export function fractionTasksForYear(year: number): FractionTask[] {
  if (year <= 1) return YEAR_1_TASKS;
  if (year === 2) return YEAR_2_TASKS;
  return LATER_TASKS;
}

const READY = 'Tap equal sections to fit them into the circle.';

export default function FractionJigsaw({ year = 1 }: { year?: number }) {
  const tasks = fractionTasksForYear(year);
  const [round, setRound] = useState(0);
  const [pieces, setPieces] = useState<number[]>([]);
  const [notice, setNotice] = useState(READY);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const { complete } = useArchieData();
  const [numerator, denominator] = tasks[round % tasks.length];

  function toggle(index: number) {
    if (done || paused) return;
    setPieces(previous => previous.includes(index)
      ? previous.filter(piece => piece !== index)
      : [...previous, index]);
    setNotice('Check your fraction when you are ready.');
  }

  function check() {
    if (paused) return;
    if (pieces.length === numerator) {
      setDone(true);
      setNotice(`It fits! ${numerator} out of ${denominator} equal sections makes ${numerator}/${denominator}.`);
      if (round === tasks.length - 1) {
        complete({
          id: `fraction-jigsaw-year-${year}`,
          kind: 'lesson',
          title: `Year ${year} fraction picture puzzles`,
          stars: 1,
        });
      }
      return;
    }
    setNotice(`You have placed ${pieces.length} sections. The top number tells you how many sections you need. Try again.`);
  }

  function reset(nextRound = round) {
    setRound(nextRound);
    setPieces([]);
    setDone(false);
    setPaused(false);
    setNotice(READY);
  }

  function togglePause() {
    setPaused(value => {
      const next = !value;
      setNotice(next ? 'Puzzle paused. Your fitted sections are still here.' : 'Puzzle resumed. Keep fitting equal sections.');
      return next;
    });
  }

  return <section className="fraction-jigsaw" aria-label="Fraction circle jigsaw">
    <h3>Fit {numerator}/{denominator} into the circle</h3>
    <p>The whole has {denominator} equal sections. Fit {numerator} {numerator === 1 ? 'section' : 'sections'}.</p>
    <p className="fraction-progress">Puzzle {round + 1} of {tasks.length}</p>
    <svg className="fraction-circle" viewBox="0 0 240 240" aria-label={`${denominator} equal sections; ${pieces.length} placed`}>
      {Array.from({ length: denominator }, (_, index) => {
        const start = 2 * Math.PI * index / denominator - Math.PI / 2;
        const end = 2 * Math.PI * (index + 1) / denominator - Math.PI / 2;
        const x = (angle: number) => 120 + 105 * Math.cos(angle);
        const y = (angle: number) => 120 + 105 * Math.sin(angle);
        return <g key={index} role="button" tabIndex={paused ? -1 : 0}
          aria-label={`Fraction section ${index + 1}`} aria-pressed={pieces.includes(index)} aria-disabled={done || paused}
          onClick={() => toggle(index)} onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggle(index);
            }
          }}>
          <path d={`M120 120L${x(start)} ${y(start)}A105 105 0 ${denominator === 1 ? 1 : 0} 1 ${x(end)} ${y(end)}Z`}
            fill={pieces.includes(index) ? '#ffcf54' : '#e4f1fd'} stroke="#173560" strokeWidth="3" />
          <text x={120 + 70 * Math.cos((start + end) / 2)} y={125 + 70 * Math.sin((start + end) / 2)}
            textAnchor="middle" fill="#173560" fontSize="14">{index + 1}</text>
        </g>;
      })}
    </svg>
    <p aria-live="polite">{notice}</p>
    <div>
      <button type="button" aria-pressed={paused} onClick={togglePause}>{paused ? 'Resume puzzle' : 'Pause puzzle'}</button>
      <button type="button" disabled={done || paused} onClick={check}>Check the fraction</button>
      <button type="button" disabled={paused} onClick={() => reset()}>Clear pieces</button>
      {done && <button type="button" disabled={paused} onClick={() => reset((round + 1) % tasks.length)}>
        {round === tasks.length - 1 ? 'Practise the fractions again' : 'Next fraction'}
      </button>}
    </div>
  </section>;
}
