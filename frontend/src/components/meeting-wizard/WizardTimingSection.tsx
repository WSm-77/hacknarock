import { useState, useMemo } from 'react';

// Generate time labels from 8 AM to 12 AM (midnight) in 15-minute increments
function generateTimeLabels() {
  const labels: string[] = [];
  for (let hour = 8; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const meridiem = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      const displayMinute = minute === 0 ? '00' : minute.toString();
      labels.push(`${displayHour}:${displayMinute} ${meridiem}`);
    }
  }
  // Add midnight (12:00 AM)
  labels.push('12:00 AM');
  return labels;
}

const timeLabels = generateTimeLabels();

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
const dayLabels: { [key in DayKey]: string } = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

function getWeekDateRange(offset: number = 0): { start: Date; end: Date; display: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(monday.getDate() - daysFromMonday + offset * 7);
  
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  
  const format = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return {
    start: monday,
    end: sunday,
    display: `${format(monday)} - ${format(sunday)}, ${monday.getFullYear()}`,
  };
}

export function WizardTimingSection() {
  const [slotsByWeek, setSlotsByWeek] = useState<Map<number, Set<string>>>(new Map());
  const [weekOffset, setWeekOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ dayIndex: number; timeIndex: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ dayIndex: number; timeIndex: number } | null>(null);
  const [dragDidMove, setDragDidMove] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');
  
  const selectedSlots = slotsByWeek.get(weekOffset) || new Set<string>();
  const totalSelectedSlots = Array.from(slotsByWeek.values()).reduce<number>((sum, set) => sum + (set as Set<string>).size, 0);
  
  const weekRange = useMemo(() => getWeekDateRange(weekOffset), [weekOffset]);
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekRange.start);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayOfWeek] as DayKey;
      days.push({
        key: dayKey,
        day: dayLabels[dayKey],
        date: date.getDate().toString().padStart(2, '0'),
      });
    }
    return days;
  }, [weekRange]);

  const slotKey = (day: DayKey, timeIndex: number) => `${day}-${timeIndex}`;

  const toggleSlot = (day: DayKey, timeIndex: number) => {
    const key = slotKey(day, timeIndex);
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    const newByWeek = new Map(slotsByWeek);
    if (newSelected.size > 0) {
      newByWeek.set(weekOffset, newSelected);
    } else {
      newByWeek.delete(weekOffset);
    }
    setSlotsByWeek(newByWeek);
  };

  const applySelectionRectangle = (
    start: { dayIndex: number; timeIndex: number },
    end: { dayIndex: number; timeIndex: number },
    mode: 'add' | 'remove',
  ) => {
    const minDay = Math.min(start.dayIndex, end.dayIndex);
    const maxDay = Math.max(start.dayIndex, end.dayIndex);
    const minTime = Math.min(start.timeIndex, end.timeIndex);
    const maxTime = Math.max(start.timeIndex, end.timeIndex);

    const newSelected = new Set(selectedSlots);
    for (let dayIndex = minDay; dayIndex <= maxDay; dayIndex++) {
      const dayInfo = weekDays[dayIndex];
      if (!dayInfo) continue;
      for (let timeIndex = minTime; timeIndex <= maxTime; timeIndex++) {
        const key = slotKey(dayInfo.key as DayKey, timeIndex);
        if (mode === 'add') {
          newSelected.add(key);
        } else {
          newSelected.delete(key);
        }
      }
    }

    const newByWeek = new Map(slotsByWeek);
    if (newSelected.size > 0) {
      newByWeek.set(weekOffset, newSelected);
    } else {
      newByWeek.delete(weekOffset);
    }
    setSlotsByWeek(newByWeek);
  };

  const isInDragRectangle = (dayIndex: number, timeIndex: number) => {
    if (!isDragging || !dragStart || !dragCurrent) return false;
    const minDay = Math.min(dragStart.dayIndex, dragCurrent.dayIndex);
    const maxDay = Math.max(dragStart.dayIndex, dragCurrent.dayIndex);
    const minTime = Math.min(dragStart.timeIndex, dragCurrent.timeIndex);
    const maxTime = Math.max(dragStart.timeIndex, dragCurrent.timeIndex);
    return dayIndex >= minDay && dayIndex <= maxDay && timeIndex >= minTime && timeIndex <= maxTime;
  };

  const handleTileMouseDown = (dayIndex: number, timeIndex: number) => {
    const dayInfo = weekDays[dayIndex];
    if (!dayInfo) return;
    const key = slotKey(dayInfo.key as DayKey, timeIndex);
    const shouldRemove = selectedSlots.has(key);
    setIsDragging(true);
    setDragStart({ dayIndex, timeIndex });
    setDragCurrent({ dayIndex, timeIndex });
    setDragDidMove(false);
    setDragMode(shouldRemove ? 'remove' : 'add');
  };

  const handleTileMouseEnter = (dayIndex: number, timeIndex: number) => {
    if (!isDragging) return;
    setDragCurrent({ dayIndex, timeIndex });
    if (!dragStart || dragStart.dayIndex !== dayIndex || dragStart.timeIndex !== timeIndex) {
      setDragDidMove(true);
    }
  };

  const handleTileMouseUp = (dayIndex: number, timeIndex: number) => {
    if (!isDragging) return;
    const end = { dayIndex, timeIndex };
    if (dragStart) {
      if (dragDidMove) {
        applySelectionRectangle(dragStart, end, dragMode);
      } else {
        const dayInfo = weekDays[dayIndex];
        if (dayInfo) {
          toggleSlot(dayInfo.key as DayKey, timeIndex);
        }
      }
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
    setDragDidMove(false);
    setDragMode('add');
  };

  // Serialize selected slots into a format suitable for form data
  const proposedBlocks = useMemo(() => {
    const blocks: { day: string; time: string }[] = [];
    selectedSlots.forEach((key) => {
      const [day, timeIndexStr] = key.split('-');
      const timeIndex = parseInt(timeIndexStr, 10);
      blocks.push({
        day: day.toUpperCase(),
        time: timeLabels[timeIndex],
      });
    });
    return blocks;
  }, [selectedSlots]);

  // Hidden input to pass data to form
  const proposedBlocksJson = JSON.stringify(proposedBlocks);

  const isTileSelectedForRender = (dayIndex: number, timeIndex: number, isSelected: boolean) => {
    if (!isInDragRectangle(dayIndex, timeIndex)) return isSelected;
    return dragMode === 'add' ? true : false;
  };

  return (
    <section>
      <h2 className="font-headline text-2xl font-medium text-on-surface mb-8 border-b border-outline-variant/20 pb-4">II. Propose Timings</h2>
      <p className="font-body text-sm text-on-surface-variant mb-6">Click on time slots to mark your availability from 8 AM to 12 AM across the week. {totalSelectedSlots > 0 && <span className="text-primary font-medium">({totalSelectedSlots} slots selected)</span>}</p>

      {/* Hidden input to capture proposed blocks */}
      <input type="hidden" name="proposed-blocks" value={proposedBlocksJson} />

      <div className="bg-surface-container-low rounded-xl p-4 md:p-6 shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)] overflow-hidden">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setWeekOffset(w => w - 1)}
              className="p-2 rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
            </button>
            <h3 className="font-headline text-xl text-on-surface min-w-[200px]">{weekRange.display}</h3>
            <button
              type="button"
              onClick={() => setWeekOffset(w => w + 1)}
              className="p-2 rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              className="bg-surface-container-highest border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-2 focus:ring-primary transition-shadow font-body cursor-pointer"
              onChange={(e) => {
                if (e.target.value) {
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  const selectedDate = new Date(year, month - 1, day);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dayOfWeek = today.getDay();
                  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                  const currentMonday = new Date(today);
                  currentMonday.setDate(currentMonday.getDate() - daysFromMonday);
                  
                  const selectedDayOfWeek = selectedDate.getDay();
                  const selectedDaysFromMonday = selectedDayOfWeek === 0 ? 6 : selectedDayOfWeek - 1;
                  const selectedMonday = new Date(selectedDate);
                  selectedMonday.setDate(selectedMonday.getDate() - selectedDaysFromMonday);
                  
                  const weekDiff = Math.floor((selectedMonday.getTime() - currentMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
                  setWeekOffset(weekDiff);
                }
              }}
            />
            <button
              type="button"
              onClick={() => setSlotsByWeek(new Map())}
              className="px-3 py-2 rounded-lg bg-surface-container-highest hover:bg-secondary-container transition-colors text-on-surface text-sm font-medium"
              title="Clear all selected slots"
              disabled={totalSelectedSlots === 0}
            >
              Clear selected
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="w-full">
            <div className="grid gap-0" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
              <div />
              {weekDays.map((item) => (
                <div key={`${item.key}-${item.date}`} className="text-center">
                  <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{item.day}</div>
                  <div className="font-headline text-lg text-on-surface">{item.date}</div>
                </div>
              ))}
            </div>

            <div
              className="relative grid gap-0 select-none"
              style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}
              onMouseLeave={() => {
                setIsDragging(false);
                setDragStart(null);
                setDragCurrent(null);
                setDragDidMove(false);
                setDragMode('add');
              }}
            >
              <div className="space-y-0">
                {timeLabels.map((label) => (
                  <div key={label} className="h-8 relative flex items-center justify-end pr-4">
                    <span className="text-[9px] font-bold text-outline leading-none">{label}</span>
                  </div>
                ))}
              </div>

              {weekDays.map((dayInfo, dayIndex) => (
                <div
                  key={`${dayInfo.key}-grid`}
                  className="border-l border-[rgba(137,114,107,0.15)] grid gap-0"
                  style={{ gridTemplateRows: `repeat(${timeLabels.length}, 1fr)` }}
                >
                  {timeLabels.map((_, timeIndex) => {
                    const key = slotKey(dayInfo.key as DayKey, timeIndex);
                    const isSelected = selectedSlots.has(key);
                    const isRenderedSelected = isTileSelectedForRender(dayIndex, timeIndex, isSelected);

                    return (
                      <button
                        key={key}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleTileMouseDown(dayIndex, timeIndex);
                        }}
                        onMouseEnter={() => handleTileMouseEnter(dayIndex, timeIndex)}
                        onMouseUp={() => handleTileMouseUp(dayIndex, timeIndex)}
                        className={`h-8 w-full transition-colors cursor-pointer border-b border-[rgba(137,114,107,0.15)] ${
                          isRenderedSelected
                            ? 'bg-primary hover:bg-primary/90'
                            : 'bg-surface-container-highest/30 hover:bg-secondary-container'
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {totalSelectedSlots === 0 && (
          <p className="mt-6 text-center text-sm text-on-surface-variant italic">Select time slots to propose event time availability.</p>
        )}
        {selectedSlots.size === 0 && totalSelectedSlots > 0 && (
          <p className="mt-6 text-center text-sm text-on-surface-variant italic">This week has no selections. Select time slots above or choose another week.</p>
        )}
      </div>
    </section>
  );
}
