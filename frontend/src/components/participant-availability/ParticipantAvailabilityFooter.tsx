import { PageFooter } from "../common/PageFooter";

export function ParticipantAvailabilityFooter() {
  const footerLinks = [
    {
      label: "Archive",
      className:
        "font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300",
    },
    {
      label: "Methodology",
      className:
        "font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300",
    },
    {
      label: "Privacy",
      className:
        "font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300",
    },
    {
      label: "Terms",
      className:
        "font-sans text-sm leading-relaxed text-[#56423c] hover:underline decoration-[#9a4021] underline-offset-4 transition-all duration-300",
    },
  ];

  return (
    <PageFooter
      className="w-full mt-24 py-12 bg-[#f5f4ed] border-t border-[#dcc1b8]/20"
      containerClassName="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8"
      brandClassName="font-serif italic text-xl text-[#141413]"
      descriptionClassName="font-sans text-sm leading-relaxed text-[#56423c]"
      linksClassName="flex gap-6"
      links={footerLinks}
      brand="SnapSlot"
      description="(c) 2024 SnapSlot. Curated with intention."
    />
  );
}
