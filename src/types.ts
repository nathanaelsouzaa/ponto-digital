export type UserRole = 'employee' | 'admin';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  registration: string;
  hiringDate?: string;
  salary?: number;
}

export interface PontoRecord {
  id: string;
  employeeId: string;
  type: 'Entrada' | 'Saída' | 'Intervalo';
  timestamp: Date;
  location: string;
  isExtra?: boolean;
  extraPercentage?: 50 | 100;
}

export interface DaySchedule {
  start: string;
  end: string;
  isWorkDay: boolean;
}

export type WorkSchedule = Record<string, DaySchedule>;

export type Screen = 'home' | 'history' | 'reports' | 'profile' | 'management';
