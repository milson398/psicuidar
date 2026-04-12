import React from "react";

const FuncionarioLogin = ({ onLoginSuccess }: any) => {
  return (
    <div className="flex min-h-screen w-full">

      {/* ESQUERDA (IMAGEM INSTITUCIONAL) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1587&q=80"
          alt="Psicopedagoga"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        
        {/* Informações do Sistema (Lado Esquerdo) */}
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
            <h1 className="text-4xl font-bold mb-4">PsiCuidar</h1>
            <p className="text-xl text-blue-100">Gestão completa para profissionais de Psicopedagogia.</p>
        </div>
      </div>

      {/* DIREITA (LOGIN - ÁREA DO PROFISSIONAL) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-900 p-8">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">
                Área do Profissional
            </h2>
            <p className="text-gray-400 mt-2">Acesse sua conta para gerenciar seus atendimentos.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="Ex: profissional@psicuidar.com"
                className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
              <input
                type="password"
                placeholder="********"
                className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={onLoginSuccess}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded text-white font-semibold transition-colors mt-6"
            >
              Acessar Sistema
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

export default FuncionarioLogin;