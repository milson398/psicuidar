
import React from 'react';
import { ThemeColor } from '../../types';

interface SidebarProps {
  setActivePage: (page: string) => void;
  activePage: string;
  themeColor: ThemeColor;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; activeClass: string; textClass: string }> = ({ icon, label, isActive, onClick, activeClass, textClass }) => (
  <li className="my-1">
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center p-3 rounded-lg transition-all duration-300 ${isActive
        ? `${activeClass} shadow-lg`
        : `${textClass}`
        }`}
    >
      <div className={`${isActive ? 'text-white' : 'text-inherit'}`}>
        {icon}
      </div>
      <span className={`ml-4 font-medium ${isActive ? 'text-white' : 'text-inherit'}`}>{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ setActivePage, activePage, themeColor, isOpen, onClose }) => {

  // 1. Estilo do Container: Sempre padrão (Branco no Light, Cinza Escuro no Dark)
  // O painel NÃO muda mais de cor com o tema.
  const containerClass = 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700';

  // 2. Estilo do Item ATIVO (Botão): Assume a cor do tema
  const getActiveItemStyle = (color: ThemeColor) => {
    switch (color) {
      case 'black': return 'bg-gray-900 text-white';
      case 'gray': return 'bg-gray-600 text-white';
      case 'purple': return 'bg-purple-600 text-white';
      case 'green': return 'bg-green-600 text-white';
      case 'red': return 'bg-red-600 text-white';
      // Padrão (Azul)
      case 'blue': default: return 'bg-blue-600 text-white';
    }
  };

  // 3. Estilo do Item INATIVO: Sempre padrão
  const inactiveClass = 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white';

  // 4. Cor do Título (Logo): Assume a cor do tema
  const getTitleColorClass = (color: ThemeColor) => {
    switch (color) {
      case 'black': return 'text-gray-900 dark:text-white';
      case 'gray': return 'text-gray-600 dark:text-gray-300';
      case 'purple': return 'text-purple-600 dark:text-purple-400';
      case 'green': return 'text-green-600 dark:text-green-400';
      case 'red': return 'text-red-600 dark:text-red-400';
      // Padrão (Azul)
      case 'blue': default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const activeClass = getActiveItemStyle(themeColor);
  const titleColorClass = getTitleColorClass(themeColor);

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon /> },
    { label: 'Minha Agenda', icon: <CalendarIcon /> },
    { label: 'Relatórios Gerenciais', icon: <ChartBarIcon /> },
    { label: 'Avaliação', icon: <ClipboardCheckIcon /> },
    { label: 'Intervenção', icon: <PuzzleIcon /> },
    { label: 'Matrículas', icon: <UserGroupIcon /> },
    { label: 'Controle de Pagamentos', icon: <WhatsAppIcon /> },
    { label: 'Configurações', icon: <CogIcon /> },
  ];

  return (
    <>
      {/* Overlay para Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
            fixed inset-y-0 left-0 z-30 w-64 shadow-xl transform transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            ${containerClass}
            flex flex-col h-full
        `}>
        <div className="h-16 px-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h1 className={`text-2xl font-bold ${titleColorClass}`}>PsiCuidar</h1>
          {/* Botão fechar apenas mobile */}
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="p-4 overflow-y-auto flex-1 pb-20">
          <ul>
            {navItems.map(item => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={activePage === item.label}
                onClick={() => setActivePage(item.label)}
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
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ChartBarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const ClipboardCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
);
const PuzzleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
);
const CogIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default Sidebar;
