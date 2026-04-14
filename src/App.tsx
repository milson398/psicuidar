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

/**
 * 🎨 TELA PÚBLICA DE RESPOSTA DO ALUNO
 * Definida fora do componente principal para isolamento total
 */
const PublicResponseScreen: React.FC<{ success: boolean; msg: string }> = ({ success, msg }) => (
  <div className="min-h-screen bg-[#060b18] flex items-center justify-center p-4">
    <div className="bg-[#111827] p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-white/5 animate-fade-in">
      <div className={`mb-8 flex justify-center ${success ? 'text-green-500' : 'text-red-500'}`}>
        <div className={`rounded-full p-5 ${success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {success ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>
      </div>
      <h2 className="text-3xl font-black text-white mb-4 tracking-tight">{success ? 'Recebido!' : 'Ops!'}</h2>
      <p className="text-gray-400 text-lg font-medium leading-relaxed mb-10">{msg}</p>
      <div className="pt-6 border-t border-white/5">
        <span className="text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase">PsiCuidar Sistema Seguro</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  // 1. CHECAGEM DE TOKEN INSTANTÂNEA (SÍNCRONA)
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const res = params.get('res');
  const isPublicRoute = !!(token && res);

  // Estados de controle
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFuncionario, setIsFuncionario] = useState(false);
  const [studentResponse, setStudentResponse] = useState<{ success: boolean; msg: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(isPublicRoute);

  // Interface
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Dra. Ana Silva');
  const [userEmail, setUserEmail] = useState('admin@psicuidar.com');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('blue');
  const [currentBackground, setCurrentBackground] = useState<ThemeColor>('blue');

  // 2. PROCESSAMENTO DO TOKEN (BYPASS DE AUTH)
  useEffect(() => {
    if (token && res) {
      const processToken = async () => {
        let msg = "";
        let newStatus = AppointmentStatus.PENDENTE;
        if (res === 'confirm') { newStatus = AppointmentStatus.CONFIRMADO; msg = "Sua consulta foi confirmada com sucesso! Te aguardamos."; }
        else if (res === 'cancel') { newStatus = AppointmentStatus.CANCELADO; msg = "Sua consulta foi cancelada conforme solicitado."; }
        else if (res === 'resched') { newStatus = AppointmentStatus.REMARCAR; msg = "Recebemos seu pedido de reagendamento. Entraremos em contato em breve."; }

        try {
          const { error } = await supabase.from('appointments').update({ status: newStatus, is_viewed: false }).eq('confirmation_token', token);
          if (error) throw error;
          setStudentResponse({ success: true, msg });
        } catch {
          setStudentResponse({ success: false, msg: "Este link não é mais válido." });
        } finally {
          setIsProcessing(false);
        }
      };
      processToken();
    }
  }, [token, res]);

  // 3. SINCRONIZAÇÃO DE DADOS (APENAS SE LOGADO)
  const fetchAppointments = async () => {
    const { data } = await supabase.from('appointments').select('*').order('date_time', { ascending: true });
    if (data) setAppointments(data.map((app: any) => ({
      id: app.id,
      studentName: app.patient_name,
      whatsapp: app.whatsapp,
      dateTime: new Date(app.date_time),
      sessionType: app.session_type,
      status: app.status as AppointmentStatus,
      confirmationToken: app.confirmation_token,
      isViewed: app.is_viewed
    })));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      const ch = supabase.channel('updates').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchAppointments()).subscribe();
      return () => { supabase.removeChannel(ch); };
    }
  }, [isAuthenticated]);

  // -------------------------------------------------------------------------
  // 4. LÓGICA DE RENDERIZAÇÃO (ORDEM DE PRECEDÊNCIA RÍGIDA)
  // -------------------------------------------------------------------------

  // A: Se houver resposta do aluno, renderiza a tela pública IMEDIATAMENTE
  if (studentResponse) {
    return <PublicResponseScreen success={studentResponse.success} msg={studentResponse.msg} />;
  }

  // B: Se estiver processando ou houver token na URL, impede qualquer login
  if (isProcessing || isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Processando Resposta...</p>
        </div>
      </div>
    );
  }

  // C: Fluxo de Autenticação (Apenas se não for rota de aluno)
  if (!isAuthenticated) {
    const isFuncPath = window.location.pathname.includes('/funcionario') || window.location.hash.includes('funcionario');
    if (isFuncPath) {
      return <FuncionarioLogin onLoginSuccess={(name) => { setIsAuthenticated(true); setIsFuncionario(true); setUserName(name); }} />;
    }
    return <ProfessionalLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // D: Sistema Autenticado
  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard': return <Dashboard appointments={appointments} onUpdateStatus={(id, s) => supabase.from('appointments').update({ status: s, is_viewed: true }).eq('id', id).then(() => fetchAppointments())} userName={userName} />;
      case 'Minha Agenda': return <MinhaAgenda appointments={appointments} onAddAppointment={async (data) => { const { data: { user } } = await supabase.auth.getUser(); await supabase.from('appointments').insert([{ patient_name: data.studentName, whatsapp: data.whatsapp, date_time: data.dateTime.toISOString(), session_type: data.sessionType, user_id: user?.id, is_viewed: true }]); fetchAppointments(); }} onEditAppointment={async (id, data) => { const updateData: any = {}; if (data.studentName) updateData.patient_name = data.studentName; if (data.whatsapp) updateData.whatsapp = data.whatsapp; if (data.dateTime) updateData.date_time = data.dateTime.toISOString(); if (data.sessionType) updateData.session_type = data.sessionType; await supabase.from('appointments').update(updateData).eq('id', id); fetchAppointments(); }} onDeleteAppointment={async (id) => { await supabase.from('appointments').delete().eq('id', id); fetchAppointments(); }} />;
      default: return <Dashboard appointments={appointments} onUpdateStatus={(id, s) => supabase.from('appointments').update({ status: s, is_viewed: true }).eq('id', id).then(() => fetchAppointments())} userName={userName} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} isFuncionario={isFuncionario} themeColor={currentTheme} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={() => { setIsAuthenticated(false); setIsFuncionario(false); }} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onLogout={() => setIsAuthenticated(false)} userProfile={{ name: userName, email: userEmail, role: isFuncionario ? 'Funcionário' : 'Administradora', registry: '', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' }} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} onNavigate={setActivePage} currentPage={activePage} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 scroll-smooth custom-scrollbar">{renderPage()}</main>
      </div>
    </div>
  );
};

export default App;
