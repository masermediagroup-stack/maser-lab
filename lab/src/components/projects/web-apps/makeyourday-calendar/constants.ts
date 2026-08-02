export const MONTHS = [
  { name: "January", short: "JAN", days: 31 },
  { name: "February", short: "FEB", days: 28 },
  { name: "March", short: "MAR", days: 31 },
  { name: "April", short: "APR", days: 30 },
  { name: "May", short: "MAY", days: 31 },
  { name: "June", short: "JUN", days: 30 },
  { name: "July", short: "JUL", days: 31 },
  { name: "August", short: "AUG", days: 31 },
  { name: "September", short: "SEP", days: 30 },
  { name: "October", short: "OCT", days: 31 },
  { name: "November", short: "NOV", days: 30 },
  { name: "December", short: "DEC", days: 31 },
] as const;

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const STORAGE_KEY = "makeyourday-calendar-events-v2";

export const SAMPLE_EVENT = {
  title: "Portfolio event review",
  time: "09:00 AM",
  location: "Studio",
  description: "Sketch calendar view ideas and list the first UX upgrades.",
};
