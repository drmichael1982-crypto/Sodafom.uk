import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
vi.mock('@/lib/voice-context',()=>({useVoice:()=>({speak:vi.fn()})}));
vi.mock('@/components/games/ArchieGameHelper',()=>({default:()=>null}));
vi.mock('@/components/games/ArchieReadAloudButton',()=>({default:()=>null}));
import QuizEngine from './QuizEngine';
afterEach(()=>{cleanup();localStorage.clear();});
const questions=[{question:'What is 2 + 2?',options:['4','5'],answer:'4'}];
it('only feeds the snake after the correct answer and keeps that answer visible',()=>{render(<QuizEngine title="Snake test" emoji="🐍" questions={questions} onComplete={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'4'}));expect(screen.getByRole('status').textContent).toContain('gobbling');expect(screen.getByRole('button',{name:'4'}).className).toContain('snake-right-answer');expect(screen.getByRole('button',{name:'5'}).className).toContain('snake-wrong-answer');});
it('does not reward a wrong answer',()=>{render(<QuizEngine title="Snake test" emoji="🐍" questions={questions} onComplete={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'5'}));expect(screen.queryByRole('status')).toBeNull();});

it('keeps a wrong answer on the question and lets the child correct it with a clue',()=>{render(<QuizEngine title="Second chance" emoji="⭐" questions={questions} onComplete={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'5'}));expect(screen.getByRole('alert')).toHaveTextContent('try a clue');fireEvent.click(screen.getByRole('button',{name:'Try again'}));expect(screen.getByRole('button',{name:'5'})).toBeDisabled();fireEvent.click(screen.getByRole('button',{name:'4'}));expect(screen.getByRole('status')).toHaveTextContent('Correct!');expect(screen.getByLabelText('1 picture pieces earned')).toBeInTheDocument();});

it('gives word quizzes their own monster and keeps wrong attempts unrewarded',()=>{render(<QuizEngine title="Word monster" emoji="👾" answerReward="word-monster" questions={[{question:'Choose the word',options:['cat','cta'],answer:'cat'}]} onComplete={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'cta'}));expect(screen.queryByRole('status')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Try again'}));fireEvent.click(screen.getByRole('button',{name:'cat'}));expect(screen.getByRole('status')).toHaveTextContent('word monster');expect(document.querySelector('.answer-snake')).toHaveTextContent('👾');});
