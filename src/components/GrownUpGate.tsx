import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';

/** A local instruction-following barrier, not authentication or age verification.
 * No name, age, password or response is saved; every mounting starts locked. */
export default function GrownUpGate({ children, purpose = 'Open the grown-up area', cancel }: {
  children: ReactNode;
  purpose?: string;
  cancel?: ReactNode;
}) {
  const id=useId();
  const [unlocked,setUnlocked]=useState(false);
  const [answer,setAnswer]=useState('');
  const [error,setError]=useState('');
  const input=useRef<HTMLInputElement>(null);
  const content=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(unlocked)content.current?.focus();},[unlocked]);
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(answer.trim().toLowerCase().replace(/\s+/g,' ')==='privacy choose'){
      setAnswer('');setError('');setUnlocked(true);
    } else {
      setError('Please follow the written instruction, or ask a grown-up to help.');
      input.current?.focus();
    }
  }
  if(unlocked)return <div ref={content} className="grown-up-unlocked" tabIndex={-1} aria-label="Grown-up area">{children}</div>;
  return <section className="a-panel grown-up-gate" aria-labelledby={id+'-title'}>
    <h2 id={id+'-title'}>A grown-up needs to help here</h2>
    <p>{purpose}. Please hand the device to the adult looking after this learning session.</p>
    <form onSubmit={submit} aria-labelledby={id+'-title'}>
      <p id={id+'-notice'}><strong>Adults choose online settings after reviewing privacy</strong></p>
      <p id={id+'-instruction'}>Grown-up instruction: enter the <strong>last word</strong> of the bold sentence, then its <strong>second word</strong>, separated by a space.</p>
      <label className="a-field" htmlFor={id+'-answer'}>Grown-up answer
        <input ref={input} id={id+'-answer'} value={answer} onChange={event=>{setAnswer(event.target.value);setError('');}} type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} required aria-describedby={id+'-instruction'+(error?' '+id+'-error':'')} aria-invalid={Boolean(error)}/>
      </label>
      {error && <p id={id+'-error'} role="alert">{error}</p>}
      <div className="a-actions"><button className="a-button" type="submit">Continue with a grown-up</button>{cancel}</div>
    </form>
  </section>;
}
