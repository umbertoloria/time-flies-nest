// Types
// 2026-07-04T19:07:22Z
// v3.12

// Calendar
export type TCalendarPrev = TCalendarRcd & {
  doneTaskDates?: string[];
  todoDates?: string[];
};
export type TCalendar = TCalendarRcd & {
  days: TDay[];
  plannedDays?: Array<TNewTodo & { date: string }>;
  unplannedTodos?: TNewTodo[];
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
  taskId?: number;
  todoId?: number;
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

// SDK: Calendar
export namespace TCalendarSDK {
  // Read Planned Events Response
  export type ReadPlannedEventsResponse = {
    dates: ReadPlannedEventsResponseDateBox[];
    unplannedTodosCalendars?: ReadUnplannedTodosCalendar[];
  };
  export type ReadPlannedEventsResponseDateBox = {
    date: string;
    calendars: ReadPlannedEventsResponseCalendar[];
  };
  export type ReadPlannedEventsResponseCalendar = TCalendarRcd & {
    sortedPin?: number;
    todos?: TNewTodo[];
    doneTasks?: TNewDoneTask[];
  };
  // Read Date Response
  export type ReadDateResponse = {
    date: string;
    calendar: TCalendarRcd;
    doneTasks: TNewDoneTask[];
    todos: TNewTodo[];
  };
  export type ReadUnplannedTodosCalendar = TCalendarRcd & {
    sortedPin?: number;
    todos?: TNewTodo[];
  };
}
