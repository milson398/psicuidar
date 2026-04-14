import React, { useState, useEffect, useMemo } from 'react';
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
  
  const queryParams = new URLSearchParams(window.location.search);
  const urlToken = queryParams.get('token');
  const urlRes = queryParams.get('res');
  const hasTokenParams = !!(urlToken && urlRes);

  const [isProcessingToken, setIsProcessingToken] = useState(hasTokenParams);
  const [studentResponse, setStudentResponse] = useState<{ success: boolean; msg: string } | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');
  const [userName, setUserName] = useState('Dra. Ana Silva');
  const [userEmail, setUserEmail] = useState('admin@psicuidar.com');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('blue');
  const [currentBackground, setCurrentBackground] = useState<ThemeColor>('blue');

  // 🔥 DETECÇÃO ULTRA-RIGOROSA (Garante que Mobile não erre de Portal)
  const isFuncionarioRoute = useMemo(() => {
    // Pegamos o caminho completo (URL parciais)
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    
    // Se o caminho for apenas "/", "/index.html", ou estiver vazio, É SEMPRE PROFISSIONAL (ADMIN)
    const isRoot = path === '/' || path === '' || path === '/index.html' || path === '/index';
    
    if (isRoot) return false;

    // Se a URL contiver "funcionario", e NÃO for a raiz, aí sim permitimos o portal do funcionário
    return path.includes('funcionario') || hash.includes('funcionario');
  }, []);

  useEffect(() => {
    if (urlToken && urlRes) {
      const processResponse = async () => {
        let newStatus = AppointmentStatus.PENDENTE;
        let msg = "";
        if (urlRes === 'confirm') { newStatus = AppointmentStatus.CONFIRMADO; msg = "Consulta confirmada com sucesso! Obrigado."; }
        else if (urlRes === 'cancel') { newStatus = AppointmentStatus.CANCELADO; msg = "Consulta cancelada conforme solicitado."; }
        else if (urlRes === 'resched') { newStatus = AppointmentStatus.REMARCAR; msg = "Recebemos seu pedido de reagendamento. Entraremos em contato em breve."; }

        try {
          const { error } = await supabase.from('appointments').update({ status: newStatus, is_viewed: false }).eq('confirmation_token', urlToken);
          if (error) throw error;
          setStudentResponse({ success: true, msg });
        } catch (err) {
          setStudentResponse({ success: false, msg: "Link inválido ou expirado." });
        } finally {
          setIsProcessingToken(false);
        }
      };
      processResponse();
    }
  }, [urlToken, urlRes]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      const sub = supabase.channel('app-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchAppointments()).subscribe();
      return () => { supabase.removeChannel(sub); };
    }
  }, [isAuthenticated]);

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

  // 1. TELA DE SUCESSO (ESTILO DARK)
  if (studentResponse) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-[#1e293b] p-10 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-700/50">
          <div className={`mb-8 flex justify-center ${studentResponse.success ? 'text-green-500' : 'text-red-500'}`}>
            <div className={`rounded-full p-4 ${studentResponse.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {studentResponse.success ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-tight">{studentResponse.success ? 'Recebido!' : 'Ops!'}</h2>
          <p className="text-gray-300 mb-10 text-xl font-medium">{studentResponse.msg}</p>
          <div className="pt-6 border-t border-gray-700/50 text-xs text-gray-500 uppercase tracking-widest font-semibold">PSICUIDAR - Gestão Profissional e Segura</div>
        </div>
      </div>
    );
  }

  // 2. PROCESSANDO TOKEN
  if (isProcessingToken || hasTokenParams) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#11ba82] mx-auto mb-6"></div>
          <p className="text-white text-lg font-medium">Sincronizando agendamento...</p>
        </div>
      </div>
    );
  }

  // 3. AUTENTICAÇÃO
  if (!isAuthenticated) {
    if (isFuncionarioRoute) {
      return (
        <>
          <FuncionarioLogin onLoginSuccess={(name) => { setIsAuthenticated(true); setIsFuncionario(true); if (name) setUserName(name); }} />
          {/* Botão flutuante de emergência para voltar ao portal admin caso o mobile se confunda */}
          <button 
            onClick={() => window.location.href = '/'}
            className="fixed bottom-4 right-4 bg-slate-900 text-white text-xs px-3 py-2 rounded-full border border-white/10 opacity-50 hover:opacity-100 transition-opacity"
          >
            Área do Profissional
          </button>
        </>
      );
    }
    return <ProfessionalLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 4. SISTEMA NORMAL
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
