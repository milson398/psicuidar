import React, { useState, useEffect } from 'react';
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
import FuncionarioLogin from './components/FuncionarioLogin';
import { Appointment, AppointmentStatus, ThemeColor } from './types';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFuncionario, setIsFuncionario] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');
  const [userName, setUserName] = useState('Dra. Ana Silva');
  const [userEmail, setUserEmail] = useState('admin@psicuidar.com');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('blue');
  const [currentBackground, setCurrentBackground] = useState<ThemeColor>('blue');
  const [loading, setLoading] = useState(false);
  
  // 🔥 ESTADO PARA RESPOSTA DO ALUNO
  const [studentResponse, setStudentResponse] = useState<{ success: boolean; msg: string } | null>(null);

  // 🔥 BUSCAR AGENDAMENTOS DO SUPABASE
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date_time', { ascending: true });

      if (error) throw error;
      if (data) {
        setAppointments(data.map((app: any) => ({
          id: app.id,
          studentName: app.patient_name,
          whatsapp: app.whatsapp,
          dateTime: new Date(app.date_time),
          sessionType: app.session_type,
          status: app.status as AppointmentStatus,
          confirmationToken: app.confirmation_token,
          isViewed: app.is_viewed
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 PROCESSAR RESPOSTA DO WHATSAPP (TOKEN)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const res = params.get('res');

    if (token && res) {
      const processResponse = async () => {
        let newStatus: AppointmentStatus = AppointmentStatus.PENDENTE;
        let msg = "";

        if (res === 'confirm') {
          newStatus = AppointmentStatus.CONFIRMADO;
          msg = "Consulta confirmada com sucesso! Obrigado.";
        } else if (res === 'cancel') {
          newStatus = AppointmentStatus.CANCELADO;
          msg = "Consulta cancelada conforme solicitado.";
        } else if (res === 'resched') {
          newStatus = AppointmentStatus.REMARCAR;
          msg = "Recebemos seu pedido de reagendamento. Entraremos em contato em breve.";
        }

        try {
          const { error } = await supabase
            .from('appointments')
            .update({ 
               status: newStatus, 
               is_viewed: false // Faz o botão brilhar (neon) no dashboard do profissional
            })
            .eq('confirmation_token', token);

          if (error) throw error;
          setStudentResponse({ success: true, msg });
        } catch (err) {
          console.error("Erro ao processar token:", err);
          setStudentResponse({ success: false, msg: "Link inválido ou expirado." });
        }
      };
      processResponse();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, is_viewed: true }) // Ao clicar no Dashboard, a notificação (brilho) some
        .eq('id', id);
      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleAddAppointment = async (data: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('appointments')
        .insert([{
          patient_name: data.studentName,
          whatsapp: data.whatsapp,
          date_time: data.dateTime.toISOString(),
          session_type: data.sessionType,
          user_id: user?.id,
          is_viewed: true // Novo agendamento começa como visualizado pelo profissional
        }]);
      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
    }
  };

  const handleEditAppointment = async (id: string, data: Partial<Appointment>) => {
    try {
      const updateData: any = {};
      if (data.studentName) updateData.patient_name = data.studentName;
      if (data.whatsapp) updateData.whatsapp = data.whatsapp;
      if (data.dateTime) updateData.date_time = data.dateTime.toISOString();
      if (data.sessionType) updateData.session_type = data.sessionType;

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao editar agendamento:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
    }
  };

  // 🔥 TELA DE SUCESSO PARA O ALUNO (WHATSAPP)
  if (studentResponse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className={`mb-6 flex justify-center ${studentResponse.success ? 'text-green-500' : 'text-red-500'}`}>
            {studentResponse.success ? (
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{studentResponse.success ? 'Recebido!' : 'Ops!'}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg font-medium">{studentResponse.msg}</p>
          <div className="text-sm text-gray-400 py-4 border-t border-gray-100 dark:border-gray-700">
            PSICUIDAR - Gestão Profissional e Segura
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const isFuncRoute = window.location.pathname.includes('/funcionario');
    if (isFuncRoute) {
      return (
        <FuncionarioLogin 
          onLoginSuccess={(name) => {
            setIsAuthenticated(true);
            setIsFuncionario(true);
            if (name) setUserName(name);
          }} 
        />
      );
    }
    return <ProfessionalLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard appointments={appointments} onUpdateStatus={handleUpdateStatus} userName={userName} />;
      case 'Minha Agenda':
        return (
          <MinhaAgenda 
            appointments={appointments} 
            onAddAppointment={handleAddAppointment} 
            onEditAppointment={handleEditAppointment} 
            onDeleteAppointment={handleDeleteAppointment} 
          />
        );
      case 'Relatórios Gerenciais':
        return <Relatorios appointments={appointments} />;
      case 'Avaliação':
        return <Avaliacao />;
      case 'Intervencao':
      case 'Intervenção':
        return <Intervencao />;
      case 'Matrículas':
        return <Matriculas />;
      case 'Equipe':
        return <ControleFuncionarios />;
      case 'Controle de Pagamentos':
        return <Pagamentos />;
      case 'Configurações':
        return (
          <Configuracoes 
            userProfile={{ 
              name: userName, 
              email: userEmail, 
              role: isFuncionario ? 'Funcionário' : 'Administradora',
              registry: '',
              photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
            }}
            onUpdateProfile={(p) => setUserName(p.name)}
            currentTheme={currentTheme}
            onUpdateTheme={setCurrentTheme}
            currentBackground={currentBackground}
            onUpdateBackground={setCurrentBackground}
          />
        );
      default:
        return <Dashboard appointments={appointments} onUpdateStatus={handleUpdateStatus} userName={userName} />;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsFuncionario(false);
    setUserName('Dra. Ana Silva');
    setUserEmail('admin@psicuidar.com');
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isFuncionario={isFuncionario}
        themeColor={currentTheme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          onLogout={handleLogout}
          userProfile={{ 
            name: userName, 
            email: userEmail, 
            role: isFuncionario ? 'Funcionário' : 'Administradora',
            registry: '',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
          }}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={setActivePage}
          currentPage={activePage}
        />
        <main className={`flex-1 overflow-x-hidden overflow-y-scroll bg-gray-50 dark:bg-gray-900 scroll-smooth custom-scrollbar`}>
          <div className="min-h-full">
             {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
