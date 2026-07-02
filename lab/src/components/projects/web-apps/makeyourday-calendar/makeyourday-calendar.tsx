"use client";

import {
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  type WheelEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MONTHS, SAMPLE_EVENT, STORAGE_KEY, WEEKDAYS } from "./constants";
import type { CalendarEvent, EventStore, PanelMode, TimeState } from "./types";

type MakeYourDayCalendarAppProps = {
  forceReducedMotion?: boolean;
};

type DaySpinState = {
  direction: "next" | "prev";
  monthIndex: number;
  token: number;
} | null;

const initialDays = MONTHS.map(() => 1);
const DAY_DRAG_STEP = 18;
const DAY_WHEEL_STEP = 24;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function dateKey(monthIndex: number, day: number) {
  const year = new Date().getFullYear();
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function wrapDay(value: number, max: number) {
  return ((value - 1 + max) % max) + 1;
}

function selectedDateMeta(monthIndex: number, day: number) {
  const year = new Date().getFullYear();
  const date = new Date(year, monthIndex, day);

  return {
    key: dateKey(monthIndex, day),
    dayLabel: pad2(day),
    weekday: WEEKDAYS[date.getDay()],
    month: MONTHS[monthIndex].name,
    short: MONTHS[monthIndex].short,
  };
}

function loadEvents(): EventStore {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as EventStore;
  } catch {
    return {};
  }
}

function normalizeTime(value: TimeState) {
  return `${pad2(value.hour)}:${pad2(value.minute)} ${value.meridiem}`;
}

function parseTime(value: string): TimeState {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return { hour: 9, minute: 0, meridiem: "AM" };
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
    meridiem: match[3].toUpperCase() as "AM" | "PM",
  };
}

