import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
    onLogout: () => void;
    userProfile: UserProfile;
    onMenuToggle: () => void;
    onNavigate: (page: string) => void;
    currentPage: string;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'success' | 'warning' | 'info' | 'error';
}

const initialNotifications: Notification[] = [
    { id: 1, title: 'Agendamento Confirmado', message: 'Maria Oliveira confirmou para amanhã às 10h.', time: '5 min atrás', read: false, type: 'success' },
    { id: 2, title: 'Lembrete de Relatório', message: 'Finalizar relatório de Carlos Pereira.', time: '1 hora atrás', read: false, type: 'warning' },
    { id: 3, title: 'Nova Mensagem', message: 'Mãe do Lucas enviou documentos.', time: '2 horas atrás', read: false, type: 'info' },
    { id: 4, title: 'Agendamento Cancelado', message: 'João Silva cancelou a sessão de hoje.', time: 'Ontem', read: true, type: 'error' },
];

const Header: React.FC<HeaderProps> = ({ onLogout, userProfile, onMenuToggle, onNavigate, currentPage }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Fechar dropdowns ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
            case 'warning': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
            case 'error': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
            default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
            case 'warning': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
            case 'error': return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
            default: return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        }
    };

    return (
        <header className="h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm z-20 relative transition-all duration-300">
            <div className="flex items-center">
                {/* Botão Menu Mobile */}
                <button
                    onClick={onMenuToggle}
                    className="md:hidden mr-3 p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>

                {/* Título Desktop */}
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">{currentPage}</h2>
                {/* Título Mobile */}
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 block sm:hidden">PsiCuidar</h2>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* NOTIFICAÇÕES */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 relative transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800 animate-pulse"></span>
                        )}
                    </button>

                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden z-50 animate-fade-in-up origin-top-right">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white">Notificações</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                        Marcar todas como lidas
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">Nenhuma notificação.</div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <div className="flex items-start">
                                                <div className={`flex-shrink-0 p-2 rounded-full mr-3 ${getIconColor(notification.type)}`}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                                                    </div>
                                                    <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="ml-2 flex-shrink-0">
                                                        <span className="block h-2 w-2 rounded-full bg-blue-600"></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 text-center border-t border-gray-100 dark:border-gray-700">
                                <button className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Ver histórico completo</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* PERFIL */}
                <div className="relative" ref={profileRef}>
                    <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-2 focus:outline-none group">
                        <div className="relative">
                            <img className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors" src={userProfile.photoUrl} alt="User" />
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                        </div>
                        {/* Correção: Agora flexível para aparecer no mobile também, ou apenas escondido em telas MUITO pequenas se necessário, mas aqui deixei sempre visível */}
                        <div className="flex flex-col items-start ml-1">
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors leading-tight">{userProfile.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{userProfile.role}</span>
                        </div>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl ring-1 ring-black ring-opacity-5 z-50 animate-fade-in-up origin-top-right">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Logado como</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userProfile.email}</p>
                            </div>
                            <ul className="py-1">
                                <li>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onNavigate('Configurações'); setProfileOpen(false); }}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Meu Perfil
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onNavigate('Configurações'); setProfileOpen(false); }}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <svg className="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Configurações
                                    </a>
                                </li>
                                <li className="border-t border-gray-100 dark:border-gray-700 mt-1">
                                    <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setProfileOpen(false); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        <svg className="mr-3 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sair do Sistema
                                    </a>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;