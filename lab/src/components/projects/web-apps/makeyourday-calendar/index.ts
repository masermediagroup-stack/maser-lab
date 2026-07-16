/**
 * Product export surface for MakeYourDay calendar.
 * Lab demo chrome lives in `makeyourday-calendar-demo.tsx` and is registered
 * from `lab/src/components/projects/registry.ts` — do not re-export it here.
 */
export {
  MakeYourDayCalendarApp,
  type MakeYourDayCalendarAppProps,
} from "./makeyourday-calendar";

export type {
  CalendarEvent,
  EventStore,
  ListedEvent,
  PanelMode,
  TimeState,
} from "./types";
