import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ThemeColor } from '../types';

interface ConfiguracoesProps {
    userProfile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
    currentTheme: ThemeColor;
    onUpdateTheme: (color: ThemeColor) => void;
    currentBackground: ThemeColor;
    onUpdateBackground: (color: ThemeColor) => void;
}

const Configuracoes: React.FC<ConfiguracoesProps> = ({ 
    userProfile, 
    onUpdateProfile, 
    currentTheme, 
    onUpdateTheme,
    currentBackground,
    onUpdateBackground
}) => {
    const [formData, setFormData] = useState<UserProfile>(userProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(userProfile);
    }, [userProfile]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        onUpdateProfile(formData);
        alert('Perfil atualizado com sucesso!');
    };

    // Opções para a Barra Lateral e Botões (Tema)
    const themeOptions: { color: ThemeColor; label: string; bgClass: string; }[] = [
        { color: 'blue', label: 'Azul (Padrão)', bgClass: 'bg-blue-600' },
        { color: 'black', label: 'Preto', bgClass: 'bg-gray-900' },
        { color: 'gray', label: 'Cinza', bgClass: 'bg-gray-600' },
        { color: 'purple', label: 'Lilás', bgClass: 'bg-purple-600' },
        { color: 'green', label: 'Verde', bgClass: 'bg-green-600' },
        { color: 'red', label: 'Vermelho', bgClass: 'bg-red-600' },
    ];

    // Opções específicas para o Plano de Fundo (Tela)
    const backgroundOptions: { color: ThemeColor; label: string; bgClass: string; borderClass?: string }[] = [
        { color: 'blue', label: 'Azul', bgClass: 'bg-blue-600' },
        { color: 'black', label: 'Preto', bgClass: 'bg-gray-900' },
        { color: 'gray', label: 'Cinza', bgClass: 'bg-gray-500' },
        { color: 'purple', label: 'Roxo', bgClass: 'bg-purple-600' },
        { color: 'green', label: 'Verde', bgClass: 'bg-green-600' },
        { color: 'red', label: 'Vermelho', bgClass: 'bg-red-600' },
        { color: 'white', label: 'Branco', bgClass: 'bg-white', borderClass: 'border-gray-300' },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center lg:text-left">Configurações do Sistema</h1>

            {/* Layout: 1 coluna no mobile/tablet, 2 colunas no desktop (lg) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda: Perfil Profissional */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Perfil Profissional
                    </h2>
                    
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative w-24 h-24 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <img 
                                src={formData.photoUrl} 
                                alt="Perfil" 
                                className="w-full h-full rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-lg"
                            />
                            {/* Overlay com Ícone de Câmera */}
                            <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Clique na foto para alterar</p>
                    </div>

                    <form className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full p-2.5 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Especialidade / Cargo</label>
                            <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="mt-1 block w-full p-2.5 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full p-2.5 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registro Profissional</label>
                            <input type="text" value={formData.registry} onChange={(e) => setFormData({...formData, registry: e.target.value})} className="mt-1 block w-full p-2.5 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <button type="button" onClick={handleSaveProfile} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md hover:shadow-blue-500/30 transition-all">Salvar Alterações</button>
                    </form>
                </div>

                {/* Coluna Direita (ou Baixo no Tablet): Tema -> Fundo */}
                <div className="space-y-8">
                    
                    {/* 1. Personalização do TEMA (Destaques) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                         <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                            Personalização do Tema (Botões e Menu)
                        </h2>
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Escolha a cor de destaque:</p>
                            <div className="flex flex-wrap gap-4 mb-4">
                                {themeOptions.map((option) => (
                                    <button
                                        key={option.color}
                                        type="button"
                                        onClick={() => onUpdateTheme(option.color)}
                                        className={`w-10 h-10 rounded-full ${option.bgClass} shadow-md transform hover:scale-110 flex items-center justify-center transition-all ${currentTheme === option.color ? `ring-2 ring-offset-2 ring-gray-400 scale-110` : ''}`}
                                        title={option.label}
                                        aria-label={option.label}
                                    />
                                ))}
                            </div>
                            <button type="button" onClick={() => onUpdateTheme('blue')} className="text-sm text-blue-600 hover:underline font-medium">Restaurar Tema Padrão</button>
                        </div>
                    </div>

                    {/* 2. Personalização do FUNDO (Tela) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                         <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                            Personalização do Fundo (Tela)
                        </h2>
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Escolha a cor de fundo da área de trabalho:</p>
                            <div className="flex flex-wrap gap-4 mb-4">
                                {backgroundOptions.map((option) => (
                                    <button
                                        key={option.color}
                                        type="button"
                                        onClick={() => onUpdateBackground(option.color)}
                                        className={`w-10 h-10 rounded-full border-2 ${option.bgClass} ${option.borderClass || 'border-transparent'} shadow-sm transform hover:scale-110 flex items-center justify-center transition-all ${currentBackground === option.color ? `ring-2 ring-offset-2 ring-blue-400 scale-110` : ''}`}
                                        title={option.label}
                                        aria-label={option.label}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center space-x-2 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => onUpdateBackground('blue')} 
                                    className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md transition-colors font-semibold flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Restaurar Fundo Padrão
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;