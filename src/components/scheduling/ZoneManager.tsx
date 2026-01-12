import { useState } from 'react';
import { SchedulingStore } from '../../store/schedulingStore';
import { Zone } from '../../types/scheduling';

interface ZoneManagerProps {
  store: SchedulingStore;
}

const ZONE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8B500', '#FF8C00'
];

export const ZoneManager = ({ store }: ZoneManagerProps) => {
  const { zones, addZone, updateZone, deleteZone, resetZonesToDefaults } = store;
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    minStaffPerDay: 1,
    operatingHours: { start: '09:00', end: '18:00' },
    color: ZONE_COLORS[0],
  });

  const handleOpenModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        minStaffPerDay: zone.minStaffPerDay,
        operatingHours: { ...zone.operatingHours },
        color: zone.color,
      });
    } else {
      setEditingZone(null);
      setFormData({
        name: '',
        minStaffPerDay: 1,
        operatingHours: { start: '09:00', end: '18:00' },
        color: ZONE_COLORS[zones.length % ZONE_COLORS.length],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingZone(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingZone) {
      updateZone(editingZone.id, formData);
    } else {
      addZone(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (zone: Zone) => {
    if (confirm(`Tem certeza que deseja eliminar a zona "${zone.name}"?`)) {
      deleteZone(zone.id);
    }
  };

  return (
    <div className="zone-manager">
      <div className="card-header">
        <h2 className="card-title">📍 Gestão de Zonas/Postos</h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={resetZonesToDefaults}>
            🔄 Reset
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            ➕ Nova Zona
          </button>
        </div>
      </div>

      {zones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📍</div>
          <p className="empty-state-text">Nenhuma zona configurada</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            Adicionar Zona
          </button>
        </div>
      ) : (
        <div className="zones-grid">
          {zones.map((zone) => (
            <div key={zone.id} className="zone-card" style={{ borderLeftColor: zone.color }}>
              <div className="zone-header">
                <div className="zone-color" style={{ backgroundColor: zone.color }} />
                <h3 className="zone-name">{zone.name}</h3>
              </div>
              <div className="zone-details">
                <div className="zone-detail">
                  <span className="detail-label">Mínimo de pessoas:</span>
                  <span className="detail-value">{zone.minStaffPerDay}</span>
                </div>
                <div className="zone-detail">
                  <span className="detail-label">Horário:</span>
                  <span className="detail-value">
                    {zone.operatingHours.start} - {zone.operatingHours.end}
                  </span>
                </div>
              </div>
              <div className="zone-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(zone)}>
                  ✏️ Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(zone)}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingZone ? 'Editar Zona' : 'Nova Zona'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome da Zona</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Receção, Cozinha..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mínimo de Pessoas por Dia</label>
                <input
                  type="number"
                  className="form-input form-input-small"
                  value={formData.minStaffPerDay}
                  onChange={(e) => setFormData({ ...formData, minStaffPerDay: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="20"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Horário de Funcionamento</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="time"
                    className="form-input"
                    value={formData.operatingHours.start}
                    onChange={(e) => setFormData({
                      ...formData,
                      operatingHours: { ...formData.operatingHours, start: e.target.value }
                    })}
                  />
                  <span>até</span>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.operatingHours.end}
                    onChange={(e) => setFormData({
                      ...formData,
                      operatingHours: { ...formData.operatingHours, end: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cor</label>
                <div className="color-picker">
                  {ZONE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingZone ? 'Guardar' : 'Criar Zona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .zones-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .zone-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 16px;
          border-left: 4px solid;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .zone-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .zone-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .zone-color {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .zone-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: #333;
        }

        .zone-details {
          margin-bottom: 16px;
        }

        .zone-detail {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #eee;
        }

        .zone-detail:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #666;
          font-size: 0.85rem;
        }

        .detail-value {
          font-weight: 500;
          color: #333;
        }

        .zone-actions {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};