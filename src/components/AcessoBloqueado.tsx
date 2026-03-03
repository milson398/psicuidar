import React from 'react';

interface AcessoBloqueadoProps {
    onLogout: () => void;
}

const AcessoBloqueado: React.FC<AcessoBloqueadoProps> = ({ onLogout }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white p-6 relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 border-t-red-500/30 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all duration-500 bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_40px_rgba(239,68,68,0.5)] transform group-hover:scale-110">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-black mb-4 tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                        Acesso Suspenso
                    </h2>

                    <p className="text-slate-300 text-lg font-medium leading-relaxed text-center mb-8">
                        Sua assinatura encontra-se temporariamente inativa. Por favor, regularize sua situação para voltar a utilizar o sistema.
                    </p>

                    <div className="flex flex-col gap-4">
                        <a
                            href="https://wa.me/5599999999999?text=Ol%C3%A1%2C%20gostaria%20de%20verificar%20minha%20assinatura%20do%20PsiCuidar."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02]"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.89-4.443 9.893-9.892.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.738-.975zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                            Falar com o Suporte
                        </a>

                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all hover:scale-[1.02]"
                        >
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sair do Sistema
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-sm">Tecnologia e Cuidado 💫</p>
                </div>
            </div>
        </div>
    );
};

export default AcessoBloqueado;
