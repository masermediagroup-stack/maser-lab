export type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
};

export type EventStore = Record<string, CalendarEvent[]>;

export type PanelMode = "menu" | "list" | "detail" | "form";

export type TimeState = {
  hour: number;
  minute: number;
  meridiem: "AM" | "PM";
};
