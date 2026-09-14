/** Illustration timing, deliberately not physical periods or distances. */
export const PLANETS = [
  { name: 'Mercury', color: '#bcb6ad', radius: 74, size: 7, period: 24, phase: 20, fact: 'Mercury is the closest planet to the Sun.' },
  { name: 'Venus', color: '#ecc083', radius: 110, size: 10, period: 34, phase: 135, fact: 'Venus is the hottest planet in our solar system.' },
  { name: 'Earth', color: '#42b7f5', radius: 150, size: 12, period: 46, phase: 275, fact: 'Earth is our home. It spins west to east, and it travels around the Sun.' },
  { name: 'Mars', color: '#ef886d', radius: 190, size: 9, period: 60, phase: 65, fact: 'Mars is often called the Red Planet.' },
  { name: 'Jupiter', color: '#e8b38d', radius: 232, size: 21, period: 84, phase: 195, fact: 'Jupiter is the biggest planet in our solar system.' },
  { name: 'Saturn', color: '#f2d5a0', radius: 275, size: 17, period: 110, phase: 325, fact: 'Saturn has bright rings made of pieces of ice and rock.' },
  { name: 'Uranus', color: '#9bdfde', radius: 316, size: 14, period: 140, phase: 110, fact: 'Uranus is an ice giant that spins on its side.' },
  { name: 'Neptune', color: '#829bff', radius: 355, size: 14, period: 172, phase: 235, fact: 'Neptune is the farthest planet from the Sun.' },
] as const;

/** SVG y points down: decreasing angles produce counterclockwise screen motion. */
export function progradeDegrees(seconds: number, periodSeconds: number, phase = 0): number {
  return phase - ((seconds % periodSeconds) / periodSeconds) * 360;
}

export function orbitPosition(seconds: number, radius: number, periodSeconds: number, phase = 0) {
  const angle = progradeDegrees(seconds, periodSeconds, phase) * Math.PI / 180;
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}
