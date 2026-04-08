export default function LoginFuncionario() {
  return (
    <div className="flex min-h-screen w-full">

      {/* LADO ESQUERDO - IMAGEM */}
      <div className="hidden lg:block w-1/2">
        <img
          src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1587&q=80"
          alt="Psicopedagoga"
          className="w-full h-full object-cover"
        />
      </div>

      {/* LADO DIREITO - FORMULÁRIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-900 p-8">

        <div className="w-full max-w-md">

          {/* TÍTULO */}
          <h2 className="text-3xl font-bold text-white mb-6">
            Área do Funcionário
          </h2>

          {/* INPUT EMAIL */}
          <input
            type="email"
            placeholder="E-mail institucional"
            className="w-full mb-4 p-3 rounded bg-gray-800 text-white outline-none"
          />

          {/* INPUT SENHA */}
          <input
            type="password"
            placeholder="Senha"
            className="w-full mb-6 p-3 rounded bg-gray-800 text-white outline-none"
          />

          {/* BOTÃO */}
          <button className="w-full bg-green-600 hover:bg-green-700 py-3 rounded text-white font-semibold">
            Acessar Sistema
          </button>

        </div>
      </div>

    </div>
  );
}