function getMonthGrid(monthIndex: number) {
  const year = new Date().getFullYear();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = MONTHS[monthIndex].days;
  const cells: Array<number | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  return cells;
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function MakeYourDayCalendarApp({
  forceReducedMotion = false,
}: MakeYourDayCalendarAppProps) {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [daysByMonth, setDaysByMonth] = useState(initialDays);
  const [events, setEvents] = useState<EventStore>({});
  const [storageReady, setStorageReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<PanelMode>("hub");
  const [deleteMode, setDeleteMode] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [detailReturnMode, setDetailReturnMode] = useState<PanelMode>("hub");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [formValues, setFormValues] = useState({
    title: "",
    location: "",
    description: "",
  });
  const [time, setTime] = useState<TimeState>({
    hour: 9,
    minute: 0,
    meridiem: "AM",
  });
  const [daySpin, setDaySpin] = useState<DaySpinState>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstMenuButtonRef = useRef<HTMLButtonElement>(null);
  const dayDragRef = useRef<{
    monthIndex: number;
    pointerId: number;
    lastY: number;
    remainder: number;
  } | null>(null);
  const dayWheelRemainderRef = useRef(0);
  const daySpinTokenRef = useRef(0);

  const selectedDay = daysByMonth[selectedMonth] ?? 1;
  const selectedMeta = useMemo(
    () => selectedDateMeta(selectedMonth, selectedDay),
    [selectedMonth, selectedDay],
  );
  const eventsForDay = events[selectedMeta.key] ?? [];
  const activeEvent = eventsForDay.find((item) => item.id === activeEventId);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEvents(loadEvents());
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      window.dispatchEvent(new Event("makeyourday-calendar-storage-error"));
    }
  }, [events, storageReady]);

  useEffect(() => {
    if (!panelOpen || (mode !== "hub" && mode !== "menu")) {
      return;
    }

    const timeout = window.setTimeout(
      () => firstMenuButtonRef.current?.focus(),
      forceReducedMotion ? 0 : 220,
    );

    return () => window.clearTimeout(timeout);
  }, [forceReducedMotion, mode, panelOpen]);

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function updateDay(monthIndex: number, delta: number) {
    if (delta === 0) {
      return;
    }

    daySpinTokenRef.current += 1;
    setDaySpin({
      direction: delta > 0 ? "next" : "prev",
      monthIndex,
      token: daySpinTokenRef.current,
    });
    setDaysByMonth((current) =>
      current.map((day, index) => {
        if (index !== monthIndex) {
          return day;
        }

        return wrapDay(day + delta, MONTHS[index].days);
      }),
    );
    setSelectedMonth(monthIndex);
    setPendingDeleteId(null);
    setNotice("");
  }

  function handleDayKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    monthIndex: number,
  ) {
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      updateDay(monthIndex, -1);
    }

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      updateDay(monthIndex, 1);
    }
  }

  function selectMonth(monthIndex: number) {
    setSelectedMonth(monthIndex);
    setPendingDeleteId(null);
    setNotice("");
    setDaySpin(null);
  }

  function handleDayWheel(
    event: WheelEvent<HTMLButtonElement>,
    monthIndex: number,
  ) {
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      return;
    }

    dayWheelRemainderRef.current += event.deltaY;

    const steps = Math.trunc(dayWheelRemainderRef.current / DAY_WHEEL_STEP);
    if (steps === 0) {
      return;
    }

    const direction = Math.sign(steps);
    dayWheelRemainderRef.current -= direction * DAY_WHEEL_STEP;
    updateDay(monthIndex, direction);
  }

  function handleDayPointerDown(
    event: PointerEvent<HTMLButtonElement>,
    monthIndex: number,
  ) {
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    dayDragRef.current = {
      monthIndex,
      pointerId: event.pointerId,
      lastY: event.clientY,
      remainder: 0,
    };
    selectMonth(monthIndex);
  }

  function handleDayPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dayDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const delta = drag.lastY - event.clientY;
    drag.lastY = event.clientY;
    drag.remainder += delta;

    const steps = Math.trunc(drag.remainder / DAY_DRAG_STEP);
    if (steps === 0) {
      return;
    }

    const direction = Math.sign(steps);
    drag.remainder -= direction * DAY_DRAG_STEP;
    updateDay(drag.monthIndex, direction);
  }

  function handleDayPointerEnd(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dayDragRef.current = null;
  }

  function openPanel(nextMode: PanelMode = "hub") {
    setPanelOpen(true);
    setMode(nextMode);
    setDeleteMode(false);
    setActiveEventId(null);
    setEditingEventId(null);
    setPendingDeleteId(null);
    setFormError("");
    setNotice("");
  }

  function openDayMenu(monthIndex: number, day: number) {
    setSelectedMonth(monthIndex);
    setDaysByMonth((current) =>
      current.map((value, index) => (index === monthIndex ? day : value)),
    );
    setPanelOpen(true);
    setMode("menu");
    setDeleteMode(false);
    setActiveEventId(null);
    setEditingEventId(null);
    setPendingDeleteId(null);
    setFormError("");
    setNotice("");
  }

  function closePanel() {
    setPanelOpen(false);
    setMode("hub");
    setDeleteMode(false);
    setActiveEventId(null);
    setEditingEventId(null);
    setPendingDeleteId(null);
    setFormError("");
  }

  function resetForm() {
    setFormValues({ title: "", location: "", description: "" });
    setTime({ hour: 9, minute: 0, meridiem: "AM" });
    setEditingEventId(null);
    setFormError("");
  }

  function loadEventIntoForm(event: CalendarEvent) {
    setFormValues({
      title: event.title,
      location: event.location,
      description: event.description,
    });
    setTime(parseTime(event.time));
    setEditingEventId(event.id);
    setFormError("");
  }

  function startAddEvent() {
    resetForm();
    setMode("form");
  }

  function startEditEvent(event: CalendarEvent) {
    loadEventIntoForm(event);
    setActiveEventId(event.id);
    setMode("form");
  }

  function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      title: formValues.title.trim(),
      location: formValues.location.trim(),
      description: formValues.description.trim(),
      time: normalizeTime(time),
    };

    if (!payload.title || !payload.location || !payload.description) {
      setFormError("Add a title, location, and description before saving.");
      return;
    }

    if (editingEventId) {
      setEvents((current) => ({
        ...current,
        [selectedMeta.key]: (current[selectedMeta.key] ?? []).map((item) =>
          item.id === editingEventId ? { ...item, ...payload } : item,
        ),
      }));
      setActiveEventId(editingEventId);
      resetForm();
      setMode("detail");
      setNotice("Event updated.");
      return;
    }

    const nextEvent: CalendarEvent = {
      id: `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`,
      ...payload,
    };

    setEvents((current) => ({
      ...current,
      [selectedMeta.key]: [...(current[selectedMeta.key] ?? []), nextEvent],
    }));
    resetForm();
    setMode("list");
    setNotice("Event saved.");
  }

  function seedSampleEvent() {
    setEvents((current) => ({
      ...current,
      [selectedMeta.key]: [
        ...(current[selectedMeta.key] ?? []),
        {
          id: `sample-${Date.now().toString(36)}`,
          ...SAMPLE_EVENT,
        },
      ],
    }));
    setNotice("Sample event added.");
  }

  function deleteEvent(id: string) {
    setEvents((current) => {
      const nextForDay = (current[selectedMeta.key] ?? []).filter(
        (item) => item.id !== id,
      );
      const next = { ...current };

      if (nextForDay.length > 0) {
        next[selectedMeta.key] = nextForDay;
      } else {
        delete next[selectedMeta.key];
      }

      return next;
    });
    setActiveEventId(null);
    setPendingDeleteId(null);
    setDeleteMode(false);
    setMode("hub");
    setNotice("Event deleted.");
  }

  function stepTime(part: "hour" | "minute", delta: number) {
    setTime((current) => {
      if (part === "hour") {
        return { ...current, hour: wrapDay(current.hour + delta, 12) };
      }

      return {
        ...current,
        minute: (current.minute + delta + 60) % 60,
      };
    });
  }

  return (
    <section
      className="myd-shell"
      aria-label="MakeYourDay save date calendar app"
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
    >
      <div className="myd-background" aria-hidden>
        <div className="myd-grid-layer" />
        <div className="myd-light-rays" />
      </div>
      <div className="myd-stage">
        <header className="myd-header">
          <h1>MakeYourDay</h1>
          <p>
            Choose a month, nudge the day dial, then open events to add,
            inspect, edit, or delete saved events.
          </p>
        </header>

        <div className="myd-app-surface">
          <aside className="myd-date-summary">
            <button
              type="button"
              className="myd-events-button"
              onClick={() => openPanel("hub")}
              aria-label={`Events for ${selectedMeta.month} ${selectedMeta.dayLabel}`}
            >
              <span className="myd-events-orb" aria-hidden>
                <CalendarDays size={16} />
              </span>
              Events
            </button>
          </aside>

          <div className="myd-month-stack" role="radiogroup" aria-label="Months">
            {MONTHS.map((month, monthIndex) => {
              const active = selectedMonth === monthIndex;
              const day = daysByMonth[monthIndex] ?? 1;
              const spin =
                active && daySpin?.monthIndex === monthIndex ? daySpin : null;
              const hasEventsForSelectedDate =
                active && (events[dateKey(monthIndex, day)]?.length ?? 0) > 0;

              return (
                <div
                  className="myd-line"
                  data-active={active ? "true" : undefined}
                  key={month.name}
                >
                  <button
                    className="myd-month-button"
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setSelectedMonth(monthIndex);
                      setPendingDeleteId(null);
                      setNotice("");
                    }}
                  >
                    <span className="myd-month-number">{pad2(monthIndex + 1)}</span>
                    <span className="myd-stem" aria-hidden />
                    <span className="myd-wave" aria-hidden />
                    <span className="myd-month-name">
                      {month.name.split("").map((letter, index) => (
                        <span key={`${month.name}-${index}`}>
                          {letter}
                        </span>
                      ))}
                    </span>
                    {hasEventsForSelectedDate ? (
                      <span className="myd-event-dot" aria-label="Selected date has events" />
                    ) : null}
                  </button>
                  <div className="myd-day-controls">
                    <button
                      type="button"
                      className="myd-day-dial"
                      aria-label={`${month.name} day ${day}. Use arrow keys, mouse wheel, or drag to adjust.`}
                      aria-valuemin={1}
                      aria-valuemax={month.days}
                      aria-valuenow={day}
                      role="spinbutton"
                      tabIndex={active ? 0 : -1}
                      onClick={() => selectMonth(monthIndex)}
                      onKeyDown={(event) => handleDayKeyDown(event, monthIndex)}
                      onWheel={(event) => handleDayWheel(event, monthIndex)}
                      onPointerDown={(event) => handleDayPointerDown(event, monthIndex)}
                      onPointerMove={handleDayPointerMove}
                      onPointerUp={handleDayPointerEnd}
                      onPointerCancel={handleDayPointerEnd}
                      onLostPointerCapture={() => {
                        dayDragRef.current = null;
                      }}
                    >
                      <span
                        className="myd-day-track"
                        data-spin={spin?.direction}
                        key={`${month.name}-${day}-${spin?.token ?? "idle"}`}
                      >
                        <span>{pad2(wrapDay(day - 1, month.days))}</span>
                        <span>{pad2(day)}</span>
                        <span>{pad2(wrapDay(day + 1, month.days))}</span>
                      </span>
                    </button>
                    <div className="myd-step-buttons" aria-hidden={!active}>
                      <button type="button" onClick={() => updateDay(monthIndex, -1)} aria-label={`Previous day in ${month.name}`}>
                        <ChevronLeft size={14} />
                      </button>
                      <button type="button" onClick={() => updateDay(monthIndex, 1)} aria-label={`Next day in ${month.name}`}>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="myd-open-panel"
                      onClick={() => {
                        setSelectedMonth(monthIndex);
                        openPanel("calendar");
                      }}
                      aria-label={`Open ${month.name} calendar`}
                    >
                      <CalendarCheck size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {panelOpen ? (
        <div className="myd-panel-backdrop" onClick={closePanel}>
          <div
            className="myd-panel"
            role="dialog"
            aria-modal="true"
            aria-label={
              mode === "calendar"
                ? `${MONTHS[selectedMonth].name} calendar`
                : `Events for ${selectedMeta.month} ${selectedMeta.dayLabel}`
            }
            ref={dialogRef}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="myd-panel-head">
              {mode === "calendar" ? (
                <div className="myd-panel-head-meta myd-panel-head-meta-calendar">
                  <span>{new Date().getFullYear()}</span>
                  <p>{MONTHS[selectedMonth].name}</p>
                </div>
              ) : (
                <div className="myd-panel-head-meta">
                  <span>{selectedMeta.weekday}</span>
                  <strong>{selectedMeta.dayLabel}</strong>
                  <p>{selectedMeta.month}</p>
                </div>
              )}
              <div className="myd-panel-head-actions">
                {mode === "detail" && activeEvent ? (
                  <button
                    type="button"
                    onClick={() => startEditEvent(activeEvent)}
                    aria-label={`Edit ${activeEvent.title}`}
                  >
                    <Pencil size={16} />
                  </button>
                ) : null}
                <button type="button" onClick={closePanel} aria-label="Close event panel">
                  <X size={18} />
                </button>
              </div>
            </header>

            {notice ? (
              <p className="myd-notice" role="status">
                <Check size={14} />
                {notice}
              </p>
            ) : null}

            {mode === "hub" ? (
              <div className="myd-hub-view">
                {eventsForDay.length > 0 ? (
                  <ul className="myd-hub-list">
                    {eventsForDay.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEventId(item.id);
                            setDeleteMode(false);
                            setDetailReturnMode("hub");
                            setMode("detail");
                          }}
                        >
                          <span>{item.time}</span>
                          <strong>{item.title}</strong>
                          <small>{item.location}</small>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="myd-empty-state myd-empty-state-compact">
                    <CalendarDays size={20} />
                    <span>No events yet for this day.</span>
                  </div>
                )}
                <MenuActions
                  firstButtonRef={firstMenuButtonRef}
                  onAdd={startAddEvent}
                  onShow={() => {
                    setDeleteMode(false);
                    setPendingDeleteId(null);
                    setMode("list");
                  }}
                  onDelete={() => {
                    setDeleteMode(true);
                    setPendingDeleteId(null);
                    setMode("list");
                  }}
                />
              </div>
            ) : null}

            {mode === "menu" ? (
              <MenuActions
                firstButtonRef={firstMenuButtonRef}
                onAdd={startAddEvent}
                onShow={() => {
                  setDeleteMode(false);
                  setPendingDeleteId(null);
                  setMode("list");
                }}
                onDelete={() => {
                  setDeleteMode(true);
                  setPendingDeleteId(null);
                  setMode("list");
                }}
              />
            ) : null}

            {mode === "calendar" ? (
              <div className="myd-calendar-view">
                <div className="myd-calendar-weekdays" aria-hidden>
                  {WEEKDAY_SHORT.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className="myd-calendar-grid" role="grid" aria-label={`${MONTHS[selectedMonth].name} days`}>
                  {getMonthGrid(selectedMonth).map((day, index) => {
                    if (day === null) {
                      return (
                        <span
                          key={`empty-${index}`}
                          className="myd-calendar-cell myd-calendar-cell-empty"
                          aria-hidden
                        />
                      );
                    }

                    const key = dateKey(selectedMonth, day);
                    const hasEvents = (events[key]?.length ?? 0) > 0;
                    const isSelected = day === selectedDay;

                    return (
                      <button
                        key={key}
                        type="button"
                        className="myd-calendar-cell"
                        data-has-events={hasEvents ? "true" : undefined}
                        data-selected={isSelected ? "true" : undefined}
                        onClick={() => openDayMenu(selectedMonth, day)}
                        aria-label={`${MONTHS[selectedMonth].name} ${day}${hasEvents ? ", has events" : ""}`}
                      >
                        <span>{day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {mode === "list" ? (
              <div className="myd-list-view" data-delete-mode={deleteMode ? "true" : undefined}>
                <div className="myd-panel-row">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDeleteId(null);
                      setMode("hub");
                    }}
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDeleteId(null);
                      seedSampleEvent();
                    }}
                  >
                    <Plus size={16} />
                    Sample
                  </button>
                </div>
                <p>
                  {deleteMode
                    ? "Select an event, then confirm deletion."
                    : "Saved events for this day."}
                </p>
                {eventsForDay.length > 0 ? (
                  <ul>
                    {eventsForDay.map((item) => {
                      const deletePending = pendingDeleteId === item.id;

                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            aria-controls={
                              deletePending ? `delete-confirm-${item.id}` : undefined
                            }
                            aria-expanded={deletePending ? true : undefined}
                            onClick={() => {
                              if (deleteMode) {
                                setPendingDeleteId(item.id);
                                setNotice("");
                                return;
                              }

                              setActiveEventId(item.id);
                              setDetailReturnMode("list");
                              setMode("detail");
                            }}
                          >
                            <span>{item.time}</span>
                            <strong>{item.title}</strong>
                            <small>{item.location}</small>
                          </button>
                          {deletePending ? (
                            <div
                              className="myd-delete-confirm"
                              id={`delete-confirm-${item.id}`}
                              role="group"
                              aria-label={`Confirm delete ${item.title}`}
                            >
                              <p>Delete this event?</p>
                              <button
                                type="button"
                                className="myd-danger-button"
                                onClick={() => deleteEvent(item.id)}
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingDeleteId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="myd-empty-state">
                    <CalendarDays size={22} />
                    <span>No events yet for this day.</span>
                  </div>
                )}
              </div>
            ) : null}

            {mode === "detail" && activeEvent ? (
              <article className="myd-detail-view">
                <button
                  type="button"
                  onClick={() => {
                    setPendingDeleteId(null);
                    setMode(detailReturnMode);
                  }}
                >
                  <ChevronLeft size={16} />
                  Back to events
                </button>
                <h2>{activeEvent.title}</h2>
                <dl>
                  <div>
                    <dt>
                      <Clock3 size={14} />
                      Time
                    </dt>
                    <dd>{activeEvent.time}</dd>
                  </div>
                  <div>
                    <dt>
                      <MapPin size={14} />
                      Location
                    </dt>
                    <dd>{activeEvent.location}</dd>
                  </div>
                  <div>
                    <dt>Description</dt>
                    <dd>{activeEvent.description}</dd>
                  </div>
                </dl>
              </article>
            ) : null}

            {mode === "form" ? (
              <form className="myd-event-form" onSubmit={saveEvent}>
                <div className="myd-panel-row">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDeleteId(null);
                      if (editingEventId) {
                        setMode("detail");
                        resetForm();
                        return;
                      }

                      setMode("hub");
                    }}
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                </div>
                <label className="myd-form-field">
                  <span>Title</span>
                  <input
                    name="event-title"
                    type="text"
                    autoComplete="off"
                    value={formValues.title}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    maxLength={60}
                    required
                  />
                </label>
                <fieldset>
                  <legend>Time</legend>
                  <div className="myd-time-picker">
                    <TimeWheel
                      label="Hour"
                      value={pad2(time.hour)}
                      onDown={() => stepTime("hour", -1)}
                      onUp={() => stepTime("hour", 1)}
                    />
                    <span>:</span>
                    <TimeWheel
                      label="Minute"
                      value={pad2(time.minute)}
                      onDown={() => stepTime("minute", -5)}
                      onUp={() => stepTime("minute", 5)}
                    />
                    <div className="myd-ampm" role="group" aria-label="AM or PM">
                      {(["AM", "PM"] as const).map((value) => (
                        <button
                          type="button"
                          key={value}
                          data-active={time.meridiem === value ? "true" : undefined}
                          onClick={() =>
                            setTime((current) => ({
                              ...current,
                              meridiem: value,
                            }))
                          }
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                </fieldset>
                <label className="myd-form-field">
                  <span>Location</span>
                  <input
                    name="event-location"
                    type="text"
                    autoComplete="off"
                    value={formValues.location}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    maxLength={64}
                    required
                  />
                </label>
                <label className="myd-form-field myd-description-field">
                  <span>Short description</span>
                  <textarea
                    name="event-description"
                    autoComplete="off"
                    rows={1}
                    value={formValues.description}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    maxLength={180}
                    required
                  />
                </label>
                {formError ? (
                  <p className="myd-form-error" role="alert">
                    {formError}
                  </p>
                ) : null}
                <div className="myd-form-actions">
                  <button type="submit">{editingEventId ? "Update event" : "Save event"}</button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDeleteId(null);
                      resetForm();
                      setMode(editingEventId ? "detail" : "hub");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

type TimeWheelProps = {
  label: string;
  value: string;
  onUp: () => void;
  onDown: () => void;
};

type MenuActionsProps = {
  firstButtonRef?: RefObject<HTMLButtonElement | null>;
  onAdd: () => void;
  onShow: () => void;
  onDelete: () => void;
};

function MenuActions({
  firstButtonRef,
  onAdd,
  onShow,
  onDelete,
}: MenuActionsProps) {
  return (
    <div className="myd-menu-view">
      <button type="button" ref={firstButtonRef} onClick={onAdd}>
        <Plus size={18} />
        <span>
          <strong>Add events</strong>
          <small>Create a saved event for this day.</small>
        </span>
      </button>
      <button type="button" onClick={onShow}>
        <List size={18} />
        <span>
          <strong>Show events</strong>
          <small>Browse saved events for this day.</small>
        </span>
      </button>
      <button type="button" onClick={onDelete}>
        <Trash2 size={18} />
        <span>
          <strong>Delete an event</strong>
          <small>Remove an event from this day.</small>
        </span>
      </button>
    </div>
  );
}

function TimeWheel({ label, value, onUp, onDown }: TimeWheelProps) {
  return (
    <div className="myd-time-wheel">
      <button type="button" onClick={onDown} aria-label={`Decrease ${label}`}>
        <ChevronLeft size={13} />
      </button>
      <output aria-label={label}>{value}</output>
      <button type="button" onClick={onUp} aria-label={`Increase ${label}`}>
        <ChevronRight size={13} />
      </button>
    </div>
  );
}
