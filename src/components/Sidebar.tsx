import React from 'react';
import { ThemeColor } from '../types';

interface SidebarProps {
  setActivePage: (page: string) => void;
  activePage: string;
  themeColor: ThemeColor;
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isFuncionario?: boolean;
  onLogout?: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; activeClass: string; textClass: string }> = ({ icon, label, isActive, onClick, activeClass, textClass }) => (
  <li className="my-1.5">
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center p-3.5 rounded-xl transition-all duration-300 min-h-[56px] ${isActive
        ? `${activeClass} shadow-xl`
        : `${textClass}`
        }`}
    >
      <div className={`${isActive ? 'text-white' : 'text-inherit'} flex-shrink-0`}>
        {icon}
      </div>
      <span className={`ml-4 text-base font-bold ${isActive ? 'text-white' : 'text-inherit'}`}>{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ setActivePage, activePage, themeColor, isOpen, onClose, userEmail, isFuncionario, onLogout }) => {

  const containerClass = 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700';

  const getActiveItemStyle = (color: ThemeColor) => {
    switch (color) {
      case 'black': return 'bg-gray-900 text-white';
      case 'gray': return 'bg-gray-600 text-white';
      case 'purple': return 'bg-purple-600 text-white';
      case 'green': return 'bg-green-600 text-white';
      case 'red': return 'bg-red-600 text-white';
      case 'blue': default: return 'bg-blue-600 text-white';
    }
  };

  const inactiveClass = 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white';

  const getTitleColorClass = (color: ThemeColor) => {
    switch (color) {
      case 'black': return 'text-gray-900 dark:text-white';
      case 'gray': return 'text-gray-600 dark:text-gray-300';
      case 'purple': return 'text-purple-600 dark:text-purple-400';
      case 'green': return 'text-green-600 dark:text-green-400';
      case 'red': return 'text-red-600 dark:text-red-400';
      case 'blue': default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const activeClass = getActiveItemStyle(themeColor);
  const titleColorClass = getTitleColorClass(themeColor);

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon /> },
    { label: 'Minha Agenda', icon: <CalendarIcon /> },
    { label: 'AvaliaÃ§Ã£o', icon: <ClipboardCheckIcon /> },
    { label: 'IntervenÃ§Ã£o', icon: <PuzzleIcon /> },
    { label: 'MatrÃ­culas', icon: <UserGroupIcon /> },
  ];

  if (!isFuncionario) {
    navItems.splice(2, 0, { label: 'RelatÃ³rios Gerenciais', icon: <ChartBarIcon /> });
    navItems.push({ label: 'Equipe', icon: <TeamIcon /> });
    navItems.push({ label: 'Controle de Pagamentos', icon: <CurrencyDollarIcon /> });
    navItems.push({ label: 'ConfiguraÃ§Ãµes', icon: <CogIcon /> });
  }

  // Adiciona botÃ£o Sair para todos
  navItems.push({ label: 'Sair do Sistema', icon: <LogoutIcon /> });

  if (userEmail === 'admin@psicuidar.com') {
    navItems.push({ label: 'Painel Admin', icon: <AdminShieldIcon /> });
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}
      <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 shadow-xl transform transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            ${containerClass}
            flex flex-col h-screen
        `}>
        <div className="h-16 pt-safe-area px-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h1 className={`text-xl font-bold ${titleColorClass}`}>PsiCuidar</h1>
          <button onClick={onClose} className="md:hidden mt-safe-area text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="pt-8 px-2 overflow-y-auto flex-1 pb-20 pb-safe-area scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600">
          <ul>
            {navItems.map(item => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={activePage === item.label}
                onClick={() => {
                  if (item.label === 'Sair do Sistema' && onLogout) {
                    onLogout();
                  } else {
                    setActivePage(item.label); if (window.innerWidth < 768) onClose();
                  }
                }}
                activeClass={activeClass}
                textClass={inactiveClass}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

// SVG Icons
const DashboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ChartBarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const ClipboardCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
);
const PuzzleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
);
const CogIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const UserGroupIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const TeamIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const CurrencyDollarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const AdminShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default Sidebar;
