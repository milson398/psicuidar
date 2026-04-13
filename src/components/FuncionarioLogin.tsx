import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginProps {
    onLoginSuccess: () => void;
}

const FuncionarioLogin: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: 'admin@psicuidar.com',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (authError) {
                // Se falhar no banco, mas for o admin padrão, permite acesso (fallback para demonstração local se necessário)
                if (formData.email === 'admin@psicuidar.com' && formData.password === 'administrador') {
                    onLoginSuccess();
                } else {
                    setError('Credenciais inválidas. Verifique seu e-mail e senha.');
                }
            } else {
                onLoginSuccess();
            }
        } catch (err) {
            setError('Erro ao conectar ao servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-[#0a0f1e] overflow-x-hidden">
            
            {/* LADO ESQUERDO: IMAGEM + INFO (Identical to Login.tsx and Screenshot) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
                {/* Imagem de Fundo */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1587&q=80"
                        alt="Background"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/80 to-slate-900/95 mix-blend-multiply"></div>
                </div>

                {/* Conteúdo Esquerdo */}
                <div className="relative z-10 flex flex-col justify-between w-full h-full p-16">
                    <div>
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="bg-blue-500/20 p-2 rounded-xl backdrop-blur-md border border-blue-400/30">
                                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <span className="text-3xl font-bold text-white tracking-tight">PsiCuidar</span>
                        </div>
                        <h2 className="text-5xl font-extrabold text-white leading-tight mb-4">
                            Gestão Completa para <br />
                            <span className="text-blue-400">Psicopedagogia</span>
                        </h2>
                        <p className="text-blue-100/70 text-lg max-w-md leading-relaxed">
                            Organize sua clínica, potencialize seus atendimentos e tenha mais tempo para o que realmente importa: seus alunos.
                        </p>
                    </div>

                    {/* Card "TUDO O QUE VOCÊ PRECISA" */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl max-w-lg">
                        <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
                            TUDO O QUE VOCÊ PRECISA
                        </h3>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                                </div>
                                <span className="text-gray-300 font-medium whitespace-nowrap">Dashboard</span>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                </div>
                                <span className="text-gray-300 font-medium whitespace-nowrap">Minha Agenda</span>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                                </div>
                                <span className="text-gray-300 font-medium whitespace-nowrap">Relatórios</span>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                                </div>
                                <span className="text-gray-300 font-medium whitespace-nowrap">Avaliação</span>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>
                                </div>
                                <span className="text-gray-300 font-medium whitespace-nowrap">Intervenção</span>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <span className="text-gray-300 font-medium whitespace-nowrap">Configurações</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-blue-300/40">
                        &copy; 2024 PsiCuidar Sistemas. Todos os direitos reservados.
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: FORMULÁRIO (Área do Funcionário) */}
            <div 
                className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-8 transition-colors duration-500"
                style={{ backgroundColor: '#11ba82' }}
            >
                <div className="w-full max-w-md space-y-8 bg-[#060b18]/10 p-10 rounded-3xl backdrop-blur-sm border border-white/10 shadow-2xl">
                    <div className="text-center">
                        <h2 className="text-4xl font-black tracking-tight text-white mb-2">
                            Área do Funcionário
                        </h2>
                        <p className="text-white/80 font-medium">
                            Acesse o portal da equipe PsiCuidar
                        </p>
                    </div>

                    <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-white mb-2 ml-1 uppercase tracking-wider opacity-90">
                                    E-mail de Acesso
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:bg-white/20 focus:ring-4 focus:ring-white/10 transition-all outline-none"
                                        placeholder="seuemail@exemplo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-white mb-2 ml-1 uppercase tracking-wider opacity-90">
                                    Senha
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="block w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:bg-white/20 focus:ring-4 focus:ring-white/10 transition-all outline-none shadow-inner"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-500 text-white text-sm font-bold shadow-lg animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-5 px-4 bg-white text-[#11ba82] text-xl font-black rounded-2xl shadow-2xl hover:bg-white/90 transform active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                            {isLoading ? 'Verificando...' : 'Acessar Portal'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-white/10">
                        <p className="text-sm text-white/60 font-medium tracking-wide">
                            Portal exclusivo para colaboradores PsiCuidar
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuncionarioLogin;