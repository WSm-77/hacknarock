import type { FormEvent } from "react";
import { CreateSuccessPanel } from "../meeting-wizard/CreateSuccessPanel";
import { WizardActions } from "../meeting-wizard/WizardActions";
import { WizardCurationSection } from "../meeting-wizard/WizardCurationSection";
import { WizardTimingSection } from "../meeting-wizard/WizardTimingSection";

interface ParticipantAvailabilityFormSectionsProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  errorMessage: string | null;
  successMessage: string | null;
  didCopy: boolean;
  shareLink: string | null;
  onCopy: () => void;
  isSubmitting: boolean;
}

export function ParticipantAvailabilityFormSections({
  onSubmit,
  errorMessage,
  successMessage,
  didCopy,
  shareLink,
  onCopy,
  isSubmitting,
}: ParticipantAvailabilityFormSectionsProps) {
  return (
    <form className="space-y-16 relative z-10" onSubmit={onSubmit}>
      <WizardTimingSection />
      <WizardCurationSection />
      {errorMessage && (
        <p className="rounded-lg border border-[#9a4021]/20 bg-[#9a4021]/5 px-4 py-3 text-sm text-[#9a4021]">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <CreateSuccessPanel
          didCopy={didCopy}
          onCopy={onCopy}
          shareLink={shareLink}
          successMessage={successMessage}
        />
      )}
      <WizardActions isSubmitting={isSubmitting} />
    </form>
  );
}
