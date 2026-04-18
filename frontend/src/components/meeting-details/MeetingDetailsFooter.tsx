import { footerLinks } from './data';

export function MeetingDetailsFooter() {
  return (
    <footer className="bg-[#f5f4ed] w-full mt-24 py-16 border-t border-[#dcc1b8]/30">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="font-serif italic text-2xl text-[#141413]">SnapSlot</div>
        <div className="font-sans text-sm leading-relaxed text-[#56423c] opacity-60">© 2024 SnapSlot. Curated with intention and archival care.</div>
        <nav className="flex gap-8">
          {footerLinks.map((link) => (
            <a key={link.label} className="text-[#56423c] font-headline hover:text-[#9a4021] transition-all" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
