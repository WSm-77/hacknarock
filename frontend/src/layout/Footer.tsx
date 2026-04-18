/**
 * Footer Component
 * 
 * Shared footer for all pages.
 * Contains product messaging and links.
 */

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>HackNaRock</h3>
            <p>Schedule team meetings faster with automated time-slot matching.</p>
          </div>

          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#/">How it works</a></li>
              <li><a href="#/">Features</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Team</h4>
            <ul>
              <li><a href="#/">About</a></li>
              <li><a href="#/">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 HackNaRock. Built for teams that value their time.</p>
        </div>
      </div>
    </footer>
  );
}
