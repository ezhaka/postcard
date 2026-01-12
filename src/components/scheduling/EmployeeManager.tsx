import { useState } from 'react';
import { SchedulingStore } from '../../store/schedulingStore';
import { Employee, EmployeeSkill, DayOfWeek, DAYS_OF_WEEK, DAY_LABELS } from '../../types/scheduling';

interface EmployeeManagerProps {
  store: SchedulingStore;
}

const DEFAULT_TIME_SLOTS = [
  { label: 'Manhã (08:00-14:00)', start: '08:00', end: '14:00' },
  { label: 'Tarde (14:00-20:00)', start: '14:00', end: '20:00' },
  { label: 'Noite (18:00-24:00)', start: '18:00', end: '24:00' },
  { label: 'Dia Completo (09:00-18:00)', start: '09:00', end: '18:00' },
];

export const EmployeeManager = ({ store }: EmployeeManagerProps) => {
  const { employees, zones, addEmployee, updateEmployee, deleteEmployee } = store;
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    skills: EmployeeSkill[];
    preferredDays: DayOfWeek[];
    preferredTimeSlots: { start: string; end: string }[];
    preferredHoursPerWeek: number;
    unavailableDays: DayOfWeek[];
    maxHoursPerWeek: number;
    maxHoursPerDay: number;
    active: boolean;
  }>({
    name: '',
    skills: [],
    preferredDays: [],
    preferredTimeSlots: [],
    preferredHoursPerWeek: 40,
    unavailableDays: [],
    maxHoursPerWeek: 40,
    maxHoursPerDay: 8,
    active: true,
  });

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        skills: [...employee.skills],
        preferredDays: [...employee.preferences.preferredDays],
        preferredTimeSlots: [...employee.preferences.preferredTimeSlots],
        preferredHoursPerWeek: employee.preferences.preferredHoursPerWeek,
        unavailableDays: [...employee.preferences.unavailableDays],
        maxHoursPerWeek: employee.maxHoursPerWeek,
        maxHoursPerDay: employee.maxHoursPerDay,
        active: employee.active,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        skills: [],
        preferredDays: [],
        preferredTimeSlots: [],
        preferredHoursPerWeek: 40,
        unavailableDays: [],
        maxHoursPerWeek: 40,
        maxHoursPerDay: 8,
        active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const employeeData = {
      name: formData.name,
      skills: formData.skills,
      preferences: {
        preferredDays: formData.preferredDays,
        preferredTimeSlots: formData.preferredTimeSlots,
        preferredHoursPerWeek: formData.preferredHoursPerWeek,
        unavailableDays: formData.unavailableDays,
      },
      maxHoursPerWeek: formData.maxHoursPerWeek,
      maxHoursPerDay: formData.maxHoursPerDay,
      active: formData.active,
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
    } else {
      addEmployee(employeeData);
    }
    handleCloseModal();
  };

  const handleDelete = (employee: Employee) => {
    if (confirm(`Tem certeza que deseja eliminar "${employee.name}"?`)) {
      deleteEmployee(employee.id);
    }
  };

  const toggleSkill = (zoneId: string) => {
    const existing = formData.skills.find((s) => s.zoneId === zoneId);
    if (existing) {
      setFormData({
        ...formData,
        skills: formData.skills.filter((s) => s.zoneId !== zoneId),
      });
    } else {
      setFormData({
        ...formData,
        skills: [...formData.skills, { zoneId, proficiencyLevel: 3 }],
      });
    }
  };

  const updateSkillLevel = (zoneId: string, level: 1 | 2 | 3 | 4 | 5) => {
    setFormData({
      ...formData,
      skills: formData.skills.map((s) =>
        s.zoneId === zoneId ? { ...s, proficiencyLevel: level } : s
      ),
    });
  };

  const toggleDay = (day: DayOfWeek, type: 'preferred' | 'unavailable') => {
    if (type === 'preferred') {
      const isSelected = formData.preferredDays.includes(day);
      setFormData({
        ...formData,
        preferredDays: isSelected
          ? formData.preferredDays.filter((d) => d !== day)
          : [...formData.preferredDays, day],
        unavailableDays: formData.unavailableDays.filter((d) => d !== day),
      });
    } else {
      const isSelected = formData.unavailableDays.includes(day);
      setFormData({
        ...formData,
        unavailableDays: isSelected
          ? formData.unavailableDays.filter((d) => d !== day)
          : [...formData.unavailableDays, day],
        preferredDays: formData.preferredDays.filter((d) => d !== day),
      });
    }
  };

  const toggleTimeSlot = (slot: { start: string; end: string }) => {
    const isSelected = formData.preferredTimeSlots.some(
      (s) => s.start === slot.start && s.end === slot.end
    );
    setFormData({
      ...formData,
      preferredTimeSlots: isSelected
        ? formData.preferredTimeSlots.filter(
            (s) => !(s.start === slot.start && s.end === slot.end)
          )
        : [...formData.preferredTimeSlots, slot],
    });
  };

  const getZoneName = (zoneId: string) => {
    return zones.find((z) => z.id === zoneId)?.name || zoneId;
  };

  const getZoneColor = (zoneId: string) => {
    return zones.find((z) => z.id === zoneId)?.color || '#ccc';
  };

  const renderStars = (level: number, onChange?: (level: 1 | 2 | 3 | 4 | 5) => void) => {
    return (
      <div className="skill-level">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`skill-star ${star <= level ? 'filled' : ''}`}
            onClick={() => onChange?.(star as 1 | 2 | 3 | 4 | 5)}
            style={{ cursor: onChange ? 'pointer' : 'default' }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="employee-manager">
      <div className="card-header">
        <h2 className="card-title">👥 Gestão de Funcionários</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          ➕ Novo Funcionário
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-text">Nenhum funcionário registado</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            Adicionar Funcionário
          </button>
        </div>
      ) : (
        <div className="employees-grid">
          {employees.map((employee) => (
            <div key={employee.id} className={`employee-card ${!employee.active ? 'inactive' : ''}`}>
              <div className="employee-header">
                <div className="employee-avatar">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
                <div className="employee-info">
                  <h3 className="employee-name">{employee.name}</h3>
                  <span className={`badge ${employee.active ? 'badge-success' : 'badge-warning'}`}>
                    {employee.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="employee-skills">
                <span className="section-label">Competências:</span>
                <div className="skills-list">
                  {employee.skills.length === 0 ? (
                    <span className="no-skills">Nenhuma zona atribuída</span>
                  ) : (
                    employee.skills.map((skill) => (
                      <div key={skill.zoneId} className="skill-badge" style={{ backgroundColor: getZoneColor(skill.zoneId) + '30', borderColor: getZoneColor(skill.zoneId) }}>
                        <span>{getZoneName(skill.zoneId)}</span>
                        {renderStars(skill.proficiencyLevel)}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="employee-hours">
                <span className="section-label">Horas:</span>
                <span>{employee.maxHoursPerWeek}h/semana • {employee.maxHoursPerDay}h/dia</span>
              </div>

              {employee.preferences.unavailableDays.length > 0 && (
                <div className="employee-unavailable">
                  <span className="section-label">Indisponível:</span>
                  <span>{employee.preferences.unavailableDays.map(d => DAY_LABELS[d]).join(', ')}</span>
                </div>
              )}

              <div className="employee-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(employee)}>
                  ✏️ Editar
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => updateEmployee(employee.id, { active: !employee.active })}
                >
                  {employee.active ? '⏸️ Desativar' : '▶️ Ativar'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(employee)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do funcionário"
                  required
                />
              </div>

              <div className="form-section">
                <h4 className="form-section-title">📍 Zonas/Competências</h4>
                <p className="form-section-desc">Selecione as zonas onde pode trabalhar e avalie a proficiência (1-5 estrelas)</p>
                <div className="zones-selection">
                  {zones.map((zone) => {
                    const skill = formData.skills.find((s) => s.zoneId === zone.id);
                    const isSelected = !!skill;
                    return (
                      <div
                        key={zone.id}
                        className={`zone-select-item ${isSelected ? 'selected' : ''}`}
                        style={{ borderColor: isSelected ? zone.color : '#ddd' }}
                      >
                        <label className="zone-select-label">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSkill(zone.id)}
                          />
                          <span className="zone-color-dot" style={{ backgroundColor: zone.color }} />
                          {zone.name}
                        </label>
                        {isSelected && (
                          <div className="zone-skill-level">
                            {renderStars(skill!.proficiencyLevel, (level) => updateSkillLevel(zone.id, level))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">📅 Disponibilidade</h4>
                <div className="days-selection">
                  <div className="days-row">
                    <span className="days-label">Dias Preferidos:</span>
                    <div className="days-buttons">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day}
                          type="button"
                          className={`day-btn ${formData.preferredDays.includes(day) ? 'preferred' : ''}`}
                          onClick={() => toggleDay(day, 'preferred')}
                        >
                          {DAY_LABELS[day].slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="days-row">
                    <span className="days-label">Dias Indisponíveis:</span>
                    <div className="days-buttons">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day}
                          type="button"
                          className={`day-btn ${formData.unavailableDays.includes(day) ? 'unavailable' : ''}`}
                          onClick={() => toggleDay(day, 'unavailable')}
                        >
                          {DAY_LABELS[day].slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">⏰ Horários Preferidos</h4>
                <div className="time-slots-selection">
                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const isSelected = formData.preferredTimeSlots.some(
                      (s) => s.start === slot.start && s.end === slot.end
                    );
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        className={`time-slot-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleTimeSlot({ start: slot.start, end: slot.end })}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">⏱️ Limites de Horas</h4>
                <div className="hours-inputs">
                  <div className="form-group">
                    <label className="form-label">Máximo por semana</label>
                    <input
                      type="number"
                      className="form-input form-input-small"
                      value={formData.maxHoursPerWeek}
                      onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: parseInt(e.target.value) || 40 })}
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Máximo por dia</label>
                    <input
                      type="number"
                      className="form-input form-input-small"
                      value={formData.maxHoursPerDay}
                      onChange={(e) => setFormData({ ...formData, maxHoursPerDay: parseInt(e.target.value) || 8 })}
                      min="1"
                      max="12"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferido por semana</label>
                    <input
                      type="number"
                      className="form-input form-input-small"
                      value={formData.preferredHoursPerWeek}
                      onChange={(e) => setFormData({ ...formData, preferredHoursPerWeek: parseInt(e.target.value) || 40 })}
                      min="1"
                      max="60"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  Funcionário ativo
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEmployee ? 'Guardar' : 'Criar Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .employees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .employee-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 16px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .employee-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .employee-card.inactive {
          opacity: 0.6;
        }

        .employee-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .employee-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .employee-info {
          flex: 1;
        }

        .employee-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #333;
        }

        .section-label {
          font-size: 0.75rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 6px;
        }

        .employee-skills {
          margin-bottom: 12px;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .skill-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          border: 1px solid;
        }

        .no-skills {
          color: #999;
          font-size: 0.85rem;
          font-style: italic;
        }

        .employee-hours,
        .employee-unavailable {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 8px;
        }

        .employee-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .modal-large {
          max-width: 700px;
        }

        .form-section {
          margin-bottom: 24px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .form-section-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #333;
        }

        .form-section-desc {
          font-size: 0.85rem;
          color: #666;
          margin: 0 0 12px 0;
        }

        .zones-selection {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 8px;
        }

        .zone-select-item {
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .zone-select-item.selected {
          background: rgba(102, 126, 234, 0.05);
        }

        .zone-select-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .zone-color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .zone-skill-level {
          margin-top: 8px;
          padding-left: 24px;
        }

        .days-selection {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .days-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .days-label {
          font-size: 0.85rem;
          color: #666;
          min-width: 140px;
        }

        .days-buttons {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .day-btn {
          padding: 6px 10px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 0.8rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .day-btn.preferred {
          background: #4ecdc4;
          border-color: #4ecdc4;
          color: white;
        }

        .day-btn.unavailable {
          background: #ff6b6b;
          border-color: #ff6b6b;
          color: white;
        }

        .time-slots-selection {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .time-slot-btn {
          padding: 8px 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .time-slot-btn.selected {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .hours-inputs {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};