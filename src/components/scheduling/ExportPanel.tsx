import { useState } from 'react';
import { SchedulingStore } from '../../store/schedulingStore';
import { DAYS_OF_WEEK, DAY_LABELS, Schedule } from '../../types/scheduling';

interface ExportPanelProps {
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
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const ExportPanel = ({ store }: ExportPanelProps) => {
  const { employees, zones, schedules } = store;
  const [selectedWeek, setSelectedWeek] = useState(() => formatDateKey(getMonday(new Date())));
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('excel');
  const [viewType, setViewType] = useState<'zone' | 'employee'>('zone');

  const availableWeeks = schedules.map((s) => s.weekStartDate).sort().reverse();

  const currentSchedule = schedules.find((s) => s.weekStartDate === selectedWeek);

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || 'Desconhecido';
  };

  const getZoneName = (zoneId: string) => {
    return zones.find((z) => z.id === zoneId)?.name || 'Desconhecida';
  };

  const generateCSV = (schedule: Schedule): string => {
    const lines: string[] = [];
    const weekStart = new Date(schedule.weekStartDate);
    
    // Header
    lines.push(`Escala Semanal - ${formatDateDisplay(weekStart)} a ${formatDateDisplay(addDays(weekStart, 6))}`);
    lines.push('');

    if (viewType === 'zone') {
      // Zone view
      const header = ['Zona', ...DAYS_OF_WEEK.map((d) => DAY_LABELS[d])];
      lines.push(header.join(';'));

      zones.forEach((zone) => {
        const row = [zone.name];
        DAYS_OF_WEEK.forEach((day) => {
          const assignments = schedule.assignments.filter(
            (a) => a.zoneId === zone.id && a.day === day
          );
          row.push(assignments.map((a) => getEmployeeName(a.employeeId)).join(', ') || '-');
        });
        lines.push(row.join(';'));
      });
    } else {
      // Employee view
      const header = ['Funcionário', ...DAYS_OF_WEEK.map((d) => DAY_LABELS[d])];
      lines.push(header.join(';'));

      employees.filter((e) => e.active).forEach((employee) => {
        const row = [employee.name];
        DAYS_OF_WEEK.forEach((day) => {
          const assignments = schedule.assignments.filter(
            (a) => a.employeeId === employee.id && a.day === day
          );
          row.push(assignments.map((a) => getZoneName(a.zoneId)).join(', ') || 'Folga');
        });
        lines.push(row.join(';'));
      });
    }

    return lines.join('\n');
  };

