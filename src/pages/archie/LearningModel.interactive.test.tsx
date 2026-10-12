import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,it,expect} from 'vitest';
import LearningModel from './LearningModel';
afterEach(cleanup);
it('counts remaining subtraction counters and resets for a new question',()=>{
 const view=render(<LearningModel prompt="4 − 2 = ?"/>);
 fireEvent.click(screen.getByRole('button',{name:'Count the next counter'}));
 expect(screen.getByText(/You counted 1/)).toBeInTheDocument();
 expect(document.querySelectorAll('.counter-counted')).toHaveLength(1);
 fireEvent.click(screen.getByRole('button',{name:'Count the next counter'}));
 expect(screen.getByRole('button',{name:'Count the next counter'})).toBeDisabled();
 expect(document.querySelectorAll('.crossed.counter-counted')).toHaveLength(0);
 view.rerender(<LearningModel prompt="2 + 1 = ?"/>);
 expect(document.querySelectorAll('.counter-counted')).toHaveLength(0);
 expect(screen.getByRole('button',{name:'Count the next counter'})).toBeEnabled();
});
