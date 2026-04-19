const legendItems = [
  { label: 'Collecting Votes', dotClassName: 'w-2.5 h-2.5 rounded-full bg-primary', itemClassName: '' },
  { label: 'Finalized', dotClassName: 'w-2.5 h-2.5 rounded-full bg-emerald-500', itemClassName: '' },
  { label: 'Other Statuses', dotClassName: 'w-2.5 h-2.5 rounded-full bg-outline', itemClassName: '' },
];

export function DashboardLegend() {
  return (
    <div className="mt-6 flex gap-6 items-center px-4">
      {legendItems.map((item) => (
        <div key={item.label} className={`flex items-center gap-2 ${item.itemClassName}`}>
          <div className={item.dotClassName} />
          <span className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant/60">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
