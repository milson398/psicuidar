import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface ProfessionalLoginProps {
  onLoginSuccess: () => void;
}

const ProfessionalLogin: React.FC<ProfessionalLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🔐 TENTA O LOGIN REAL NO SUPABASE
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        // Fallback apenas para o admin padrão se o Supabase falhar (bypass)
        if (email === 'admin@psicuidar.com' && password === 'administrador') {
          console.warn("Logado via bypass padrão.");
          onLoginSuccess();
          return;
        }
        throw authError;
      }
      
      onLoginSuccess();
    } catch (err: any) {
      setError('E-mail ou senha incorretos. Verifique seus dados.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#060b18] overflow-hidden"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
    >
      {/* LADO ESQUERDO: VISUAL */}
      <div 
        className="hidden lg:flex relative w-full h-full bg-slate-900 overflow-hidden border-r border-white/5"
        style={{ position: 'relative' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1587&q=80"
            alt="Profissional"
            className="w-full h-full object-cover opacity-40"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/80 to-slate-900/95 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full h-full p-16">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-500/20 p-2.5 rounded-xl backdrop-blur-md border border-blue-400/30">
                 <div className="w-8 h-8 text-blue-300">💡</div>
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">PsiCuidar</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Gestão Completa para <br />
              <span className="text-blue-400">Psicopedagogia</span>
            </h2>
            <p className="text-blue-100/80 text-lg max-w-md">
              Organize sua clínica e potencialize seus atendimentos com inteligência.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4">Tudo o que você precisa</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Dashboard', 'Relatórios', 'Intervenção', 'Agenda', 'Avaliação', 'Configurações'].map(item => (
                <div key={item} className="flex items-center text-white/80 text-sm space-x-2">
                  <span className="text-blue-400">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO */}
      <div 
        className="w-full flex flex-col items-center justify-center p-8 lg:p-24 bg-[#060b18]"
        style={{ minHeight: '100vh', backgroundColor: '#060b18' }}
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white">Área do Profissional</h1>
            <p className="text-gray-400 mt-2">Insira seus dados para acessar o sistema.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-mail Admin</label>
              <input
                type="email"
                required
                className="w-full bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
              <input
                type="password"
                required
                className="w-full bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center"
            >
              {loading ? 'Acessando...' : 'Acessar Sistema'}
            </button>
          </form>

          <div className="text-center pt-4">
            <a href="#" className="text-blue-400 text-sm hover:underline">Precisa de suporte técnico?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLogin;
