export type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
};

export type EventStore = Record<string, CalendarEvent[]>;

export type PanelMode =
  | "hub"
  | "menu"
  | "list"
  | "detail"
  | "form"
  | "calendar";

export type TimeState = {
  hour: number;
  minute: number;
  meridiem: "AM" | "PM";
};
