import { SchedulingStore } from '../../store/schedulingStore';

interface RulesConfigProps {
  store: SchedulingStore;
}

export const RulesConfig = ({ store }: RulesConfigProps) => {
  const { rules, updateRules, resetRulesToDefaults } = store;

  return (
    <div className="rules-config">
      <div className="card-header">
        <h2 className="card-title">⚙️ Regras de Escala</h2>
        <button className="btn btn-secondary btn-sm" onClick={resetRulesToDefaults}>
          🔄 Reset Padrão
        </button>
      </div>

      <div className="rules-grid">
        <div className="rule-card">
          <div className="rule-icon">⏱️</div>
          <h3 className="rule-title">Horas de Trabalho</h3>
          <div className="rule-content">
            <div className="form-group">
              <label className="form-label">Máximo de horas por semana</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="form-input form-input-small"
                  value={rules.maxHoursPerWeek}
                  onChange={(e) => updateRules({ maxHoursPerWeek: parseInt(e.target.value) || 40 })}
                  min="1"
                  max="60"
                />
                <span className="input-unit">horas</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Máximo de horas por dia</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="form-input form-input-small"
                  value={rules.maxHoursPerDay}
                  onChange={(e) => updateRules({ maxHoursPerDay: parseInt(e.target.value) || 8 })}
                  min="1"
                  max="16"
                />
                <span className="input-unit">horas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rule-card">
          <div className="rule-icon">☕</div>
          <h3 className="rule-title">Pausas</h3>
          <div className="rule-content">
            <div className="form-group">
              <label className="form-label">Intervalo mínimo entre turnos</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="form-input form-input-small"
                  value={rules.minBreakBetweenShifts}
                  onChange={(e) => updateRules({ minBreakBetweenShifts: parseInt(e.target.value) || 30 })}
                  min="0"
                  max="120"
                  step="15"
                />
                <span className="input-unit">minutos</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Duração da pausa</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="form-input form-input-small"
                  value={rules.breakDuration}
                  onChange={(e) => updateRules({ breakDuration: parseInt(e.target.value) || 30 })}
                  min="0"
                  max="120"
                  step="15"
                />
                <span className="input-unit">minutos</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Máximo de pausas por dia</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  className="form-input form-input-small"
                  value={rules.maxBreaksPerDay}
                  onChange={(e) => updateRules({ maxBreaksPerDay: parseInt(e.target.value) || 2 })}
                  min="0"
                  max="5"
                />
                <span className="input-unit">pausas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rule-card">
          <div className="rule-icon">🔄</div>
          <h3 className="rule-title">Flexibilidade</h3>
          <div className="rule-content">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rules.allowMultipleZonesPerDay}
                  onChange={(e) => updateRules({ allowMultipleZonesPerDay: e.target.checked })}
                />
                Permitir trabalhar em múltiplas zonas no mesmo dia
              </label>
              <p className="form-help">
                Se ativado, um funcionário pode ser atribuído a diferentes zonas ao longo do mesmo dia.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rules-summary">
        <h3>📋 Resumo das Regras Atuais</h3>
        <ul>
          <li>Funcionários podem trabalhar no máximo <strong>{rules.maxHoursPerWeek}h por semana</strong></li>
          <li>Funcionários podem trabalhar no máximo <strong>{rules.maxHoursPerDay}h por dia</strong></li>
          <li>Intervalo mínimo de <strong>{rules.minBreakBetweenShifts} minutos</strong> entre turnos</li>
          <li>Pausas de <strong>{rules.breakDuration} minutos</strong>, máximo <strong>{rules.maxBreaksPerDay}</strong> por dia</li>
          <li>
            {rules.allowMultipleZonesPerDay
              ? '✅ Funcionários podem trabalhar em múltiplas zonas no mesmo dia'
              : '❌ Funcionários só podem trabalhar numa zona por dia'}
          </li>
        </ul>
      </div>

      <style>{`
        .rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .rule-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
        }

        .rule-icon {
          font-size: 2rem;
          margin-bottom: 12px;
        }

        .rule-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #333;
        }

        .rule-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-with-unit {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input-unit {
          color: #666;
          font-size: 0.9rem;
        }

        .form-help {
          font-size: 0.8rem;
          color: #888;
          margin: 6px 0 0 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .rules-summary {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .rules-summary h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #333;
        }

        .rules-summary ul {
          margin: 0;
          padding-left: 20px;
        }

        .rules-summary li {
          margin-bottom: 8px;
          color: #555;
          font-size: 0.9rem;
        }

        .rules-summary strong {
          color: #667eea;
        }
      `}</style>
    </div>
  );
};