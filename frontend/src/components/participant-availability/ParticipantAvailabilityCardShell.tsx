import type { ReactNode } from 'react';

interface ParticipantAvailabilityCardShellProps {
  children: ReactNode;
}

export function ParticipantAvailabilityCardShell({
  children,
}: ParticipantAvailabilityCardShellProps) {
  return (
    <div className="bg-surface-container-low rounded-xl p-8 md:p-12 shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)] relative overflow-hidden">
      <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none">
        <svg
          fill="none"
          height="200"
          stroke="#9a4021"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.5"
          viewBox="0 0 24 24"
          width="200"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      {children}
    </div>
  );
}

