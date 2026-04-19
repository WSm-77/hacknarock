import { type FormEvent, useMemo, useState } from "react";
import type { TimeBlockPayload } from "../../api/meetings";

function generateTimeLabels() {
  const labels: string[] = [];
  for (let hour = 8; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const meridiem = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const displayMinute = minute === 0 ? "00" : minute.toString();
      labels.push(`${displayHour}:${displayMinute} ${meridiem}`);
    }
  }
  labels.push("12:00 AM");
  return labels;
}

const timeLabels = generateTimeLabels();
const GRID_START_HOUR = 8;
const SLOT_MINUTES = 15;

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const dayLabels: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

interface ParticipantTimingSelectionProps {
  proposedBlocks: TimeBlockPayload[];
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    availableBlocks: TimeBlockPayload[],
  ) => Promise<void>;
  errorMessage: string | null;
  successMessage: string | null;
  isSubmitting: boolean;
}

function getWeekDateRange(offset = 0): {
  start: Date;
  end: Date;
  display: string;
} {
  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const dayOfWeek = todayUtc.getUTCDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(todayUtc);
  monday.setUTCDate(monday.getUTCDate() - daysFromMonday + offset * 7);

  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);

  const format = (date: Date) =>
    `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
  return {
    start: monday,
    end: sunday,
    display: `${format(monday)} - ${format(sunday)}, ${monday.getUTCFullYear()}`,
  };
}

function getDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slotDateFromKey(dateKey: string, timeIndex: number): Date | null {
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);
  if ([year, month, day].some(Number.isNaN)) {
    return null;
  }

  const minutesFromMidnight = GRID_START_HOUR * 60 + timeIndex * SLOT_MINUTES;
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
}

function slotKey(dateKey: string, timeIndex: number): string {
  return `${dateKey}|${timeIndex}`;
}

export function ParticipantTimingSelection({
  proposedBlocks,
  onSubmit,
  errorMessage,
  successMessage,
  isSubmitting,
}: ParticipantTimingSelectionProps) {
  const [slotsByWeek, setSlotsByWeek] = useState<Map<number, Set<string>>>(
    new Map(),
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    dayIndex: number;
    timeIndex: number;
  } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{
    dayIndex: number;
    timeIndex: number;
  } | null>(null);
  const [dragDidMove, setDragDidMove] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");

  const selectedSlots = slotsByWeek.get(weekOffset) || new Set<string>();
  const totalSelectedSlots = Array.from(slotsByWeek.values()).reduce(
    (sum, set) => sum + set.size,
    0,
  );

  const parsedProposedBlocks = useMemo(
    () =>
      proposedBlocks
        .map((block) => {
          const start = new Date(block.start_time);
          const end = new Date(block.end_time);
          if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
          ) {
            return null;
          }
          return { start, end };
        })
        .filter((block): block is { start: Date; end: Date } => Boolean(block)),
    [proposedBlocks],
  );

  const weekRange = useMemo(() => getWeekDateRange(weekOffset), [weekOffset]);
  const weekDays = useMemo(() => {
    const days: Array<{
      key: DayKey;
      day: string;
      dateLabel: string;
      date: Date;
    }> = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekRange.start);
      date.setUTCDate(date.getUTCDate() + i);
      const dayOfWeek = date.getUTCDay();
      const dayKey = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
        dayOfWeek
      ] as DayKey;
      days.push({
        key: dayKey,
        day: dayLabels[dayKey],
        dateLabel: date.getUTCDate().toString().padStart(2, "0"),
        date,
      });
    }
    return days;
  }, [weekRange]);

  const isSlotAllowed = (date: Date, timeIndex: number) => {
    const dateKey = getDateKey(date);
    const slotStart = slotDateFromKey(dateKey, timeIndex);
    if (!slotStart) {
      return false;
    }

    const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60 * 1000);
    return parsedProposedBlocks.some(
      (block) => slotStart >= block.start && slotEnd <= block.end,
    );
  };

  const toggleSlot = (date: Date, timeIndex: number) => {
    if (!isSlotAllowed(date, timeIndex)) {
      return;
    }

    const key = slotKey(getDateKey(date), timeIndex);
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
    mode: "add" | "remove",
  ) => {
    const minDay = Math.min(start.dayIndex, end.dayIndex);
    const maxDay = Math.max(start.dayIndex, end.dayIndex);
    const minTime = Math.min(start.timeIndex, end.timeIndex);
    const maxTime = Math.max(start.timeIndex, end.timeIndex);

    const newSelected = new Set(selectedSlots);
    for (let dayIndex = minDay; dayIndex <= maxDay; dayIndex++) {
      const dayInfo = weekDays[dayIndex];
      if (!dayInfo) {
        continue;
      }
      for (let timeIndex = minTime; timeIndex <= maxTime; timeIndex++) {
        if (!isSlotAllowed(dayInfo.date, timeIndex)) {
          continue;
        }

        const key = slotKey(getDateKey(dayInfo.date), timeIndex);
        if (mode === "add") {
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
    if (!isDragging || !dragStart || !dragCurrent) {
      return false;
    }
    const minDay = Math.min(dragStart.dayIndex, dragCurrent.dayIndex);
    const maxDay = Math.max(dragStart.dayIndex, dragCurrent.dayIndex);
    const minTime = Math.min(dragStart.timeIndex, dragCurrent.timeIndex);
    const maxTime = Math.max(dragStart.timeIndex, dragCurrent.timeIndex);
    return (
      dayIndex >= minDay &&
      dayIndex <= maxDay &&
      timeIndex >= minTime &&
      timeIndex <= maxTime
    );
  };

  const resetDragState = () => {
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
    setDragDidMove(false);
    setDragMode("add");
  };

  const handleTileMouseDown = (dayIndex: number, timeIndex: number) => {
    const dayInfo = weekDays[dayIndex];
    if (!dayInfo || !isSlotAllowed(dayInfo.date, timeIndex)) {
      return;
    }

    const key = slotKey(getDateKey(dayInfo.date), timeIndex);
    const shouldRemove = selectedSlots.has(key);
    setIsDragging(true);
    setDragStart({ dayIndex, timeIndex });
    setDragCurrent({ dayIndex, timeIndex });
    setDragDidMove(false);
    setDragMode(shouldRemove ? "remove" : "add");
  };

  const handleTileMouseEnter = (dayIndex: number, timeIndex: number) => {
    if (!isDragging) {
      return;
    }

    setDragCurrent({ dayIndex, timeIndex });
    if (
      !dragStart ||
      dragStart.dayIndex !== dayIndex ||
      dragStart.timeIndex !== timeIndex
    ) {
      setDragDidMove(true);
    }
  };

  const handleTileMouseUp = (dayIndex: number, timeIndex: number) => {
    if (!isDragging) {
      return;
    }

    const end = { dayIndex, timeIndex };
    if (dragStart) {
      if (dragDidMove) {
        applySelectionRectangle(dragStart, end, dragMode);
      } else {
        const dayInfo = weekDays[dayIndex];
        if (dayInfo) {
          toggleSlot(dayInfo.date, timeIndex);
        }
      }
    }

    resetDragState();
  };

  const availableBlocks = useMemo(() => {
    const slotsByDate = new Map<string, number[]>();

    slotsByWeek.forEach((weekSlots) => {
      weekSlots.forEach((key) => {
        const [dateKey, timeIndexRaw] = key.split("|");
        if (!dateKey) {
          return;
        }

        const timeIndex = Number.parseInt(timeIndexRaw, 10);
        if (Number.isNaN(timeIndex)) {
          return;
        }

        const existing = slotsByDate.get(dateKey) || [];
        existing.push(timeIndex);
        slotsByDate.set(dateKey, existing);
      });
    });

    const ranges: TimeBlockPayload[] = [];
    Array.from(slotsByDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([dateKey, indices]) => {
        const ordered = Array.from(new Set(indices)).sort((a, b) => a - b);
        if (ordered.length === 0) {
          return;
        }

        const pushRange = (startIndex: number, endIndexExclusive: number) => {
          const startDate = slotDateFromKey(dateKey, startIndex);
          const endDate = slotDateFromKey(dateKey, endIndexExclusive);
          if (!startDate || !endDate) {
            return;
          }

          ranges.push({
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
          });
        };

        let start = ordered[0];
        let prev = ordered[0];
        for (let i = 1; i < ordered.length; i++) {
          const current = ordered[i];
          if (current === prev + 1) {
            prev = current;
            continue;
          }

          pushRange(start, prev + 1);
          start = current;
          prev = current;
        }

        pushRange(start, prev + 1);
      });

    return ranges;
  }, [slotsByWeek]);

  const isTileSelectedForRender = (
    dayIndex: number,
    timeIndex: number,
    isSelected: boolean,
    isAllowed: boolean,
  ) => {
    if (!isAllowed) {
      return false;
    }
    if (!isInDragRectangle(dayIndex, timeIndex)) {
      return isSelected;
    }
    return dragMode === "add";
  };

  const hasAllowedSlots = parsedProposedBlocks.length > 0;

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    void onSubmit(event, availableBlocks);
  };

  return (
    <form className="space-y-8" onSubmit={handleFormSubmit}>
      <section>
        <h2 className="font-headline text-2xl font-medium text-on-surface mb-8 border-b border-outline-variant/20 pb-4">
          Select your availability
        </h2>
        <p className="font-body text-sm text-on-surface-variant mb-6">
          Click on available time slots to mark your availability from 8 AM to
          12 AM across the week.{" "}
          {totalSelectedSlots > 0 && (
            <span className="text-primary font-medium">
              ({totalSelectedSlots} slots selected)
            </span>
          )}
        </p>

        <div className="bg-surface-container-low rounded-xl p-4 md:p-6 shadow-[0px_0px_0px_1px_rgba(20,20,19,0.05)] overflow-hidden">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w - 1)}
                className="p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  chevron_left
                </span>
              </button>
              <h3 className="font-headline text-xl text-on-surface min-w-[200px]">
                {weekRange.display}
              </h3>
              <button
                type="button"
                onClick={() => setWeekOffset((w) => w + 1)}
                className="p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  chevron_right
                </span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                className="bg-surface-container-highest border border-outline-variant/20 rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-2 focus:ring-primary transition-shadow font-body cursor-pointer"
                onChange={(e) => {
                  if (!e.target.value) {
                    return;
                  }

                  const [year, month, day] = e.target.value
                    .split("-")
                    .map(Number);
                  const selectedDate = new Date(
                    Date.UTC(year, month - 1, day, 0, 0, 0, 0),
                  );
                  const today = new Date();
                  const todayUtc = new Date(
                    Date.UTC(
                      today.getUTCFullYear(),
                      today.getUTCMonth(),
                      today.getUTCDate(),
                    ),
                  );
                  const dayOfWeek = todayUtc.getUTCDay();
                  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                  const currentMonday = new Date(todayUtc);
                  currentMonday.setUTCDate(
                    currentMonday.getUTCDate() - daysFromMonday,
                  );

                  const selectedDayOfWeek = selectedDate.getUTCDay();
                  const selectedDaysFromMonday =
                    selectedDayOfWeek === 0 ? 6 : selectedDayOfWeek - 1;
                  const selectedMonday = new Date(selectedDate);
                  selectedMonday.setUTCDate(
                    selectedMonday.getUTCDate() - selectedDaysFromMonday,
                  );

                  const weekDiff = Math.floor(
                    (selectedMonday.getTime() - currentMonday.getTime()) /
                      (7 * 24 * 60 * 60 * 1000),
                  );
                  setWeekOffset(weekDiff);
                }}
              />
              <button
                type="button"
                onClick={() => setSlotsByWeek(new Map())}
                className="px-3 py-2 rounded-lg bg-surface-container-highest hover:bg-secondary-container transition-colors text-on-surface text-sm font-medium"
                title="Clear all selected slots"
                disabled={totalSelectedSlots === 0 || isSubmitting}
              >
                Clear selected
              </button>
            </div>
          </div>

          <div className="w-full">
            <div className="w-full">
              <div
                className="grid gap-0"
                style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}
              >
                <div />
                {weekDays.map((item) => (
                  <div
                    key={`${item.key}-${item.dateLabel}`}
                    className="text-center"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                      {item.day}
                    </div>
                    <div className="font-headline text-lg text-on-surface">
                      {item.dateLabel}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="relative grid gap-0 select-none"
                style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}
                onMouseLeave={resetDragState}
              >
                <div className="space-y-0">
                  {timeLabels.map((label) => (
                    <div
                      key={label}
                      className="h-8 relative flex items-center justify-end pr-4"
                    >
                      <span className="text-[9px] font-bold text-outline leading-none">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {weekDays.map((dayInfo, dayIndex) => (
                  <div
                    key={`${dayInfo.key}-grid`}
                    className="border-l border-[rgba(137,114,107,0.15)] grid gap-0"
                    style={{
                      gridTemplateRows: `repeat(${timeLabels.length}, 1fr)`,
                    }}
                  >
                    {timeLabels.map((_, timeIndex) => {
                      const key = slotKey(getDateKey(dayInfo.date), timeIndex);
                      const isSelected = selectedSlots.has(key);
                      const isAllowed = isSlotAllowed(dayInfo.date, timeIndex);
                      const isRenderedSelected = isTileSelectedForRender(
                        dayIndex,
                        timeIndex,
                        isSelected,
                        isAllowed,
                      );

                      return (
                        <button
                          key={key}
                          type="button"
                          aria-disabled={!isAllowed}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleTileMouseDown(dayIndex, timeIndex);
                          }}
                          onMouseEnter={() =>
                            handleTileMouseEnter(dayIndex, timeIndex)
                          }
                          onMouseUp={() =>
                            handleTileMouseUp(dayIndex, timeIndex)
                          }
                          className={`h-8 w-full transition-colors border-b border-[rgba(137,114,107,0.15)] ${
                            !isAllowed
                              ? "bg-surface-container-highest/10 text-outline/40 cursor-not-allowed"
                              : isRenderedSelected
                                ? "bg-primary hover:bg-primary/90 cursor-pointer"
                                : "bg-surface-container-highest/30 hover:bg-secondary-container cursor-pointer"
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!hasAllowedSlots && (
            <p className="mt-6 text-center text-sm text-on-surface-variant italic">
              No proposed time blocks are available for this meeting.
            </p>
          )}
          {hasAllowedSlots && totalSelectedSlots === 0 && (
            <p className="mt-6 text-center text-sm text-on-surface-variant italic">
              Select time slots to submit your availability.
            </p>
          )}
          {selectedSlots.size === 0 && totalSelectedSlots > 0 && (
            <p className="mt-6 text-center text-sm text-on-surface-variant italic">
              This week has no selections. Select time slots above or choose
              another week.
            </p>
          )}
        </div>
      </section>

      {errorMessage && (
        <p className="rounded-lg border border-[#9a4021]/20 bg-[#9a4021]/5 px-4 py-3 text-sm text-[#9a4021]">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="rounded-lg border border-[#2f6f3e]/20 bg-[#2f6f3e]/10 px-4 py-3 text-sm text-[#1f4f2b]">
          {successMessage}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-primary text-on-primary px-[26px] py-[12px] rounded font-label font-medium text-sm hover:bg-primary-container transition-colors duration-300 scale-100 active:scale-[0.98] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0px_12px_32px_-4px_rgba(86,66,60,0.08)] disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isSubmitting || !hasAllowedSlots}
        >
          {isSubmitting ? "Saving availability..." : "Submit availability"}
        </button>
      </div>
    </form>
  );
}
