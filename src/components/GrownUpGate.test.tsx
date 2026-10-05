import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import GrownUpGate from './GrownUpGate';
afterEach(cleanup);
describe('grown-up instruction gate',()=>{
  it('keeps protected controls unmounted after a wrong answer and announces how to retry',async()=>{
    const user=userEvent.setup();
    render(<GrownUpGate><button>Enable online help</button></GrownUpGate>);
    expect(screen.queryByRole('button',{name:'Enable online help'})).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox',{name:'Grown-up answer'}),'12');
    await user.click(screen.getByRole('button',{name:'Continue with a grown-up'}));
    expect(screen.getByRole('alert')).toHaveTextContent('follow the written instruction');
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.queryByRole('button',{name:'Enable online help'})).not.toBeInTheDocument();
  });
  it('supports keyboard-only completion of the native form',async()=>{
    const user=userEvent.setup();
    render(<GrownUpGate><button>Enable online help</button></GrownUpGate>);
    await user.tab(); expect(screen.getByRole('textbox')).toHaveFocus();
    await user.keyboard('Privacy  Choose{Enter}');
    expect(screen.getByRole('button',{name:'Enable online help'})).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Grown-up area')).toHaveFocus();
    await user.tab();expect(screen.getByRole('button',{name:'Enable online help'})).toHaveFocus();
  });
  it('locks again on remount without retaining an answer or unlock in storage',async()=>{
    const user=userEvent.setup(); const initialStorage=localStorage.length;
    const view=render(<GrownUpGate><button>Enable online help</button></GrownUpGate>);
    await user.type(screen.getByRole('textbox'),'privacy choose{Enter}');
    expect(screen.getByRole('button',{name:'Enable online help'})).toBeInTheDocument();
    view.unmount();render(<GrownUpGate><button>Enable online help</button></GrownUpGate>);
    expect(screen.queryByRole('button',{name:'Enable online help'})).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(localStorage.length).toBe(initialStorage);
  });
});
