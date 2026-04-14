import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { supabase } from '../services/supabase';

interface MinhaAgendaProps {
    appointments: Appointment[];
    onAddAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
    onEditAppointment: (id: string, data: Partial<Appointment>) => void;
    onDeleteAppointment: (id: string) => void;
}

interface Aluno {
    id: string;
    nome: string;
    celular: string;
}

const AgendaModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
    initialData?: Appointment | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
    const [studentName, setStudentName] = useState('');
    const [whatsApp, setWhatsApp] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('45');
    const [sessionType, setSessionType] = useState<'Avaliação' | 'Intervenção' | 'Devolutiva'>('Avaliação');
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchAlunos = async () => {
            const { data, error } = await supabase.from('matriculas').select('id, nome, celular').order('nome');
            if (!error && data) setAlunos(data);
        };
        fetchAlunos();
    }, []);

    useEffect(() => {
        if (initialData) {
            setStudentName(initialData.studentName);
            setWhatsApp(initialData.whatsapp || '');
            const yyyy = initialData.dateTime.getFullYear();
            const mm = String(initialData.dateTime.getMonth() + 1).padStart(2, '0');
            const dd = String(initialData.dateTime.getDate()).padStart(2, '0');
            setDate(`${yyyy}-${mm}-${dd}`);
            const hh = String(initialData.dateTime.getHours()).padStart(2, '0');
            const min = String(initialData.dateTime.getMinutes()).padStart(2, '0');
            setTime(`${hh}:${min}`);
            setSessionType(initialData.sessionType);
            setSearchTerm(initialData.studentName);
        } else {
            setStudentName('');
            setWhatsApp('');
            setDate('');
            setTime('');
            setSessionType('Avaliação');
            setSearchTerm('');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const filteredAlunos = alunos.filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelectAluno = (aluno: Aluno) => {
        setStudentName(aluno.nome);
        setWhatsApp(aluno.celular);
        setSearchTerm(aluno.nome);
        setShowSuggestions(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        const dateTime = new Date(year, month - 1, day, hours, minutes);
        onSave({ studentName, whatsapp: whatsApp, dateTime, sessionType });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-4 dark:border-gray-700">
                    {initialData ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nome do Aluno</label>
                            <input 
                                type="text" 
                                placeholder="Buscar aluno matriculado..." 
                                value={searchTerm} 
                                onChange={e => {
                                    setSearchTerm(e.target.value);
                                    setStudentName(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                required 
                                className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            {showSuggestions && searchTerm && filteredAlunos.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                                    {filteredAlunos.map(a => (
                                        <li 
                                            key={a.id} 
                                            onClick={() => handleSelectAluno(a)}
                                            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-600 last:border-0"
                                        >
                                            <div className="font-bold">{a.nome}</div>
                                            <div className="text-xs text-gray-500">{a.celular}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                            <input type="tel" placeholder="Ex: 5511999999999" value={whatsApp} onChange={e => setWhatsApp(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Data</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Horário</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tipo de Sessão</label>
                            <select value={sessionType} onChange={e => setSessionType(e.target.value as any)} className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500">
                                <option value="Avaliação">Avaliação</option>
                                <option value="Intervenção">Intervenção</option>
                                <option value="Devolutiva">Devolutiva</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="py-2.5 px-5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium">Cancelar</button>
                        <button type="submit" className="py-2.5 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg transition-all">{initialData ? 'Atualizar' : 'Salvar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">Deseja excluir?</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-center mt-6 space-x-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors">Cancelar</button>
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-lg transition-colors">Sim, Excluir</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MinhaAgenda: React.FC<MinhaAgendaProps> = ({ appointments, onAddAppointment, onEditAppointment, onDeleteAppointment }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [appointmentToDeleteId, setAppointmentToDeleteId] = useState<string | null>(null);

    const groupedAppointments = useMemo(() => {
        const sorted = [...appointments].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
        return sorted.reduce((acc: Record<string, Appointment[]>, appointment) => {
            const dateKey = appointment.dateTime.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(appointment);
            return acc;
        }, {} as Record<string, Appointment[]>);
    }, [appointments]);

    const handleWhatsAppClick = async (appointment: Appointment) => {
        if (!appointment.whatsapp) return;
        const waWindow = window.open('about:blank', '_blank');
        if (waWindow) waWindow.document.write('<p style="font-family: sans-serif; text-align: center; margin-top: 50px;">Preparando link...<br>Aguarde.</p>');

        try {
            const baseUrl = import.meta.env.VITE_PUBLIC_URL || 'https://psicuidar.vercel.app';
            const message = "Olá, " + appointment.studentName + "! Tudo bem?\n\n" +
                "Passando para lembrar do seu agendamento de " + appointment.sessionType + " no dia " + appointment.dateTime.toLocaleDateString('pt-BR') + " às " + appointment.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ".\n\n" +
                "Por favor, responda clicando em um dos links abaixo:\n\n" +
                "✅ CONFIRMAR:\n" + baseUrl + "/?token=" + appointment.confirmationToken + "&res=confirm\n\n" +
                "❌ CANCELAR:\n" + baseUrl + "/?token=" + appointment.confirmationToken + "&res=cancel\n\n" +
                "📅 REMARCAR:\n" + baseUrl + "/?token=" + appointment.confirmationToken + "&res=resched\n\n" +
                "*PSICUIDAR* - Sistema Próprio e Seguro 🛡️";

            const waUrl = "https://wa.me/55" + appointment.whatsapp.replace(/\D/g, '') + "?text=" + encodeURIComponent(message);
            
            await supabase.from('appointments').update({ is_viewed: false }).eq('id', appointment.id);
            if (waWindow) waWindow.location.href = waUrl;
            else window.location.href = waUrl;
        } catch (error) {
            if (waWindow) waWindow.close();
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Minha Agenda</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Organize seus atendimentos de forma simples.</p>
                </div>
                <button
                    onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }}
                    className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-bold"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Novo Agendamento
                </button>
            </div>

            <div className="space-y-8">
                {Object.keys(groupedAppointments).length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl shadow">Não há agendamentos cadastrados.</div>
                ) : (
                    Object.entries(groupedAppointments).map(([date, apps]) => (
                        <div key={date}>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">{date}</h3>
                            <div className="space-y-3">
                                {apps.map(app => (
                                    <div key={app.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md">
                                        <div className="flex items-center">
                                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 w-16 text-center">{app.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <div className="ml-4 border-l pl-4 border-gray-200 dark:border-gray-700">
                                                <h4 className="font-bold text-gray-900 dark:text-white">{app.studentName}</h4>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{app.sessionType}</span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {app.whatsapp && (
                                                <button onClick={() => handleWhatsAppClick(app)} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-sm transition-all">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                </button>
                                            )}
                                            <button onClick={() => { setEditingAppointment(app); setIsModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors dark:bg-blue-900/30 dark:text-blue-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                            <button onClick={() => { setAppointmentToDeleteId(app.id); setIsDeleteModalOpen(true); }} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors dark:bg-red-900/30 dark:text-red-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AgendaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(data) => { if (editingAppointment) onEditAppointment(editingAppointment.id, data); else onAddAppointment(data); setIsModalOpen(false); }} initialData={editingAppointment} />
            <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => { if (appointmentToDeleteId) { onDeleteAppointment(appointmentToDeleteId); setIsDeleteModalOpen(false); setAppointmentToDeleteId(null); } }} />
        </div>
    );
};

export default MinhaAgenda;
