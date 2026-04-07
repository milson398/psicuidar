import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface FuncionarioLoginProps {
    onLoginSuccess: (funcionarioData: any) => void;
}

const FuncionarioLogin: React.FC<FuncionarioLoginProps> = ({ onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '' });

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
                setError(rpcError.message || 'Credenciais inválidas ou acesso bloqueado.');
            } else if (data) {
                localStorage.setItem('userType', 'funcionario');
                localStorage.setItem('psicuidar_pref_portal', 'funcionario');
                localStorage.setItem('psicuidar_funcionario_auth', JSON.stringify({ authenticated: true, data }));
                onLoginSuccess(data);
            } else {
                setError('Credenciais inválidas.');
            }
        } catch {
            setError('Ocorreu um erro ao tentar acessar o sistema.');
        } finally {
            setIsLoading(false);
        }
    };

    /* ── Estilos inline garantidos (independe do build do Tailwind) ── */
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        minHeight: '100vh',
    };

    const leftColStyle: React.CSSProperties = {
        width: '50%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        /* imagem como background: SEM position:absolute, SEM inset-0 */
        backgroundImage: 'url(https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1587&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f3226',
        backgroundBlendMode: 'multiply',
        flexShrink: 0,
    };

    const rightColStyle: React.CSSProperties = {
        width: '50%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        backgroundColor: '#ffffff',
        flexShrink: 0,
    };

    const formBoxStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: '400px',
    };

    return (
        <div style={containerStyle}>

            {/* ══════════════ COLUNA ESQUERDA – IMAGEM ══════════════ */}
            {/* "hidden lg:block" para esconder em mobile */}
            <div style={leftColStyle} className="hidden lg:flex">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(52,211,153,0.2)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(52,211,153,0.3)' }}>
                        <svg width="32" height="32" fill="none" stroke="#6ee7b7" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>PsiCuidar</span>
                </div>

                {/* Título */}
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>
                    Acesso de<br />
                    <span style={{ color: '#34d399' }}>Funcionários</span>
                </h2>
                <p style={{ color: 'rgba(209,250,229,0.8)', fontSize: '1rem', maxWidth: '380px', lineHeight: 1.6 }}>
                    Acesse o sistema com as credenciais fornecidas pelo seu gestor responsável.
                </p>
            </div>

            {/* ══════════════ COLUNA DIREITA – FORMULÁRIO ══════════════ */}
            <div style={rightColStyle} className="dark:bg-[#060b18]">
                <div style={formBoxStyle}>

                    {/* Ícone mobile */}
                    <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <svg width="48" height="48" fill="none" stroke="#059669" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>

                    {/* Cabeçalho */}
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}
                        className="dark:text-white">
                        Área do Funcionário
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>
                        Entre com seu e-mail e senha para acessar.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* E-mail */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '4px' }}
                                   className="dark:text-gray-300">
                                E-mail Institucional
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="seu@email.com"
                                style={{ display: 'block', width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                                className="dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:border-emerald-500"
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '4px' }}
                                   className="dark:text-gray-300">
                                Senha
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    style={{ display: 'block', width: '100%', padding: '12px 48px 12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#f9fafb', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:border-emerald-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Erro */}
                        {error && (
                            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        {/* Botão Entrar */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{ width: '100%', padding: '14px', backgroundColor: isLoading ? '#6ee7b7' : '#059669', color: '#fff', fontWeight: 700, fontSize: '1rem', borderRadius: '8px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
                        >
                            {isLoading ? 'Acessando...' : 'Acessar Sistema'}
                        </button>
                    </form>
                </div>
            </div>

        </div>
    );
};

export default FuncionarioLogin;
