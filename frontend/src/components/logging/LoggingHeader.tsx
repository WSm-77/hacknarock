export function LoggingHeader() {
  return (
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
  );
}
