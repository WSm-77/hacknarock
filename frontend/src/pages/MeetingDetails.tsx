import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MeetingDetailsFooter } from '../components/meeting-details/MeetingDetailsFooter';
import { MeetingDetailsHeader } from '../components/meeting-details/MeetingDetailsHeader';
import { MeetingDetailsHero } from '../components/meeting-details/MeetingDetailsHero';
import { MeetingDetailsPageStyles } from '../components/meeting-details/MeetingDetailsPageStyles';
import { MeetingDetailsTabs } from '../components/meeting-details/MeetingDetailsTabs';
import type { MeetingTab } from '../components/meeting-details/types';

export function MeetingDetails() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [activeTab, setActiveTab] = useState<MeetingTab>('agenda');

  useEffect(() => {
    document.title = 'SnapSlot - Results';
  }, []);

  function switchTab(tabId: MeetingTab) {
    setActiveTab(tabId);
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <MeetingDetailsPageStyles />
      <MeetingDetailsHeader />

      <main className="flex-grow">
        <MeetingDetailsHero meetingId={meetingId} />
        <MeetingDetailsTabs activeTab={activeTab} onTabChange={switchTab} />
      </main>
      <MeetingDetailsFooter />
    </div>
  );
}
