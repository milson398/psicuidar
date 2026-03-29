import React, { useState, useCallback, useEffect } from 'react';
import Login from './components/Login';
import FuncionarioLogin from './components/FuncionarioLogin';
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
import { Appointment, AppointmentStatus, UserProfile, ThemeColor } from './types';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('psicuidar_auth') === 'true' || !!sessionStorage.getItem('psicuidar_funcionario_auth');
  });
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const fetchAppointments = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setErrorStatus(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let targetUserId = user?.id;
      const funcAuthStr = sessionStorage.getItem('psicuidar_funcionario_auth');
      if (!user && funcAuthStr) {
        try {
          const funcData = JSON.parse(funcAuthStr).data;
          targetUserId = funcData.gestor_id; // Pega os agendamentos do gestor
        } catch(e) {}
      }

      // Se for fallback do gestor ou não houver id, não filtra por id estrito
      let query = supabase.from('appointments').select('*').order('date_time', { ascending: true });
      if (targetUserId) {
         query = query.eq('user_id', targetUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro no select:", error);
        throw error;
      }

      if (data) {
        setAppointments(data.map(app => ({
          id: app.id,
          studentName: app.student_name || app.patient_name || app.name || app.nome || 'Sem Nome',
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
              studentName: payload.new.student_name || payload.new.patient_name || payload.new.name || payload.new.nome || 'Sem Nome',
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
                studentName: payload.new.student_name || payload.new.patient_name || payload.new.name || payload.new.nome || 'Sem Nome',
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
    const checkAuthAndResponse = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const isAuthInSession = sessionStorage.getItem('psicuidar_auth') === 'true';
      const isFuncionarioAuth = !!sessionStorage.getItem('psicuidar_funcionario_auth');

      if (!session && isAuthInSession) {
        console.warn("Sessão Supabase não encontrada. Resetando login...");
        sessionStorage.removeItem('psicuidar_auth');
        setIsAuthenticated(false);
      } else if (session) {
        setIsAuthenticated(true);
        sessionStorage.setItem('psicuidar_auth', 'true');
      } else if (isFuncionarioAuth) {
        setIsAuthenticated(true);
      }

      // 2. Lógica para processar resposta do aluno via Link (WhatsApp)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const response = urlParams.get('res');

      if (token && response) {
        setIsStudentResponse(true);
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
            if (!appData.token_expires_at) throw new Error('Link inválido.');

            const expiresAt = new Date(appData.token_expires_at);
            if (isNaN(expiresAt.getTime()) || new Date() > expiresAt) {
              throw new Error('Link expirado ou inválido.');
            }

            await supabase
              .from('appointments')
              .update({ status: newStatus, is_viewed: false })
              .eq('confirmation_token', token);
          }
        } catch (err: any) {
          console.error('Erro ao processar:', err);
          setIsStudentResponse(false);
          alert(err.message || 'Erro ao processar sua resposta.');
        }
      }
      setIsLoading(false);
    };

    checkAuthAndResponse();
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

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('psicuidar_auth');
    sessionStorage.removeItem('psicuidar_funcionario_auth');
    setIsAuthenticated(false);
    window.location.href = '/';
  }, []);

  // Adicionar agendamento
  const addAppointment = useCallback(async (newAppointment: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      let targetUserId = user?.id;
      const funcAuthStr = sessionStorage.getItem('psicuidar_funcionario_auth');
      if (!user && funcAuthStr) {
        try {
          const funcData = JSON.parse(funcAuthStr).data;
          targetUserId = funcData.gestor_id; 
        } catch(e) {}
      }

      if (userError) {
        console.error("Erro ao obter usuário:", userError);
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_name: newAppointment.studentName,
          whatsapp: newAppointment.whatsapp,
          date_time: newAppointment.dateTime.toISOString(),
          session_type: newAppointment.sessionType,
          status: AppointmentStatus.PENDENTE,
          is_viewed: true,
          token_expires_at: expiresAt.toISOString(),
          user_id: targetUserId || null
        })
        .select();

      if (error) {
        console.error("Erro detalhado no insert:", error);
        throw error;
      }

      // FORÇAR ATUALIZAÇÃO: Se o select retornou dados, use-os. Se não (por RLS), faça um fetch novo.
      if (data && data[0]) {
        const newApp: Appointment = {
          id: data[0].id,
          studentName: data[0].student_name || data[0].patient_name, // Mapping snake_case
          whatsapp: data[0].whatsapp,
          dateTime: new Date(data[0].date_time),
          sessionType: data[0].session_type as any,
          status: data[0].status as AppointmentStatus,
          confirmationToken: data[0].confirmation_token,
          tokenExpiresAt: data[0].token_expires_at ? new Date(data[0].token_expires_at) : undefined,
          isViewed: data[0].is_viewed
        };
        setAppointments(prev => [...prev, newApp].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));
      } else {
        fetchAppointments(true);
      }
    } catch (error: any) {
      console.error('Error adding appointment:', error);
    }
  }, [fetchAppointments]);

  // Editar agendamento
  const editAppointment = useCallback(async (id: string, updatedData: Partial<Appointment>) => {
    try {
      const updatePayload: any = {};
      if (updatedData.studentName) updatePayload.patient_name = updatedData.studentName;
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
  const getPageBackgroundClass = useCallback((bg: ThemeColor) => {
    switch (bg) {
      case 'black': return 'bg-gray-950';
      case 'gray': return 'bg-gray-800';
      case 'purple': return 'bg-purple-950';
      case 'green': return 'bg-green-950';
      case 'red': return 'bg-red-950';
      case 'blue': return 'bg-blue-950';
      case 'white': return 'bg-white';
      default: return 'bg-gray-50 dark:bg-gray-900';
    }
  }, []);

  const getPageTextClass = (color: ThemeColor) => {
    if (color === 'white') {
      return 'text-gray-900';
    }
    if (color === 'blue' || color === 'black') {
      return 'text-white';
    }
    return 'text-gray-800 dark:text-gray-200';
  };

  const isFuncionario = !!sessionStorage.getItem('psicuidar_funcionario_auth');

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

    // Bloqueia acesso de funcionário
    if (isFuncionario && ['Equipe', 'Controle de Pagamentos', 'Configurações', 'Painel Admin'].includes(activePage)) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <h3 className="text-xl font-bold">Acesso Restrito</h3>
                <p>Você não tem permissão para visualizar esta área.</p>
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
      case 'Equipe':
        return <ControleFuncionarios />;
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
    const urlParams = new URLSearchParams(window.location.search);
    const resValue = urlParams.get('res');

    let statusText = "Sucesso!";
    let statusColorClass = "from-blue-400 to-cyan-400";
    let statusIcon = (
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
    );
    let neonClass = "shadow-[0_0_30px_rgba(59,130,246,0.5)]";

    if (resValue === 'confirm') {
      statusText = "Confirmado!";
      statusColorClass = "from-green-400 to-emerald-500";
      neonClass = "shadow-[0_0_40px_rgba(34,197,94,0.6)]";
    } else if (resValue === 'cancel') {
      statusText = "Cancelado";
      statusColorClass = "from-red-400 to-rose-500";
      statusIcon = (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
      );
      neonClass = "shadow-[0_0_40px_rgba(239,68,68,0.6)]";
    } else if (resValue === 'resched') {
      statusText = "Solicitação Enviada!";
      statusColorClass = "from-yellow-400 to-amber-500";
      statusIcon = (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      );
      neonClass = "shadow-[0_0_40px_rgba(234,179,8,0.6)]";
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white p-6 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-500 bg-gradient-to-br ${statusColorClass} ${neonClass} transform group-hover:scale-110`}>
              {statusIcon}
            </div>

            <h2 className={`text-3xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${statusColorClass}`}>
              {statusText}
            </h2>

            <p className="text-slate-300 text-lg font-medium leading-relaxed">
              Sua resposta foi processada com sucesso e enviada para o seu psicopedagogo.
            </p>

            <div className="mt-10 pt-8 border-t border-white/5">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                <p className="text-sm font-semibold tracking-wider uppercase">PsiCuidar</p>
              </div>
              <p className="text-slate-500 text-xs italic">Você já pode fechar esta aba com segurança.</p>
            </div>
          </div>

          <div className="mt-8 text-center animate-bounce">
            <p className="text-slate-600 text-sm">Tecnologia e Cuidado 💫</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (window.location.pathname === '/funcionario') {
      return (
        <FuncionarioLogin 
          onLoginSuccess={(data) => {
            setIsAuthenticated(true);
          }} 
        />
      );
    }
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`flex h-screen ${getPageBackgroundClass(backgroundColor)} ${getPageTextClass(backgroundColor)} ${backgroundColor === 'white' ? 'light-bg-mode' : ''} transition-colors duration-500`}>
      <Sidebar
        setActivePage={(page) => {
          setActivePage(page);
          setIsMobileSidebarOpen(false);
        }}
        activePage={activePage}
        themeColor={themeColor}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isFuncionario={!!sessionStorage.getItem('psicuidar_funcionario_auth')}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onLogout={handleLogout}
          userProfile={userProfile}
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onNavigate={(page) => setActivePage(page)}
          currentPage={activePage}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
