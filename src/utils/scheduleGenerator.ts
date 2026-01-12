import {
  Employee,
  Zone,
  Schedule,
  Assignment,
  ScheduleRules,
  DayOfWeek,
  DAYS_OF_WEEK,
  TimeSlot,
} from '../types/scheduling';
import { generateId } from '../store/schedulingStore';

interface GeneratorOptions {
  keepManualOverrides: boolean;
  respectPreferences: boolean;
  optimizeForSkills: boolean;
}

const DEFAULT_OPTIONS: GeneratorOptions = {
  keepManualOverrides: true,
  respectPreferences: true,
  optimizeForSkills: true,
};

// Calculate hours from a time slot
const calculateHours = (timeSlot: TimeSlot): number => {
  const [startH, startM] = timeSlot.start.split(':').map(Number);
  const [endH, endM] = timeSlot.end.split(':').map(Number);
  return endH - startH + (endM - startM) / 60;
};

// Check if employee is available on a day
const isEmployeeAvailable = (employee: Employee, day: DayOfWeek): boolean => {
  if (employee.preferences.unavailableDays.includes(day)) {
    return false;
  }
  return true;
};

// Check if employee prefers this day
const doesEmployeePreferDay = (employee: Employee, day: DayOfWeek): boolean => {
  if (employee.preferences.preferredDays.length === 0) return true;
  return employee.preferences.preferredDays.includes(day);
};

// Get employee skill level for a zone (0 if not skilled)
const getSkillLevel = (employee: Employee, zoneId: string): number => {
  const skill = employee.skills.find((s) => s.zoneId === zoneId);
  return skill?.proficiencyLevel || 0;
};

// Sort employees by preference score for a zone/day assignment
const scoreEmployee = (
  employee: Employee,
  zoneId: string,
  day: DayOfWeek,
  currentWeeklyHours: number,
  options: GeneratorOptions
): number => {
  let score = 0;

  // Base score: can they work this zone?
  const skillLevel = getSkillLevel(employee, zoneId);
  if (skillLevel === 0) return -1000; // Cannot work this zone

  // Skill bonus (higher skill = better fit)
  if (options.optimizeForSkills) {
    score += skillLevel * 20;
  }

  // Preference bonus
  if (options.respectPreferences) {
    if (doesEmployeePreferDay(employee, day)) {
      score += 30;
    }
    
    // Hours preference: prefer employees who haven't reached their preferred hours
    const preferredHours = employee.preferences.preferredHoursPerWeek || employee.maxHoursPerWeek;
    if (currentWeeklyHours < preferredHours) {
      score += 20;
    }
  }

  // Availability check
  if (!isEmployeeAvailable(employee, day)) {
    return -1000;
  }

  // Balance workload: prefer employees with fewer hours assigned
  score -= currentWeeklyHours * 2;

  return score;
};

