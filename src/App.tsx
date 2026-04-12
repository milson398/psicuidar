import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MinhaAgenda from './components/MinhaAgenda';
import Relatorios from './components/Relatorios';
import Avaliacao from './components/Avaliacao';
import Intervencao from './components/Intervencao';
import Matriculas from './components/Matriculas';
import ControleFuncionarios from './components/ControleFuncionarios';
import Pagamentos from './components/Pagamentos';
import Configuracoes from './components/Configuracoes';
import ProfessionalLogin from './components/ProfessionalLogin';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFuncionario, setIsFuncionario] = useState(true);
  const [activePage, setActivePage] = useState('Dashboard');

  // 🔥 NOVA TELA DE LOGIN PROFISSIONAL (DO ZERO)
  if (!isAuthenticated) {
    return <ProfessionalLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 🔥 RENDERIZA PÁGINA ATIVA
  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'MinhaAgenda':
        return <MinhaAgenda />;
      case 'Relatorios':
        return <Relatorios />;
      case 'Avaliacao':
        return <Avaliacao />;
      case 'Intervencao':
        return <Intervencao />;
      case 'Matriculas':
        return <Matriculas />;
      case 'ControleFuncionarios':
        return <ControleFuncionarios />;
      case 'Pagamentos':
        return <Pagamentos />;
      case 'Configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  // 🔥 SISTEMA PRINCIPAL
  return (
    <div className="flex min-h-screen">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isFuncionario={isFuncionario}
      />

      <div className="flex-1">
        <Header />
        <div className="p-4">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default App;