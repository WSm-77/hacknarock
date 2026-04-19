export function ParticipantAvailabilityGlobalStyles() {
  return (
    <style>{`
      body { font-family: 'Inter', sans-serif; background-color: #fbf9f2; color: #1b1c18; }
      .font-headline { font-family: 'Newsreader', serif; }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #f5f4ed; }
      ::-webkit-scrollbar-thumb { background: #dcc1b8; border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: #89726b; }
      .grid-line-x { border-bottom: 1px solid rgba(137, 114, 107, 0.15); }
      .grid-line-y { border-right: 1px solid rgba(137, 114, 107, 0.15); }
      .time-label { transform: translateY(-50%); }
      .slot-selected { background-color: #9a4021 !important; }
    `}</style>
  );
}
