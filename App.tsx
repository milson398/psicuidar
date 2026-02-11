import React, { useState, useCallback, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MinhaAgenda from './components/MinhaAgenda';
import Relatorios from './components/Relatorios';
import Avaliacao from './components/Avaliacao';
import Intervencao from './components/Intervencao';
import Matriculas from './components/Matriculas';
import Pagamentos from './components/Pagamentos';
import Configuracoes from './components/Configuracoes';
import { Appointment, AppointmentStatus, UserProfile, ThemeColor } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('psicuidar_auth') === 'true';
  });
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // Se já estiver logado via sessionStorage, começamos carregando os dados
    return sessionStorage.getItem('psicuidar_auth') === 'true';
  });
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isStudentResponse, setIsStudentResponse] = useState<boolean>(false);

  // Estado Global de Tema (Sidebar/Botões) e Fundo (Página)
  const [themeColor, setThemeColor] = useState<ThemeColor>('blue');
  const [backgroundColor, setBackgroundColor] = useState<ThemeColor>('blue');

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Dra. Ana Silva',
    email: 'ana.silva@psicuidar.com',
    registry: '12345/BR',
    photoUrl: 'https://picsum.photos/200',
    role: 'Psicopedagoga'
  });

  // Fetch appointments from Supabase
  const fetchAppointments = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setErrorStatus(null);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date_time', { ascending: true });

      if (error) throw error;

      if (data) {
        setAppointments(data.map(app => ({
          id: app.id,
          patientName: app.patient_name,
          whatsapp: app.whatsapp,
          dateTime: new Date(app.date_time),
          sessionType: app.session_type as any,
          status: app.status as AppointmentStatus,
          confirmationToken: app.confirmation_token,
          tokenExpiresAt: app.token_expires_at ? new Date(app.token_expires_at) : undefined,
          isViewed: app.is_viewed
        })));
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      if (!silent) setErrorStatus(error.message || 'Erro ao conectar ao banco de dados');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Sincronização em Tempo Real (Realtime)
    const channel = supabase
      .channel('realtime_appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newApp: Appointment = {
              id: payload.new.id,
              patientName: payload.new.patient_name,
              whatsapp: payload.new.whatsapp,
              dateTime: new Date(payload.new.date_time),
              sessionType: payload.new.session_type as any,
              status: payload.new.status as AppointmentStatus,
              confirmationToken: payload.new.confirmation_token,
              tokenExpiresAt: payload.new.token_expires_at ? new Date(payload.new.token_expires_at) : undefined,
              isViewed: payload.new.is_viewed
            };
            setAppointments(prev => {
              // Evita duplicatas se o fetchAppointments(true) também rodar
              if (prev.find(a => a.id === newApp.id)) return prev;
              const next = [...prev, newApp].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
              return next;
            });
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev => prev.map(app =>
              app.id === payload.new.id ? {
                ...app,
                status: payload.new.status,
                isViewed: payload.new.is_viewed,
                patientName: payload.new.patient_name,
                dateTime: new Date(payload.new.date_time)
              } : app
            ));
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(app => app.id !== payload.old.id));
          }

          fetchAppointments(true); // Chamada de segurança para garantir integridade
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Erro no canal Realtime. Tentando re-sincronizar...');
          fetchAppointments(true);
        }
        if (status === 'TIMED_OUT') {
          console.warn('Conexão Realtime expirou. Verifique sua rede.');
        }
      });

    return () => {
      console.log('Limpando conexão Realtime...');
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, fetchAppointments]);

  useEffect(() => {
    // 2. Lógica para processar resposta do aluno via Link (WhatsApp)
    const handleStudentResponse = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const response = urlParams.get('res');

      if (token && response) {
        setIsStudentResponse(true); // Bloqueia a tela de login para o aluno
        setIsLoading(true);
        try {
          let newStatus: AppointmentStatus | null = null;
          if (response === 'confirm') newStatus = AppointmentStatus.CONFIRMADO;
          if (response === 'cancel') newStatus = AppointmentStatus.CANCELADO;
          if (response === 'resched') newStatus = AppointmentStatus.REMARCAR;

          if (newStatus) {
            const { data: appData, error: fetchError } = await supabase
              .from('appointments')
              .select('id, token_expires_at')
              .eq('confirmation_token', token)
              .single();

            if (fetchError || !appData) throw new Error('Agendamento não encontrado.');

            if (!appData.token_expires_at) {
              throw new Error('Link inválido.');
            }

            const expiresAt = new Date(appData.token_expires_at);

            if (isNaN(expiresAt.getTime())) {
              throw new Error('Link inválido.');
            }

            if (new Date() > expiresAt) {
              throw new Error('Link expirado.');
            }

            await supabase
              .from('appointments')
              .update({
                status: newStatus,
                is_viewed: false
              })
              .eq('confirmation_token', token);
          }
        } catch (err: any) {
          console.error('Erro ao processar:', err);
          setIsStudentResponse(false);
          alert(err.message || 'Erro ao processar sua resposta.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleStudentResponse();
    // Se não for uma resposta de aluno e não estivermos logados, paramos o loading
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('token') && sessionStorage.getItem('psicuidar_auth') !== 'true') {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, fetchAppointments]);

  const handleLoginSuccess = useCallback(() => {
    sessionStorage.setItem('psicuidar_auth', 'true');
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('psicuidar_auth');
    setIsAuthenticated(false);
  }, []);

  // Adicionar agendamento
  const addAppointment = useCallback(async (newAppointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          patient_name: newAppointment.patientName,
          whatsapp: newAppointment.whatsapp,
          date_time: newAppointment.dateTime.toISOString(),
          session_type: newAppointment.sessionType,
          status: AppointmentStatus.PENDENTE,
          is_viewed: true, // Novo agendamento começa como visto
          token_expires_at: expiresAt.toISOString()
        }])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const newApp: Appointment = {
          id: data[0].id,
          patientName: data[0].patient_name,
          whatsapp: data[0].whatsapp,
          dateTime: new Date(data[0].date_time),
          sessionType: data[0].session_type as any,
          status: data[0].status as AppointmentStatus,
          confirmationToken: data[0].confirmation_token,
          tokenExpiresAt: data[0].token_expires_at ? new Date(data[0].token_expires_at) : undefined,
          isViewed: data[0].is_viewed
        };
        setAppointments(prev => [...prev, newApp].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  }, [fetchAppointments]);

  // Editar agendamento
  const editAppointment = useCallback(async (id: string, updatedData: Partial<Appointment>) => {
    try {
      const updatePayload: any = {};
      if (updatedData.patientName) updatePayload.patient_name = updatedData.patientName;
      if (updatedData.whatsapp !== undefined) updatePayload.whatsapp = updatedData.whatsapp;
      if (updatedData.dateTime) updatePayload.date_time = updatedData.dateTime.toISOString();
      if (updatedData.sessionType) updatePayload.session_type = updatedData.sessionType;
      if (updatedData.status) updatePayload.status = updatedData.status;

      const { error } = await supabase
        .from('appointments')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
      fetchAppointments(true);
    } catch (error) {
      console.error('Error editing appointment:', error);
    }
  }, [fetchAppointments]);

  // Remover agendamento
  const deleteAppointment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAppointments(true);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  }, [fetchAppointments]);

  // Atualizar Status
  const updateAppointmentStatus = useCallback(async (id: string, newStatus: AppointmentStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: newStatus,
          is_viewed: true // Marca como VISTO para parar o efeito neon
        })
        .eq('id', id);

      if (error) throw error;
      setAppointments(prev => prev.map(app =>
        app.id === id ? { ...app, status: newStatus, isViewed: true } : app
      ));
      fetchAppointments(true);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  }, [fetchAppointments]);

  // Função para determinar a classe CSS do FUNDO da página (Atrás dos cards)
  const getPageBackgroundClass = (color: ThemeColor) => {
    switch (color) {
      case 'black': return 'bg-gray-900 dark:bg-black'; // Preto
      case 'gray': return 'bg-gray-200 dark:bg-gray-700'; // Cinza
      case 'purple': return 'bg-purple-100 dark:bg-purple-900'; // Roxo
      case 'green': return 'bg-green-100 dark:bg-green-900'; // Verde
      case 'red': return 'bg-red-100 dark:bg-red-900'; // Vermelho
      case 'white': return 'bg-white';
      case 'blue': default: return 'bg-slate-900';
    }
  };

  // Função auxiliar para garantir contraste do texto quando o fundo for escuro
  const getPageTextClass = (color: ThemeColor) => {
    if (color === 'blue' || color === 'black') {
      return 'text-white';
    }
    return 'text-gray-800 dark:text-gray-200';
  };

  const renderContent = () => {
    if (errorStatus) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Ops! Falha na Conexão</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{errorStatus}</p>
            <button
              onClick={() => fetchAppointments()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    if (isLoading && isAuthenticated) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activePage) {
      case 'Dashboard':
        return <Dashboard
          appointments={appointments}
          onUpdateStatus={updateAppointmentStatus}
        />;
      case 'Minha Agenda':
        return <MinhaAgenda
          appointments={appointments}
          onAddAppointment={addAppointment}
          onEditAppointment={editAppointment}
          onDeleteAppointment={deleteAppointment}
        />;
      case 'Relatórios Gerenciais':
        return <Relatorios appointments={appointments} />;
      case 'Avaliação':
        return <Avaliacao />;
      case 'Intervenção':
        return <Intervencao />;
      case 'Matrículas':
        return <Matriculas />;
      case 'Controle de Pagamentos':
        return <Pagamentos />;
      case 'Configurações':
        return <Configuracoes
          userProfile={userProfile}
          onUpdateProfile={setUserProfile}
          currentTheme={themeColor}
          onUpdateTheme={setThemeColor}
          currentBackground={backgroundColor}
          onUpdateBackground={setBackgroundColor}
        />;
      default:
        return <Dashboard
          appointments={appointments}
          onUpdateStatus={updateAppointmentStatus}
        />;
    }
  };

  if (isStudentResponse && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6 text-center">
        <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border border-blue-500/30 max-w-sm animate-fade-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Sucesso!</h2>
          <p className="text-slate-300 text-lg">Sua resposta foi enviada para o seu psicopedagogo.</p>
          <p className="mt-8 text-slate-500 text-sm italic">Você já pode fechar esta aba.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`flex h-screen ${getPageBackgroundClass(backgroundColor)} ${getPageTextClass(backgroundColor)} transition-colors duration-500`}>
      <Sidebar
        setActivePage={(page) => {
          setActivePage(page);
          setIsMobileSidebarOpen(false);
        }}
        activePage={activePage}
        themeColor={themeColor}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onLogout={handleLogout}
          userProfile={userProfile}
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onNavigate={(page) => setActivePage(page)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;