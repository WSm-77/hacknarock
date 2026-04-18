export function WizardActions() {
  return (
    <div className="pt-8 flex flex-col md:flex-row items-center justify-end gap-4 border-t border-outline-variant/20">
      <button className="w-full md:w-auto px-[24px] py-[12px] rounded font-label font-medium text-sm text-on-surface-variant hover:bg-surface-container transition-colors duration-300" type="button">Save as Draft</button>
      <button className="w-full md:w-auto bg-primary text-on-primary px-[26px] py-[12px] rounded font-label font-medium text-sm hover:bg-primary-container transition-colors duration-300 scale-100 active:scale-[0.98] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] bg-gradient-to-r from-primary to-primary-container" type="button">Generate Poll Link</button>
    </div>
  );
}
