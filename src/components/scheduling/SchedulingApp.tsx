import { useState } from 'react';
import { useSchedulingStore } from '../../store/schedulingStore';
import { ZoneManager } from './ZoneManager';
import { EmployeeManager } from './EmployeeManager';
import { RulesConfig } from './RulesConfig';
import { WeeklyCalendar } from './WeeklyCalendar';
import { ExportPanel } from './ExportPanel';
import './SchedulingApp.css';

type TabType = 'calendar' | 'employees' | 'zones' | 'rules' | 'export';

export const SchedulingApp = () => {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const store = useSchedulingStore();

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'calendar', label: 'Calendário', icon: '📅' },
    { id: 'employees', label: 'Funcionários', icon: '👥' },
    { id: 'zones', label: 'Zonas', icon: '📍' },
    { id: 'rules', label: 'Regras', icon: '⚙️' },
    { id: 'export', label: 'Exportar', icon: '📤' },
  ];

  return (
    <div className="scheduling-app">
      <header className="scheduling-header">
        <h1>📋 Gestão de Escalas</h1>
        <p>Sistema de escalas de trabalho semanal</p>
      </header>

      <nav className="scheduling-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="scheduling-content">
        {activeTab === 'calendar' && <WeeklyCalendar store={store} />}
        {activeTab === 'employees' && <EmployeeManager store={store} />}
        {activeTab === 'zones' && <ZoneManager store={store} />}
        {activeTab === 'rules' && <RulesConfig store={store} />}
        {activeTab === 'export' && <ExportPanel store={store} />}
      </main>
    </div>
  );
};