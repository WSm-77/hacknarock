import { TopNav } from "../common/TopNav";

interface ParticipantAvailabilityNavProps {
  isCreatePage: boolean;
  onCreateNew: () => void;
  onLogout: () => void;
}

export function ParticipantAvailabilityNav({
  isCreatePage,
  onCreateNew,
  onLogout,
}: ParticipantAvailabilityNavProps) {
  const navLinks = [
    {
      label: "Dashboard",
      href: "/",
      className:
        "text-[#56423c] font-sans text-sm hover:text-[#9a4021] transition-colors duration-300",
    },
    {
      label: "My Polls",
      href: "/",
      className:
        "text-[#56423c] font-sans text-sm hover:text-[#9a4021] transition-colors duration-300",
    },
  ];

  return (
    <TopNav
      brand="SnapSlot"
      links={navLinks}
      className="sticky top-0 w-full z-50 bg-[#fbf9f2]/80 backdrop-blur-md shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)]"
      containerClassName="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto"
      leftClassName="flex items-center gap-8"
      rightClassName="flex items-center gap-4"
      brandClassName="font-serif text-2xl font-medium text-[#141413] tracking-tight hover:opacity-80 transition-opacity"
      navClassName="hidden md:flex gap-6 items-center"
      navListClassName="hidden md:flex gap-6 items-center"
      actionArea={
        <>
          {!isCreatePage && (
            <button
              type="button"
              className="bg-primary text-on-primary px-[26px] py-[12px] rounded font-label font-medium text-sm hover:bg-primary-container transition-colors duration-300 scale-100 active:scale-[0.98] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] hidden md:inline-flex items-center gap-2"
              onClick={onCreateNew}
            >
              Create New
            </button>
          )}
          <button
            type="button"
            className="rounded-lg border border-[#dcc1b8] px-4 py-2 text-sm font-medium text-[#56423c] transition hover:border-[#9a4021] hover:text-[#9a4021]"
            onClick={onLogout}
          >
            Logout
          </button>
        </>
      }
    />
  );
}
