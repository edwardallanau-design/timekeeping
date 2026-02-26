// ─── Domain / API shapes ──────────────────────────────────────────────────────

/** A registered user returned from the backend. */
export interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

/** Attendance classification returned by the backend as an uppercase enum string. */
export type AttendanceStatus = 'PRESENT' | 'HALF_DAY' | 'ABSENT';

/**
 * A single time log record for one day.
 * timeIn / timeOut are ISO-8601 strings (backend serialises LocalDateTime as a string).
 * timeOut is null when the user has clocked in but not yet clocked out.
 */
export interface TimeLogDto {
  id: number;
  userId: number;
  timeIn: string;
  timeOut: string | null;
  hoursWorked: number;
  status: AttendanceStatus;
}

/**
 * One row in the monthly attendance response.
 * date is an ISO date string ("yyyy-MM-dd").
 */
export interface AttendanceLog {
  date: string;
  status: AttendanceStatus;
  hoursWorked: number;
}

// ─── Auth request/response shapes ─────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  department: string;
}

/** Shape returned by POST /auth/login and POST /auth/register. */
export interface AuthResponse {
  token: string;
  user: User;
}

/** Shape returned by GET /auth/me. */
export interface MeResponse {
  user: User;
}

// ─── API response wrappers ────────────────────────────────────────────────────

/** GET /timelog/daily returns { success, timeLog }. */
export interface DailyLogResponse {
  success: boolean;
  timeLog: TimeLogDto | null;
}

/** GET /timelog/monthly returns { logs }. */
export interface MonthlyAttendanceResponse {
  logs: AttendanceLog[];
}

// ─── Component prop interfaces ────────────────────────────────────────────────

export interface TimesheetProps {
  onTimeLogUpdate: () => void;
}

export interface AttendanceCalendarProps {
  refreshTrigger: number;
}

// ─── AuthContext value shape ───────────────────────────────────────────────────

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// ─── Timesheet local state ────────────────────────────────────────────────────

/**
 * Data shown in the confirmation modal before the user confirms time-out.
 * status is a display string computed client-side (not the backend enum).
 */
export interface ConfirmationData {
  hoursWorked: number;
  status: 'half-day' | 'present';
}
