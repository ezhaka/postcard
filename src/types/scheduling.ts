// Employee types
export interface Employee {
  id: string;
  name: string;
  skills: EmployeeSkill[];
  preferences: EmployeePreferences;
  maxHoursPerWeek: number;
  maxHoursPerDay: number;
  active: boolean;
}

export interface EmployeeSkill {
  zoneId: string;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5; // 1 = beginner, 5 = expert
}

export interface EmployeePreferences {
  preferredDays: DayOfWeek[];
  preferredTimeSlots: TimeSlot[];
  preferredHoursPerWeek: number;
  unavailableDays: DayOfWeek[];
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

// Zone types
export interface Zone {
  id: string;
  name: string;
  minStaffPerDay: number;
  operatingHours: TimeSlot;
  color: string;
}

// Schedule types
export interface Schedule {
  id: string;
  weekStartDate: string; // ISO date string (Monday)
  assignments: Assignment[];
  isGenerated: boolean;
  lastModified: string;
}

export interface Assignment {
  id: string;
  employeeId: string;
  zoneId: string;
  day: DayOfWeek;
  timeSlot: TimeSlot;
  isManualOverride: boolean;
}

// Rules types
export interface ScheduleRules {
  maxHoursPerWeek: number;
  maxHoursPerDay: number;
  minBreakBetweenShifts: number; // in minutes
  maxBreaksPerDay: number;
  breakDuration: number; // in minutes
  allowMultipleZonesPerDay: boolean;
}

// For days when zones can share minimum staff
export interface SharedStaffingDay {
  date: string;
  zoneIds: string[];
  combinedMinStaff: number;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
}

export interface ValidationWarning {
  type: 'preference_conflict' | 'suboptimal_skill' | 'hours_near_limit';
  message: string;
  employeeId?: string;
  zoneId?: string;
  day?: DayOfWeek;
}

export interface ValidationError {
  type: 'hours_exceeded' | 'zone_understaffed' | 'employee_unavailable' | 'skill_missing';
  message: string;
  employeeId?: string;
  zoneId?: string;
  day?: DayOfWeek;
}

// Constants
export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

// Default zones for testing
export const DEFAULT_ZONES: Zone[] = [
  { id: 'grelhador', name: 'Grelhador', minStaffPerDay: 2, operatingHours: { start: '10:00', end: '23:00' }, color: '#FF6B6B' },
  { id: 'talho', name: 'Talho', minStaffPerDay: 1, operatingHours: { start: '09:00', end: '20:00' }, color: '#4ECDC4' },
  { id: 'sala-oval', name: 'Sala Oval', minStaffPerDay: 2, operatingHours: { start: '12:00', end: '23:00' }, color: '#45B7D1' },
  { id: 'sala-interior', name: 'Sala Interior', minStaffPerDay: 2, operatingHours: { start: '12:00', end: '23:00' }, color: '#96CEB4' },
  { id: 'esplanada', name: 'Esplanada', minStaffPerDay: 2, operatingHours: { start: '12:00', end: '23:00' }, color: '#FFEAA7' },
  { id: 'rececao', name: 'Receção', minStaffPerDay: 1, operatingHours: { start: '10:00', end: '23:00' }, color: '#DDA0DD' }
];

// Default schedule rules
export const DEFAULT_RULES: ScheduleRules = {
  maxHoursPerWeek: 40,
  maxHoursPerDay: 8,
  minBreakBetweenShifts: 30,
  maxBreaksPerDay: 2,
  breakDuration: 30,
  allowMultipleZonesPerDay: true
};