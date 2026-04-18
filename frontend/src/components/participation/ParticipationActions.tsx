export function ParticipationActions() {
  return (
    <div className="flex justify-end gap-6 pt-8">
      <button type="button" className="px-8 py-4 text-[#141413] font-medium hover:bg-stone-100 rounded-lg transition-all duration-300">Save as Draft</button>
      <button type="button" className="px-10 py-4 bg-primary text-on-primary rounded-lg font-bold shadow-lg hover:bg-primary-container transition-all duration-300 flex items-center gap-3">
        Launch Meeting
        <span className="material-symbols-outlined">send</span>
      </button>
    </div>
  );
}
