import { useState, useEffect, useCallback } from 'react';
import {
  Employee,
  Zone,
  Schedule,
  Assignment,
  ScheduleRules,
  SharedStaffingDay,
  DEFAULT_ZONES,
  DEFAULT_RULES,
  DayOfWeek,
  DAYS_OF_WEEK,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../types/scheduling';

// Storage keys
const STORAGE_KEYS = {
  employees: 'scheduling_employees',
  zones: 'scheduling_zones',
  schedules: 'scheduling_schedules',
  rules: 'scheduling_rules',
  sharedStaffing: 'scheduling_shared_staffing',
};

// Helper to generate unique IDs
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Load from localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Save to localStorage
const saveToStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Custom hook for scheduling store
export const useSchedulingStore = () => {
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage(STORAGE_KEYS.employees, [])
  );
  const [zones, setZones] = useState<Zone[]>(() =>
    loadFromStorage(STORAGE_KEYS.zones, DEFAULT_ZONES)
  );
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    loadFromStorage(STORAGE_KEYS.schedules, [])
  );
  const [rules, setRules] = useState<ScheduleRules>(() =>
    loadFromStorage(STORAGE_KEYS.rules, DEFAULT_RULES)
  );
  const [sharedStaffing, setSharedStaffing] = useState<SharedStaffingDay[]>(() =>
    loadFromStorage(STORAGE_KEYS.sharedStaffing, [])
  );

  // Persist to localStorage when state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.employees, employees);
  }, [employees]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.zones, zones);
  }, [zones]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.schedules, schedules);
  }, [schedules]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.rules, rules);
  }, [rules]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.sharedStaffing, sharedStaffing);
  }, [sharedStaffing]);

  // Employee CRUD
  const addEmployee = useCallback((employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = { ...employee, id: generateId() };
    setEmployees((prev) => [...prev, newEmployee]);
    return newEmployee;
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  }, []);

  // Zone CRUD
  const addZone = useCallback((zone: Omit<Zone, 'id'>) => {
    const newZone: Zone = { ...zone, id: generateId() };
    setZones((prev) => [...prev, newZone]);
    return newZone;
  }, []);

  const updateZone = useCallback((id: string, updates: Partial<Zone>) => {
    setZones((prev) =>
      prev.map((zone) => (zone.id === id ? { ...zone, ...updates } : zone))
    );
  }, []);

  const deleteZone = useCallback((id: string) => {
    setZones((prev) => prev.filter((zone) => zone.id !== id));
  }, []);

  // Schedule operations
  const getOrCreateSchedule = useCallback((weekStartDate: string): Schedule => {
    const existing = schedules.find((s) => s.weekStartDate === weekStartDate);
    if (existing) return existing;

    const newSchedule: Schedule = {
      id: generateId(),
      weekStartDate,
      assignments: [],
      isGenerated: false,
      lastModified: new Date().toISOString(),
    };
    setSchedules((prev) => [...prev, newSchedule]);
    return newSchedule;
  }, [schedules]);

  const updateSchedule = useCallback((id: string, updates: Partial<Schedule>) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id
          ? { ...schedule, ...updates, lastModified: new Date().toISOString() }
          : schedule
      )
    );
  }, []);

  const addAssignment = useCallback((scheduleId: string, assignment: Omit<Assignment, 'id'>) => {
    const newAssignment: Assignment = { ...assignment, id: generateId() };
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              assignments: [...schedule.assignments, newAssignment],
              lastModified: new Date().toISOString(),
            }
          : schedule
      )
    );
    return newAssignment;
  }, []);

  const updateAssignment = useCallback(
    (scheduleId: string, assignmentId: string, updates: Partial<Assignment>) => {
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId
            ? {
                ...schedule,
                assignments: schedule.assignments.map((a) =>
                  a.id === assignmentId ? { ...a, ...updates, isManualOverride: true } : a
                ),
                lastModified: new Date().toISOString(),
              }
            : schedule
        )
      );
    },
    []
  );

  const deleteAssignment = useCallback((scheduleId: string, assignmentId: string) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              assignments: schedule.assignments.filter((a) => a.id !== assignmentId),
              lastModified: new Date().toISOString(),
            }
          : schedule
      )
    );
  }, []);

  // Calculate hours for an employee in a schedule
  const calculateEmployeeHours = useCallback(
    (scheduleId: string, employeeId: string, day?: DayOfWeek): number => {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule) return 0;

      const assignments = schedule.assignments.filter(
        (a) => a.employeeId === employeeId && (day ? a.day === day : true)
      );

      return assignments.reduce((total, assignment) => {
        const [startH, startM] = assignment.timeSlot.start.split(':').map(Number);
        const [endH, endM] = assignment.timeSlot.end.split(':').map(Number);
        const hours = endH - startH + (endM - startM) / 60;
        return total + hours;
      }, 0);
    },
    [schedules]
  );

  // Validate schedule
  const validateSchedule = useCallback(
    (scheduleId: string): ValidationResult => {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule) {
        return { isValid: false, warnings: [], errors: [{ type: 'hours_exceeded', message: 'Schedule not found' }] };
      }

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Check employee hours
      employees.forEach((employee) => {
        const weeklyHours = calculateEmployeeHours(scheduleId, employee.id);
        const maxWeekly = employee.maxHoursPerWeek || rules.maxHoursPerWeek;

        if (weeklyHours > maxWeekly) {
          errors.push({
            type: 'hours_exceeded',
            message: `${employee.name} excede ${maxWeekly}h semanais (${weeklyHours}h)`,
            employeeId: employee.id,
          });
        } else if (weeklyHours > maxWeekly * 0.9) {
          warnings.push({
            type: 'hours_near_limit',
            message: `${employee.name} perto do limite semanal (${weeklyHours}/${maxWeekly}h)`,
            employeeId: employee.id,
          });
        }

        // Check daily hours
        DAYS_OF_WEEK.forEach((day) => {
          const dailyHours = calculateEmployeeHours(scheduleId, employee.id, day);
          const maxDaily = employee.maxHoursPerDay || rules.maxHoursPerDay;

          if (dailyHours > maxDaily) {
            errors.push({
              type: 'hours_exceeded',
              message: `${employee.name} excede ${maxDaily}h em ${day}`,
              employeeId: employee.id,
              day,
            });
          }
        });
      });

      // Check zone staffing
      zones.forEach((zone) => {
        DAYS_OF_WEEK.forEach((day) => {
          const zoneAssignments = schedule.assignments.filter(
            (a) => a.zoneId === zone.id && a.day === day
          );

          if (zoneAssignments.length < zone.minStaffPerDay) {
            errors.push({
              type: 'zone_understaffed',
              message: `${zone.name} precisa de ${zone.minStaffPerDay} pessoas em ${day} (tem ${zoneAssignments.length})`,
              zoneId: zone.id,
              day,
            });
          }
        });
      });

      return {
        isValid: errors.length === 0,
        warnings,
        errors,
      };
    },
    [schedules, employees, zones, rules, calculateEmployeeHours]
  );

  // Update rules
  const updateRules = useCallback((updates: Partial<ScheduleRules>) => {
    setRules((prev) => ({ ...prev, ...updates }));
  }, []);

  // Shared staffing
  const addSharedStaffingDay = useCallback((day: Omit<SharedStaffingDay, 'id'>) => {
    setSharedStaffing((prev) => [...prev, day]);
  }, []);

  const removeSharedStaffingDay = useCallback((date: string) => {
    setSharedStaffing((prev) => prev.filter((d) => d.date !== date));
  }, []);

  // Reset to defaults
  const resetZonesToDefaults = useCallback(() => {
    setZones(DEFAULT_ZONES);
  }, []);

  const resetRulesToDefaults = useCallback(() => {
    setRules(DEFAULT_RULES);
  }, []);

  return {
    // State
    employees,
    zones,
    schedules,
    rules,
    sharedStaffing,

    // Employee operations
    addEmployee,
    updateEmployee,
    deleteEmployee,

    // Zone operations
    addZone,
    updateZone,
    deleteZone,
    resetZonesToDefaults,

    // Schedule operations
    getOrCreateSchedule,
    updateSchedule,
    addAssignment,
    updateAssignment,
    deleteAssignment,

    // Validation and calculations
    calculateEmployeeHours,
    validateSchedule,

    // Rules
    updateRules,
    resetRulesToDefaults,

    // Shared staffing
    addSharedStaffingDay,
    removeSharedStaffingDay,
  };
};

export type SchedulingStore = ReturnType<typeof useSchedulingStore>;