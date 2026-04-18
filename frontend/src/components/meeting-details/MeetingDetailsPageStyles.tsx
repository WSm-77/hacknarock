export function MeetingDetailsPageStyles() {
  return (
    <style>{`
      body { font-family: 'Inter', sans-serif; background-color: #fbf9f2; color: #1b1c18; }
      h1, h2, h3, h4, h5, h6, .font-serif, .anthropic-serif { font-family: 'Newsreader', serif; }
      .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      .tab-content { display: none; }
      .tab-content.active { display: block; }
      .tab-btn.active {
        background-color: #fbf9f2;
        box-shadow: 0 -4px 10px -2px rgba(0,0,0,0.05);
        border-bottom: 2px solid transparent;
        position: relative;
        z-index: 10;
      }
      .tab-btn.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #fbf9f2;
      }
      .ledger-line {
        background-image: linear-gradient(to bottom, transparent 95%, #e2e0d1 95%);
        background-size: 100% 2.5rem;
        line-height: 2.5rem;
      }
      .stamp {
        transform: rotate(-12deg);
        border: 2px solid currentColor;
        opacity: 0.8;
      }
    `}</style>
  );
}
