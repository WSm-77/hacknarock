import '../styles/meeting-confirmation.css';

type Venue = {
  name: string;
  note: string;
  image: string;
  topPick?: boolean;
};

type AgendaItem = {
  title: string;
  duration: string;
  description: string;
  status?: string;
  approved?: boolean;
};

const venues: Venue[] = [
  {
    name: 'The Oak Library Cafe',
    note: 'Editor\'s Note: A sanctuary of quiet focus. The acoustic treatment is superb for strategic discussion.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCuFnXs9V9nRRRnlEnMVkU4vnTorQsqyTbahF_7WTY_GmQOJreABiy7tEnEPWorio7qVr8u9pbAxoomiSijsJoBkcKobJikZl47Bu6mgTwu1FGfMRfMVn2L0O1PZ7dOZY6NI1xtcxMk7p-3sEqLjWjN76NV2l-oTlBWy5fcDGFv2FMaFz3ZS1zU6UwwIg7kXXsEhKX6UPvsE-XHg_uYZyhLZU9iirrjI2PJCIDVvnAEko4MBeQfKZvga4pdpureXQjxrCeBsALLqT70',
    topPick: true,
  },
  {
    name: 'Metropolitan Atrium',
    note: 'Editor\'s Note: Expansive views that encourage blue-sky thinking. Ideal for brainstorming sessions.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCCzuDhMFzIOSd85QeXeoYhBJ7q3xNuWVUmQSuZiHb0vfESlL-6UDk0LgRI-JWlXlH-GwlQJu0kXKjq5UHXI_Ns4YhGfGyRJoNoyD-pSWeVGImAiVLQ50OMcE2erjNvwSOpq75CkmVVhIDLrdyNKrb3IyRpw1cXrLDtOE0EiUggt_aDB7Zg-yVN2YPner1a1kcxeb68dVjkqGhFGLgAX6UmbINOMUb_yDtxI0KtIWWMc70XgmpN05BU8Q60QrRR2pwZ_3xNDQlgy6bM',
  },
  {
    name: 'Riverside Conservatory',
    note: 'Editor\'s Note: Soft natural light and measured ambience. A calm option for reflective planning.',
    image:
      'https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=1200&q=80',
  },
];

const agendaItems: AgendaItem[] = [
  {
    title: 'The Foundation',
    duration: '15 MIN',
    description:
      'Opening remarks and establishing the scope of the project. Defining the aesthetic milestones for Q1.',
    status: 'Approved for print',
    approved: true,
  },
  {
    title: 'Technical Deep-Dive',
    duration: '45 MIN',
    description:
      'A critical review of the current manuscript infrastructure. Discussion on preservation and accessibility protocols.',
    status: 'Awaiting final polish',
    approved: false,
  },
  {
    title: 'The Horizon Path',
    duration: '20 MIN',
    description:
      'Closing remarks and assignment of curatorial duties for the upcoming review cycle.',
  },
];

export function MeetingConfirmation() {
  return (
    <div className="meeting-confirmation-page">
      <header className="mc-topbar">
        <div className="mc-container mc-topbar-inner">
          <div className="mc-brand">The Editorial Archive</div>
          <nav className="mc-nav">
            <a href="#">Schedules</a>
            <a href="#">Venues</a>
            <a href="#">Agendas</a>
            <a href="#">Archive</a>
          </nav>
          <div className="mc-topbar-actions">
            <button aria-label="Notifications" type="button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button aria-label="Settings" type="button">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <img
              alt="Organizer profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3CkNUpCnkGhX5BbGYyjxicDIKacoATCJtWlnjcs8QtM7pBQXftt5gaKOzn8qEJBe91qWQrAzT61cPxCQnzOGyLlelnfCf4dYOPuc7vZK_YtDm7KvmHqOiPOVqcq0cZp96Xtc-Mjf76tcdlyOc6SrXzmSh4-eBZZ7hX9M26V7t3KY57gbwG7oU4_5dplrX2rIHn98VMMUFDI3TS66xnnA_P1Zv70eGx9ofuWPQBJoQFbfUHEmXDswxYlT1psPzcyko4LNhPP_jtgPr"
            />
          </div>
        </div>
      </header>

      <main className="mc-container mc-main">
        <section className="mc-hero">
          <span className="mc-eyebrow">Recommendation Report</span>
          <h1>The Optimal Selection</h1>
          <div className="mc-hero-card">
            <p>
              Based on participant synchronicity and spatial availability, the following window is
              recommended:
            </p>
            <h2>Tuesday, Nov 12th @ 2:00 PM</h2>
            <div className="mc-hero-actions">
              <button className="mc-primary-btn" type="button">
                Confirm and Finalize
              </button>
              <button className="mc-secondary-btn" type="button">
                Propose Alternative
              </button>
            </div>
          </div>
        </section>

        <section className="mc-venues">
          <div className="mc-section-header">
            <h3>Curated Venues</h3>
            <span>3 refined options selected</span>
          </div>

            <div className="mc-venues-grid">
              {venues.map((venue) => (
                <article className="mc-venue-card" key={venue.name}>
                  <img alt={venue.name} src={venue.image} />
                  <div className="mc-venue-content">
                    <div className="mc-venue-title-row">
                      <h4>{venue.name}</h4>
                      {venue.topPick ? <span>Top Pick</span> : null}
                    </div>
                    <p>{venue.note}</p>
                    <button type="button">Select Venue</button>
                  </div>
                </article>
              ))}
            </div>
        </section>

        <section className="mc-agenda">
          <div className="mc-section-header mc-section-header-wide">
            <div>
              <h3>Agenda Refinement</h3>
              <p>The AI-curated manuscript of discourse</p>
            </div>
            <button type="button">Export Agenda (PDF)</button>
          </div>

          <ol>
            {agendaItems.map((item, index) => (
              <li className="mc-agenda-item" key={item.title}>
                <div className={`mc-step ${index === 0 ? 'mc-step-active' : ''}`}>{index + 1}</div>
                <div className="mc-agenda-content">
                  <div className="mc-agenda-title-row">
                    <h4>{item.title}</h4>
                    <span>{item.duration}</span>
                  </div>
                  <p>{item.description}</p>
                  {item.status ? (
                    <label>
                      <input defaultChecked={item.approved} type="checkbox" />
                      <span>{item.status}</span>
                    </label>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="mc-footer">
        <div className="mc-container">
          <div className="mc-brand">The Editorial Archive</div>
          <div className="mc-footer-links">
            <a href="#">Journal</a>
            <a href="#">Library</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
          <p>Copyright 2024 The Curated Study. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
