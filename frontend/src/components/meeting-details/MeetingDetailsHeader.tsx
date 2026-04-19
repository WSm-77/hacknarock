import { Link, useNavigate } from 'react-router-dom';

export function MeetingDetailsHeader() {
  const navigate = useNavigate();

  return (
    <header className="bg-[#fbf9f2]/80 backdrop-blur-md sticky top-0 w-full z-50 shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)]">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="font-serif text-2xl font-medium text-[#141413]">
          SnapSlot
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link className="text-[#56423c] font-sans text-sm hover:text-[#9a4021] transition-colors duration-300" to="/">
            Dashboard
          </Link>
          <Link className="text-[#141413] border-b border-[#9a4021] pb-1 hover:text-[#9a4021] transition-colors duration-300" to="/polls">
            Polls
          </Link>
        </nav>

        <button
          className="text-[#9a4021] font-serif text-lg font-medium leading-relaxed tracking-tight hover:text-[#7e2c0e] transition-colors duration-300"
          type="button"
          onClick={() => navigate('/create')}
        >
          Create New
        </button>
      </div>
    </header>
  );
}
