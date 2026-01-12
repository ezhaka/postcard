import { useState, useMemo } from 'react';
import { SchedulingStore } from '../../store/schedulingStore';
import { DayOfWeek, DAYS_OF_WEEK, DAY_LABELS, Assignment } from '../../types/scheduling';
import { generateSchedule, regenerateSchedule } from '../../utils/scheduleGenerator';

interface WeeklyCalendarProps {
  store: SchedulingStore;
}

const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const WeeklyCalendar = ({ store }: WeeklyCalendarProps) => {
  const {
    employees,
    zones,
    rules,
    schedules,
    getOrCreateSchedule,
    updateSchedule,
    addAssignment,
    deleteAssignment,
    validateSchedule,
  } = store;

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const [viewMode, setViewMode] = useState<'zone' | 'employee'>('zone');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: DayOfWeek; zoneId?: string; employeeId?: string } | null>(null);

  const weekStartKey = formatDateKey(currentWeekStart);
  
  const currentSchedule = useMemo(() => {
    return schedules.find((s) => s.weekStartDate === weekStartKey);
  }, [schedules, weekStartKey]);

  const validation = useMemo(() => {
    if (!currentSchedule) return null;
    return validateSchedule(currentSchedule.id);
  }, [currentSchedule, validateSchedule]);

  const weekDates = useMemo(() => {
    return DAYS_OF_WEEK.map((day, index) => ({
      day,
      date: addDays(currentWeekStart, index),
    }));
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const handleToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const handleGenerateSchedule = () => {
    const newSchedule = generateSchedule(
      employees,
      zones,
      rules,
      weekStartKey,
      currentSchedule
    );
    
    if (currentSchedule) {
      updateSchedule(currentSchedule.id, {
        assignments: newSchedule.assignments,
        isGenerated: true,
      });
    } else {
      const created = getOrCreateSchedule(weekStartKey);
      updateSchedule(created.id, {
        assignments: newSchedule.assignments,
        isGenerated: true,
      });
    }
  };

  const handleRegenerateSchedule = () => {
    if (!currentSchedule) return;
    
    const newSchedule = regenerateSchedule(employees, zones, rules, currentSchedule);
    updateSchedule(currentSchedule.id, {
      assignments: newSchedule.assignments,
      isGenerated: true,
    });
  };

  const handleCellClick = (day: DayOfWeek, zoneId?: string, employeeId?: string) => {
    setSelectedCell({ day, zoneId, employeeId });
    setShowAssignModal(true);
  };

  const handleAddAssignment = (employeeId: string, zoneId: string) => {
    if (!selectedCell) return;
    
    let schedule = currentSchedule;
    if (!schedule) {
      schedule = getOrCreateSchedule(weekStartKey);
    }

    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;

    addAssignment(schedule.id, {
      employeeId,
      zoneId,
      day: selectedCell.day,
      timeSlot: { ...zone.operatingHours },
      isManualOverride: true,
    });

    setShowAssignModal(false);
    setSelectedCell(null);
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    if (!currentSchedule) return;
    deleteAssignment(currentSchedule.id, assignmentId);
  };

  const getAssignmentsForCell = (day: DayOfWeek, zoneId?: string, employeeId?: string): Assignment[] => {
    if (!currentSchedule) return [];
    
    return currentSchedule.assignments.filter((a) => {
      if (a.day !== day) return false;
      if (zoneId && a.zoneId !== zoneId) return false;
      if (employeeId && a.employeeId !== employeeId) return false;
      return true;
    });
  };

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || 'Desconhecido';
  };

  const getZoneName = (zoneId: string) => {
    return zones.find((z) => z.id === zoneId)?.name || 'Desconhecida';
  };

  const getZoneColor = (zoneId: string) => {
    return zones.find((z) => z.id === zoneId)?.color || '#ccc';
  };

  const activeEmployees = employees.filter((e) => e.active);

  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="btn btn-secondary" onClick={handlePrevWeek}>
            ← Anterior
          </button>
          <button className="btn btn-secondary" onClick={handleToday}>
            Hoje
          </button>
          <button className="btn btn-secondary" onClick={handleNextWeek}>
            Próxima →
          </button>
        </div>
        
        <h2 className="week-title">
          Semana de {formatDateDisplay(currentWeekStart)} a {formatDateDisplay(addDays(currentWeekStart, 6))}
        </h2>

        <div className="calendar-actions">
          <select
            className="form-select"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'zone' | 'employee')}
            style={{ width: 'auto' }}
          >
            <option value="zone">Ver por Zona</option>
            <option value="employee">Ver por Funcionário</option>
          </select>
          
          {currentSchedule ? (
            <button className="btn btn-success" onClick={handleRegenerateSchedule}>
              🔄 Regenerar
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleGenerateSchedule}>
              ✨ Gerar Escala
            </button>
          )}
        </div>
      </div>

      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="validation-alerts">
          {validation.errors.map((error, i) => (
            <div key={`error-${i}`} className="alert alert-error">
              ❌ {error.message}
            </div>
          ))}
          {validation.warnings.map((warning, i) => (
            <div key={`warning-${i}`} className="alert alert-warning">
              ⚠️ {warning.message}
            </div>
          ))}
        </div>
      )}

      <div className="calendar-grid">
        <div className="calendar-corner">
          {viewMode === 'zone' ? 'Zona' : 'Funcionário'}
        </div>
        {weekDates.map(({ day, date }) => (
          <div key={day} className="calendar-day-header">
            <span className="day-name">{DAY_LABELS[day]}</span>
            <span className="day-date">{formatDateDisplay(date)}</span>
          </div>
        ))}

        {viewMode === 'zone' ? (
          zones.map((zone) => (
            <>
              <div
                key={`zone-${zone.id}`}
                className="calendar-row-header"
                style={{ borderLeftColor: zone.color }}
              >
                <div className="zone-color" style={{ backgroundColor: zone.color }} />
                <span>{zone.name}</span>
                <span className="min-staff">Min: {zone.minStaffPerDay}</span>
              </div>
              {DAYS_OF_WEEK.map((day) => {
                const assignments = getAssignmentsForCell(day, zone.id);
                const isUnderstaffed = assignments.length < zone.minStaffPerDay;
                
                return (
                  <div
                    key={`${zone.id}-${day}`}
                    className={`calendar-cell ${isUnderstaffed ? 'understaffed' : ''}`}
                    onClick={() => handleCellClick(day, zone.id)}
                  >
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className={`assignment-chip ${assignment.isManualOverride ? 'manual' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{getEmployeeName(assignment.employeeId)}</span>
                        <button
                          className="chip-remove"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {assignments.length === 0 && (
                      <span className="empty-cell">+ Adicionar</span>
                    )}
                  </div>
                );
              })}
            </>
          ))
        ) : (
          activeEmployees.map((employee) => (
            <>
              <div key={`emp-${employee.id}`} className="calendar-row-header employee-row">
                <div className="employee-avatar-small">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <span>{employee.name}</span>
              </div>
              {DAYS_OF_WEEK.map((day) => {
                const assignments = getAssignmentsForCell(day, undefined, employee.id);
                const isUnavailable = employee.preferences.unavailableDays.includes(day);
                
                return (
                  <div
                    key={`${employee.id}-${day}`}
                    className={`calendar-cell ${isUnavailable ? 'unavailable' : ''}`}
                    onClick={() => !isUnavailable && handleCellClick(day, undefined, employee.id)}
                  >
                    {isUnavailable ? (
                      <span className="unavailable-label">Indisponível</span>
                    ) : (
                      <>
                        {assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className={`assignment-chip ${assignment.isManualOverride ? 'manual' : ''}`}
                            style={{ backgroundColor: getZoneColor(assignment.zoneId) + '30', borderColor: getZoneColor(assignment.zoneId) }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>{getZoneName(assignment.zoneId)}</span>
                            <button
                              className="chip-remove"
                              onClick={() => handleRemoveAssignment(assignment.id)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {assignments.length === 0 && (
                          <span className="empty-cell">+ Adicionar</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </>
          ))
        )}
      </div>

      {showAssignModal && selectedCell && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                Adicionar Atribuição - {DAY_LABELS[selectedCell.day]}
              </h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            
            <div className="assign-modal-content">
              {viewMode === 'zone' && selectedCell.zoneId ? (
                <>
                  <p>Selecione um funcionário para <strong>{getZoneName(selectedCell.zoneId)}</strong>:</p>
                  <div className="assign-options">
                    {activeEmployees
                      .filter((emp) => {
                        // Check if employee has skill for this zone
                        const hasSkill = emp.skills.some((s) => s.zoneId === selectedCell.zoneId);
                        // Check if not already assigned to this zone/day
                        const alreadyAssigned = currentSchedule?.assignments.some(
                          (a) => a.employeeId === emp.id && a.zoneId === selectedCell.zoneId && a.day === selectedCell.day
                        );
                        // Check availability
                        const isUnavailable = emp.preferences.unavailableDays.includes(selectedCell.day);
                        return hasSkill && !alreadyAssigned && !isUnavailable;
                      })
                      .map((emp) => (
                        <button
                          key={emp.id}
                          className="assign-option"
                          onClick={() => handleAddAssignment(emp.id, selectedCell.zoneId!)}
                        >
                          <div className="employee-avatar-small">{emp.name.charAt(0)}</div>
                          <span>{emp.name}</span>
                        </button>
                      ))}
                    {activeEmployees.filter((emp) => {
                      const hasSkill = emp.skills.some((s) => s.zoneId === selectedCell.zoneId);
                      const alreadyAssigned = currentSchedule?.assignments.some(
                        (a) => a.employeeId === emp.id && a.zoneId === selectedCell.zoneId && a.day === selectedCell.day
                      );
                      const isUnavailable = emp.preferences.unavailableDays.includes(selectedCell.day);
                      return hasSkill && !alreadyAssigned && !isUnavailable;
                    }).length === 0 && (
                      <p className="no-options">Nenhum funcionário disponível com competência para esta zona</p>
                    )}
                  </div>
                </>
              ) : selectedCell.employeeId ? (
                <>
                  <p>Selecione uma zona para <strong>{getEmployeeName(selectedCell.employeeId)}</strong>:</p>
                  <div className="assign-options">
                    {zones
                      .filter((zone) => {
                        const emp = employees.find((e) => e.id === selectedCell.employeeId);
                        if (!emp) return false;
                        const hasSkill = emp.skills.some((s) => s.zoneId === zone.id);
                        const alreadyAssigned = currentSchedule?.assignments.some(
                          (a) => a.employeeId === selectedCell.employeeId && a.zoneId === zone.id && a.day === selectedCell.day
                        );
                        return hasSkill && !alreadyAssigned;
                      })
                      .map((zone) => (
                        <button
                          key={zone.id}
                          className="assign-option"
                          onClick={() => handleAddAssignment(selectedCell.employeeId!, zone.id)}
                        >
                          <div className="zone-color" style={{ backgroundColor: zone.color }} />
                          <span>{zone.name}</span>
                        </button>
                      ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .weekly-calendar {
          width: 100%;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .calendar-nav {
          display: flex;
          gap: 8px;
        }

        .week-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #333;
        }

        .calendar-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .validation-alerts {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .alert {
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .alert-error {
          background: rgba(255, 107, 107, 0.15);
          color: #d63031;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .alert-warning {
          background: rgba(255, 193, 7, 0.15);
          color: #d4a106;
          border: 1px solid rgba(255, 193, 7, 0.3);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: 180px repeat(7, 1fr);
          gap: 1px;
          background: #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
        }

        .calendar-corner {
          background: #f0f0f0;
          padding: 12px;
          font-weight: 600;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .calendar-day-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 8px;
          text-align: center;
        }

        .day-name {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .day-date {
          display: block;
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .calendar-row-header {
          background: #f8f9fa;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          border-left: 4px solid transparent;
        }

        .calendar-row-header .zone-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .min-staff {
          font-size: 0.75rem;
          color: #888;
          margin-left: auto;
        }

        .employee-row {
          border-left-color: #667eea;
        }

        .employee-avatar-small {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .calendar-cell {
          background: white;
          padding: 8px;
          min-height: 80px;
          cursor: pointer;
          transition: background 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .calendar-cell:hover {
          background: #f8f9fa;
        }

        .calendar-cell.understaffed {
          background: rgba(255, 107, 107, 0.1);
        }

        .calendar-cell.unavailable {
          background: #f0f0f0;
          cursor: not-allowed;
        }

        .unavailable-label {
          color: #999;
          font-size: 0.8rem;
          font-style: italic;
        }

        .empty-cell {
          color: #bbb;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .assignment-chip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 8px;
          background: rgba(102, 126, 234, 0.15);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .assignment-chip.manual {
          border-style: dashed;
          border-width: 2px;
        }

        .chip-remove {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 1rem;
          padding: 0 0 0 6px;
          line-height: 1;
        }

        .chip-remove:hover {
          color: #ff6b6b;
        }

        .assign-modal-content {
          padding: 16px 0;
        }

        .assign-modal-content p {
          margin: 0 0 16px 0;
          color: #666;
        }

        .assign-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .assign-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .assign-option:hover {
          border-color: #667eea;
          background: white;
        }

        .assign-option .zone-color {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }

        .no-options {
          color: #999;
          font-style: italic;
          text-align: center;
          padding: 20px;
        }

        @media (max-width: 1024px) {
          .calendar-grid {
            grid-template-columns: 120px repeat(7, 1fr);
            font-size: 0.85rem;
          }

          .calendar-row-header span:not(.min-staff) {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        @media (max-width: 768px) {
          .calendar-header {
            flex-direction: column;
            align-items: stretch;
          }

          .calendar-nav {
            justify-content: center;
          }

          .week-title {
            text-align: center;
          }

          .calendar-actions {
            justify-content: center;
          }

          .calendar-grid {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};