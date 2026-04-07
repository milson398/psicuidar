import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface FuncionarioLoginProps {
    onLoginSuccess: (funcionarioData: any) => void;
}

const FuncionarioLogin: React.FC<FuncionarioLoginProps> = ({ onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showForgotHint, setShowForgotHint] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error: rpcError } = await supabase.rpc('login_funcionario_secure', {
                p_email: formData.email,
                p_senha: formData.password
            });

            if (rpcError) {
                console.error("Erro no login do funcionário:", rpcError);
                setError(rpcError.message || 'Credenciais inválidas ou acesso bloqueado.');
            } else if (data) {
                console.log("Funcionário logado com sucesso!", data);
                sessionStorage.setItem('psicuidar_funcionario_auth', JSON.stringify({
                    authenticated: true,
                    data: data
                }));
                onLoginSuccess(data);
            } else {
                setError('Credenciais inválidas.');
            }
        } catch (err: any) {
            setError('Ocorreu um erro ao tentar acessar o sistema.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900 overflow-x-hidden">
            {/* Lado Esquerdo */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1587&q=80"
                        alt="Psicopedagoga Profissional"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-slate-900/80 to-slate-900/95 mix-blend-multiply"></div>
                </div>
 
                <div className="relative z-10 flex flex-col justify-between w-full h-full p-12 lg:p-16">
                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-emerald-500/20 p-2.5 rounded-xl backdrop-blur-md border border-emerald-400/30">
                                <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            </div>
                            <span className="text-3xl font-bold text-white tracking-tight">PsiCuidar</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
                            Acesso de <br />
                            <span className="text-emerald-400">Funcionários</span>
                        </h2>
                        <p className="text-emerald-100/80 text-lg max-w-md leading-relaxed">
                            Acesse o sistema com as credenciais fornecidas pelo seu gestor responsável.
                        </p>
                    </div>
                </div>
            </div>
 
            {/* Lado Direito */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 lg:p-24 bg-gray-50 dark:bg-gray-900 min-h-screen overflow-y-auto pt-safe-area pt-6">
                <div className="w-full max-w-md space-y-8 my-auto mx-auto lg:mx-0">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-4">
                            <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Área do Funcionário
                        </h2>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    E-mail Institucional
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-gray-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Senha
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-red-700 bg-red-50 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-md ${isLoading ? 'opacity-80' : ''}`}
                        >
                            {isLoading ? 'Acessando...' : 'Acessar Sistema'}
                        </button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <a href="/" className="text-emerald-600 font-medium hover:underline">Voltar para Login de Gestor</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FuncionarioLogin;