// Generate schedule for a week
export const generateSchedule = (
  employees: Employee[],
  zones: Zone[],
  rules: ScheduleRules,
  weekStartDate: string,
  existingSchedule?: Schedule,
  options: GeneratorOptions = DEFAULT_OPTIONS
): Schedule => {
  const activeEmployees = employees.filter((e) => e.active);
  
  // Track hours per employee
  const employeeWeeklyHours: Map<string, number> = new Map();
  const employeeDailyHours: Map<string, Map<DayOfWeek, number>> = new Map();
  
  activeEmployees.forEach((emp) => {
    employeeWeeklyHours.set(emp.id, 0);
    const dailyMap = new Map<DayOfWeek, number>();
    DAYS_OF_WEEK.forEach((day) => dailyMap.set(day, 0));
    employeeDailyHours.set(emp.id, dailyMap);
  });

  // Start with manual overrides if keeping them
  const assignments: Assignment[] = [];
  
  if (existingSchedule && options.keepManualOverrides) {
    existingSchedule.assignments
      .filter((a) => a.isManualOverride)
      .forEach((a) => {
        assignments.push({ ...a });
        const hours = calculateHours(a.timeSlot);
        const currentWeekly = employeeWeeklyHours.get(a.employeeId) || 0;
        employeeWeeklyHours.set(a.employeeId, currentWeekly + hours);
        
        const dailyMap = employeeDailyHours.get(a.employeeId);
        if (dailyMap) {
          const currentDaily = dailyMap.get(a.day) || 0;
          dailyMap.set(a.day, currentDaily + hours);
        }
      });
  }

  // Generate assignments for each zone and day
  DAYS_OF_WEEK.forEach((day) => {
    zones.forEach((zone) => {
      // Count existing assignments for this zone/day
      const existingCount = assignments.filter(
        (a) => a.zoneId === zone.id && a.day === day
      ).length;
      
      const neededStaff = zone.minStaffPerDay - existingCount;
      
      if (neededStaff <= 0) return;

      // Score all available employees
      const scoredEmployees = activeEmployees
        .map((emp) => ({
          employee: emp,
          score: scoreEmployee(
            emp,
            zone.id,
            day,
            employeeWeeklyHours.get(emp.id) || 0,
            options
          ),
        }))
        .filter((se) => se.score > -1000)
        .filter((se) => {
          // Check if already assigned to this zone/day
          const alreadyAssigned = assignments.some(
            (a) => a.employeeId === se.employee.id && a.day === day && a.zoneId === zone.id
          );
          if (alreadyAssigned) return false;

          // Check daily hours limit
          const dailyMap = employeeDailyHours.get(se.employee.id);
          const currentDaily = dailyMap?.get(day) || 0;
          const shiftHours = calculateHours(zone.operatingHours);
          const maxDaily = se.employee.maxHoursPerDay || rules.maxHoursPerDay;
          if (currentDaily + shiftHours > maxDaily) return false;

          // Check weekly hours limit
          const currentWeekly = employeeWeeklyHours.get(se.employee.id) || 0;
          const maxWeekly = se.employee.maxHoursPerWeek || rules.maxHoursPerWeek;
          if (currentWeekly + shiftHours > maxWeekly) return false;

          // Check if can work multiple zones per day
          if (!rules.allowMultipleZonesPerDay) {
            const hasOtherZone = assignments.some(
              (a) => a.employeeId === se.employee.id && a.day === day && a.zoneId !== zone.id
            );
            if (hasOtherZone) return false;
          }

          return true;
        })
        .sort((a, b) => b.score - a.score);

      // Assign top employees
      for (let i = 0; i < neededStaff && i < scoredEmployees.length; i++) {
        const emp = scoredEmployees[i].employee;
        const shiftHours = calculateHours(zone.operatingHours);

        const assignment: Assignment = {
          id: generateId(),
          employeeId: emp.id,
          zoneId: zone.id,
          day,
          timeSlot: { ...zone.operatingHours },
          isManualOverride: false,
        };

        assignments.push(assignment);

        // Update hours tracking
        const currentWeekly = employeeWeeklyHours.get(emp.id) || 0;
        employeeWeeklyHours.set(emp.id, currentWeekly + shiftHours);

        const dailyMap = employeeDailyHours.get(emp.id);
        if (dailyMap) {
          const currentDaily = dailyMap.get(day) || 0;
          dailyMap.set(day, currentDaily + shiftHours);
        }
      }
    });
  });

  return {
    id: existingSchedule?.id || generateId(),
    weekStartDate,
    assignments,
    isGenerated: true,
    lastModified: new Date().toISOString(),
  };
};

// Re-generate schedule keeping manual overrides
export const regenerateSchedule = (
  employees: Employee[],
  zones: Zone[],
  rules: ScheduleRules,
  existingSchedule: Schedule
): Schedule => {
  return generateSchedule(
    employees,
    zones,
    rules,
    existingSchedule.weekStartDate,
    existingSchedule,
    {
      keepManualOverrides: true,
      respectPreferences: true,
      optimizeForSkills: true,
    }
  );
};