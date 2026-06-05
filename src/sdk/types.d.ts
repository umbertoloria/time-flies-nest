// Types
// 2026-06-03T18:22:49Z
// v3.8

// Calendar
export type TCalendarPrev = TCalendarRcd & {
  doneTaskDates?: string[];
  todoDates?: string[];
};
export type TCalendar = TCalendarRcd & {
  days: TDay[];
  plannedDays?: TDay[];
};
export type TCalendarRcd = {
  id: number;
  name: string;
  color: string;
  plannedColor: string;
  usesNotes?: boolean;
};
export type TDay = {
  date: string; // Es. "2023-01-01"
  notes?: string;
};
// Todos
export type TNewTodo = {
  id: number;
  // date: string
  notes?: string;
};
export type TNewDoneTask = {
  id: number;
  // date: string
  notes?: string;
};

// Schedule
export type TSchedule = {
  groups: TExerciseGroup[];
};
export type TExerciseGroup = {
  id: number;
  name: string;
  exercises: TExercise[];
};
export type TExercise = {
  id: number;
  name: string;
  gc?: {
    bass: string; // Es. "xx-x----"
    ghost: string; // Es. "-xx-xx-x"
    hhr: string; // Es, "W-vvW-vv"
    cymbal: 'hh' | 'ride'; // Es. "hh" | "ride"
  };
  records?: TExerciseRecord[];
};
export type TExerciseRecord = {
  id: number;
  bpm: number;
  minutes?: number;
  hand?: 'dx' | 'sx';
  bars_num?: number;
  ts_above?: number;
  ts_below?: number;
};

// SDK: Schedule
export namespace TScheduleSDK {
  export type ReadScheduleAndAllExerciseGroups = {
    schedule: TSchedule;
    allExerciseGroups: TExerciseGroup[];
  };
}
export namespace TCalendarSDK {
  // Read Planned Events Response
  export type ReadPlannedEventsResponse = {
    dates: ReadPlannedEventsResponseDateBox[];
  };
  export type ReadPlannedEventsResponseDateBox = {
    date: string;
    calendars: ReadPlannedEventsResponseCalendar[];
  };
  export type ReadPlannedEventsResponseCalendar = TCalendarRcd & {
    todos: TNewTodo[];
  };
  // Read Date Response
  export type ReadDateResponse = {
    date: string;
    calendar: TCalendarRcd;
    doneTasks: TNewDoneTask[];
    todos: TNewTodo[];
  };
}
