import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface FuncionarioLoginProps {
    onLoginSuccess: () => void;
}

const FuncionarioLogin: React.FC<FuncionarioLoginProps> = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error: authError } = await supabase.rpc('login_funcionario', {
                p_email: formData.email.trim(),
                p_senha: formData.password
            });

            if (authError) throw authError;

            if (data && data.success) {
                // Salva informações básicas no localStorage se necessário
                localStorage.setItem('psicuidar_user_role', 'funcionario');
                localStorage.setItem('psicuidar_user_nome', data.nome);
                onLoginSuccess();
            } else {
                setError('E-mail ou senha incorretos.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Erro ao realizar login. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex overflow-hidden">
            {/* LADO ESQUERDO: VISUAL */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden border-r border-white/5">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                        alt="Equipe"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#11ba82]/80 via-slate-900/90 to-slate-900 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between w-full h-full p-16">
                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-[#11ba82]/20 p-2.5 rounded-xl backdrop-blur-md border border-[#11ba82]/30">
                                <div className="w-8 h-8 text-[#11ba82]">🤝</div>
                            </div>
                            <span className="text-3xl font-bold text-white tracking-tight">PsiCuidar</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                            Portal do <br />
                            <span className="text-[#11ba82]">Colaborador</span>
                        </h2>
                        <p className="text-gray-300 text-lg max-w-md">
                            Acesse suas ferramentas de atendimento e colabore com a clínica de forma integrada.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <h3 className="text-sm font-semibold text-[#11ba82] uppercase tracking-wider mb-4">Seu Acesso Inclui</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center text-white/80 text-sm space-x-2">
                                    <span className="text-[#11ba82]">✓</span>
                                    <span>Minha Agenda</span>
                                </div>
                                <div className="flex items-center text-white/80 text-sm space-x-2">
                                    <span className="text-[#11ba82]">✓</span>
                                    <span>Avaliação</span>
                                </div>
                                <div className="flex items-center text-white/80 text-sm space-x-2">
                                    <span className="text-[#11ba82]">✓</span>
                                    <span>Intervenção</span>
                                </div>
                                <div className="flex items-center text-white/80 text-sm space-x-2">
                                    <span className="text-[#11ba82]">✓</span>
                                    <span>Matrículas</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400">
                             &copy; 2024 PsiCuidar Sistemas. Todos os direitos reservados.
                        </div>
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: FORMULÁRIO (Área do Funcionário) */}
            <div 
                className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-8 transition-colors duration-500"
                style={{ backgroundColor: '#11ba82' }}
            >
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20">
                    <div className="text-center">
                        <h2 className="text-4xl font-black tracking-tight text-[#11ba82] mb-2">
                            Área do Funcionário
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Acesse o portal da equipe PsiCuidar
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider">
                                    E-mail de Acesso
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#11ba82] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-[#11ba82]/10 focus:border-[#11ba82] transition-all outline-none"
                                        placeholder="seuemail@exemplo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wider">
                                    Senha
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#11ba82] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-[#11ba82]/10 focus:border-[#11ba82] transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#11ba82] transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-bold animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-5 px-4 bg-[#11ba82] text-white text-xl font-black rounded-2xl shadow-xl hover:bg-[#0ea371] transform active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                            {isLoading ? 'Verificando...' : 'Acessar Portal'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500 font-medium">
                            Portal exclusivo para colaboradores PsiCuidar
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuncionarioLogin;