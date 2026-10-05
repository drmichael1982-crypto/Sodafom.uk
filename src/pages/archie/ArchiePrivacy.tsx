import { Link } from "react-router";
import { Page } from "./ArchiePages";

export default function ArchiePrivacy() {
  return (
    <Page
      title="School preview privacy information"
      back="/"
      calm
      intro="For children and grown-ups: what this school preview saves and when information can leave the device."
    >
      <section className="a-panel">
        <h2>Keep private details out of learning questions</h2>
        <p>
          You do not need to give Archie your name, school, address, contact
          details or private family information. Ask a trusted grown-up before
          using the microphone or online help.
        </p>
      </section>
      <section className="a-panel">
        <h2>Learning saved in this browser</h2>
        <p>
          Settings, lesson progress and answers, game results, stars, stickers
          and chosen interests are stored in this browser profile on this
          device. Selected Ask Archie question-and-answer pairs are also saved
          locally to help with repeat questions. This preview does not sync
          these records to a child account or a cloud progress service.
        </p>
        <p>
          Anyone using the same browser profile may be able to see these
          records. A grown-up check helps children avoid changing settings by
          accident; it is not a secure account or proof of parental consent.
        </p>
        <p>
          Saved records do not have an automatic time-based expiry. They remain
          until removed, replaced by storage limits, or cleared by the browser.
          Ask Archie memory keeps up to 120 question-and-answer pairs.
        </p>
      </section>
      <section className="a-panel">
        <h2>Optional online learning help</h2>
        <p>
          Online help is off by default. A grown-up can enable{" "}
          <strong>Allow online learning help</strong> in Parents or Settings.
          Built-in maths, spelling and other bundled help can work without that
          option.
        </p>
        <p>
          When online help is enabled and a question needs wider help, the app
          can send the typed or speech-transcribed question, recent chat
          messages and learning context to its server. Context includes the
          activity title, subject, current question, answer choices and an
          approximate age based on the selected school year. The server may use
          its configured local or cloud AI service.
        </p>
        <p>
          This page does not identify an AI provider because a production
          provider and its data terms have not been established here. The school
          preview is not a promise about a provider’s retention, training use or
          location. A grown-up can use <strong>Check AI setup</strong> to check
          connection information. Turn online help off to stop new requests from
          this helper; that does not delete information already received by a
          server or provider.
        </p>
        <p>
          AI answers can be wrong. Check important learning with a grown-up.
        </p>
      </section>
      <section className="a-panel">
        <h2>Microphone and read-aloud</h2>
        <p>
          Microphone input is optional and needs browser permission. Your
          browser or device speech service may process audio online, even when
          the app’s online learning help is off. Its handling of audio depends
          on that browser or service. You can type instead, stop the voice
          conversation, turn sound off, or remove microphone permission in
          browser settings.
        </p>
      </section>
      <section className="a-panel">
        <h2>Homework photos</h2>
        <p>
          The homework helper displays a selected photo locally for the current
          page. It does not upload that photo or read its text automatically in
          this preview. Use <strong>Remove photo</strong> or leave the page to
          remove its preview. Removing the preview does not delete the original
          photo from your device. Type the question if you want help; that typed
          text follows the online-help setting above.
        </p>
      </section>
      <section className="a-panel">
        <h2>Removing saved information</h2>
        <p>
          In Parents or Settings, use{" "}
          <strong>Clear saved Ask Archie memory</strong> to remove the locally
          saved question-and-answer pairs. On the home screen, choose{" "}
          <strong>Personalise</strong> and remove saved interests individually.
        </p>
        <p>
          To remove remaining preview settings, progress and rewards, use your
          browser’s website-data controls for this preview’s address. Clearing
          that data removes the saved learning place and rewards; it does not
          erase the original homework photo or information already sent to an
          online service.
        </p>
        <div className="a-actions">
          <Link className="a-button" to="/parents">
            Parents and learning settings
          </Link>
          <Link className="a-button" to="/">
            Home and personalisation
          </Link>
        </div>
      </section>
      <section className="a-panel">
        <h2>Preview and release status</h2>
        <p>
          Accounts, cloud progress syncing and payments are not connected in
          this school preview. A website server still receives ordinary requests
          needed to load the app; this page does not establish hosting-log
          retention.
        </p>
        <p>
          This information describes the school preview. Before public
          production release, the app needs a published privacy policy naming
          its responsible controller and contact, actual hosting and AI
          providers, processing purposes and retention arrangements. Those
          details have not been supplied here. This page does not claim legal
          compliance or App Store approval.
        </p>
      </section>
    </Page>
  );
}
