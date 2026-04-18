import { useEffect } from 'react';
import '../styles/logging.css';

export function Logging() {
  useEffect(() => {
    document.title = 'SnapSlot | Enter the Study';
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="logging-page">
      <header className="logging-topbar">
        <div className="logging-topbar__inner">
          <a className="logging-brand" href="/login">
            SnapSlot
          </a>

          <nav className="logging-nav" aria-label="Primary">
            <a href="#">Support</a>
          </nav>

          <button className="logging-menu" type="button" aria-label="Open navigation menu">
            <span className="logging-symbol material-symbols-outlined" aria-hidden="true">
              menu
            </span>
          </button>
        </div>
      </header>

      <main className="logging-main">
        <div className="logging-orb" aria-hidden="true" />

        <section className="logging-card" aria-labelledby="study-entry-title">
          <div className="logging-illustration" aria-hidden="true">
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" viewBox="0 0 24 24">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-2.5-2.5m2.5 2.5l-1-1" />
              <circle cx="12" cy="12" fill="#30312c" r="1.5" />
            </svg>
          </div>

          <div className="logging-copy">
            <h1 id="study-entry-title">Enter the Study</h1>
            <p>Access your curated archives and temporal ledger.</p>
          </div>

          <form className="logging-form" onSubmit={handleSubmit}>
            <div className="logging-field">
              <label htmlFor="email">Electronic Mail</label>
              <input id="email" name="email" placeholder="curator@snapslot.com" type="email" autoComplete="email" />
            </div>

            <div className="logging-field">
              <label htmlFor="password">Cipher Key</label>
              <input id="password" name="password" placeholder="••••••••" type="password" autoComplete="current-password" />
            </div>

            <button className="logging-submit" type="submit">
              <span>Enter</span>
              <span className="logging-symbol material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </button>
          </form>

          <div className="logging-links">
            <a className="logging-footnote" href="#">
              Request Access
            </a>
            <div className="logging-links__divider" aria-hidden="true" />
            <a className="logging-footnote" href="#">
              The Manifesto
            </a>
          </div>
        </section>
      </main>

      <footer className="logging-footer">
        <div className="logging-footer__inner">
          <div>
            <div className="logging-footer__brand">SnapSlot</div>
            <p className="logging-footer__copy">© 2024 SnapSlot. Curated for the unhurried professional.</p>
          </div>

          <div className="logging-footer__links" aria-label="Footer links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Institutional Access</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