  const generateHTMLForPDF = (schedule: Schedule): string => {
    const weekStart = new Date(schedule.weekStartDate);
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Escala Semanal</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
          tr:nth-child(even) { background: #f8f9fa; }
          .zone-name { font-weight: bold; }
          .employee-name { font-weight: bold; }
          .empty { color: #999; }
          @media print {
            body { padding: 0; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>📋 Escala Semanal</h1>
        <p>${formatDateDisplay(weekStart)} a ${formatDateDisplay(addDays(weekStart, 6))}</p>
        <table>
          <thead>
            <tr>
              <th>${viewType === 'zone' ? 'Zona' : 'Funcionário'}</th>
              ${DAYS_OF_WEEK.map((d) => `<th>${DAY_LABELS[d]}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    if (viewType === 'zone') {
      zones.forEach((zone) => {
        html += `<tr><td class="zone-name" style="border-left: 4px solid ${zone.color}">${zone.name}</td>`;
        DAYS_OF_WEEK.forEach((day) => {
          const assignments = schedule.assignments.filter(
            (a) => a.zoneId === zone.id && a.day === day
          );
          const content = assignments.map((a) => getEmployeeName(a.employeeId)).join('<br>') || '<span class="empty">-</span>';
          html += `<td>${content}</td>`;
        });
        html += '</tr>';
      });
    } else {
      employees.filter((e) => e.active).forEach((employee) => {
        html += `<tr><td class="employee-name">${employee.name}</td>`;
        DAYS_OF_WEEK.forEach((day) => {
          const assignments = schedule.assignments.filter(
            (a) => a.employeeId === employee.id && a.day === day
          );
          const content = assignments.map((a) => getZoneName(a.zoneId)).join('<br>') || '<span class="empty">Folga</span>';
          html += `<td>${content}</td>`;
        });
        html += '</tr>';
      });
    }

    html += `
          </tbody>
        </table>
        <p style="margin-top: 30px; color: #888; font-size: 12px;">
          Gerado em ${new Date().toLocaleString('pt-PT')}
        </p>
      </body>
      </html>
    `;

    return html;
  };

  const handleExport = () => {
    if (!currentSchedule) {
      alert('Selecione uma semana com escala para exportar');
      return;
    }

    if (exportFormat === 'excel') {
      // Export as CSV (can be opened in Excel)
      const csv = generateCSV(currentSchedule);
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `escala_${selectedWeek}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Export as PDF (via print)
      const html = generateHTMLForPDF(currentSchedule);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handlePrint = () => {
    if (!currentSchedule) {
      alert('Selecione uma semana com escala para imprimir');
      return;
    }

    const html = generateHTMLForPDF(currentSchedule);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="export-panel">
      <div className="card-header">
        <h2 className="card-title">📤 Exportar Escala</h2>
      </div>

      {availableWeeks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p className="empty-state-text">Nenhuma escala disponível para exportar</p>
          <p>Vá ao Calendário e gere uma escala primeiro.</p>
        </div>
      ) : (
        <div className="export-options">
          <div className="export-card">
            <h3>📅 Selecionar Semana</h3>
            <select
              className="form-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {availableWeeks.map((week) => {
                const weekStart = new Date(week);
                return (
                  <option key={week} value={week}>
                    {formatDateDisplay(weekStart)} - {formatDateDisplay(addDays(weekStart, 6))}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="export-card">
            <h3>👁️ Vista</h3>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="viewType"
                  value="zone"
                  checked={viewType === 'zone'}
                  onChange={() => setViewType('zone')}
                />
                <span>Por Zona</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="viewType"
                  value="employee"
                  checked={viewType === 'employee'}
                  onChange={() => setViewType('employee')}
                />
                <span>Por Funcionário</span>
              </label>
            </div>
          </div>

          <div className="export-card">
            <h3>📁 Formato</h3>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={() => setExportFormat('excel')}
                />
                <span>📊 Excel (CSV)</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={() => setExportFormat('pdf')}
                />
                <span>📄 PDF (Imprimir)</span>
              </label>
            </div>
          </div>

          <div className="export-actions">
            <button className="btn btn-primary btn-lg" onClick={handleExport}>
              {exportFormat === 'excel' ? '📊 Exportar Excel' : '📄 Exportar PDF'}
            </button>
            <button className="btn btn-secondary btn-lg" onClick={handlePrint}>
              🖨️ Imprimir
            </button>
          </div>

          {currentSchedule && (
            <div className="export-preview">
              <h3>📋 Pré-visualização</h3>
              <div className="preview-table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>{viewType === 'zone' ? 'Zona' : 'Funcionário'}</th>
                      {DAYS_OF_WEEK.map((day) => (
                        <th key={day}>{DAY_LABELS[day].slice(0, 3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {viewType === 'zone' ? (
                      zones.map((zone) => (
                        <tr key={zone.id}>
                          <td style={{ borderLeft: `4px solid ${zone.color}` }}>{zone.name}</td>
                          {DAYS_OF_WEEK.map((day) => {
                            const assignments = currentSchedule.assignments.filter(
                              (a) => a.zoneId === zone.id && a.day === day
                            );
                            return (
                              <td key={day}>
                                {assignments.map((a) => getEmployeeName(a.employeeId)).join(', ') || '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      employees.filter((e) => e.active).map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.name}</td>
                          {DAYS_OF_WEEK.map((day) => {
                            const assignments = currentSchedule.assignments.filter(
                              (a) => a.employeeId === employee.id && a.day === day
                            );
                            return (
                              <td key={day}>
                                {assignments.map((a) => getZoneName(a.zoneId)).join(', ') || 'Folga'}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .export-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .export-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
        }

        .export-card h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #333;
        }

        .radio-group {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .radio-label input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .export-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          padding: 20px 0;
        }

        .btn-lg {
          padding: 14px 28px;
          font-size: 1rem;
        }

        .export-preview {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
        }

        .export-preview h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #333;
        }

        .preview-table-wrapper {
          overflow-x: auto;
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .preview-table th,
        .preview-table td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }

        .preview-table th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 500;
        }

        .preview-table tr:nth-child(even) {
          background: white;
        }

        .preview-table td:first-child {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};