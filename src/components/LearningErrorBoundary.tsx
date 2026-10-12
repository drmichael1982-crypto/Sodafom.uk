import { Component, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
export function LearningRecovery() {
  return (
    <main className="archie-app">
      <section className="a-panel grown-up-gate">
        <h1>Let’s open your learning again</h1>
        <p>
          This activity could not load. The app may have been updated. Try
          reloading, or return home and choose another activity.
        </p>
        <div className="a-actions">
          <button className="a-button" onClick={() => location.reload()}>
            Reload app
          </button>
          <a
            className="a-button"
            href={Capacitor.isNativePlatform() ? "#/" : "/"}
          >
            Back home
          </a>
        </div>
        <p className="a-note">
          Saved lesson progress is kept where browser storage is available.
        </p>
      </section>
    </main>
  );
}
export default class LearningErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <LearningRecovery /> : this.props.children;
  }
}
