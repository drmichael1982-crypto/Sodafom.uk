import { useId } from 'react';

/** Place inside the existing grown-up gate. These links do not connect accounts. */
export default function ParentAIResources() {
  const titleId = useId();
  return (
    <section className="a-panel" aria-labelledby={titleId}>
      <h2 id={titleId}>Optional AI tools for parents</h2>
      <p>For grown-ups who want help planning or explaining learning.</p>
      <article className="a-panel">
        <h3>ChatGPT Free</h3>
        <p>
          ChatGPT is an external service with a separate account. Its free plan
          has usage limits. Signing up does not connect Sodafom to ChatGPT or
          supply API credits.
        </p>
        <p>
          Do not include a child’s name, school, contact details or private
          family information. Check AI answers before using them for learning.
        </p>
        <div className="a-actions">
          <a className="a-button" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">
            Open ChatGPT / sign up
          </a>
          <a className="a-button" href="https://learn.chatgpt.com/docs/pricing" target="_blank" rel="noopener noreferrer">
            Compare plans
          </a>
          <a className="a-button" href="https://learn.chatgpt.com/docs/sign-in-with-chatgpt" target="_blank" rel="noopener noreferrer">
            How ChatGPT connections work
          </a>
        </div>
        <p className="a-note">These links open official external websites in a new tab.</p>
      </article>
    </section>
  );
}
