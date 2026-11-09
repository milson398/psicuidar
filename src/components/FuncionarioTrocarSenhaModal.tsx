import React, { FormEvent, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface FuncionarioTrocarSenhaModalProps {
  isFuncionario: boolean;
  funcionarioId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const changeProfessionalPassword = async (senhaAtual: string, novaSenha: string) => {
  const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !sessionUser?.email) {
    throw new Error('Sessão profissional inválida.');
  }

  const passwordVerifier = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
  const { data: { user: verifiedUser }, error: verificationError } =
    await passwordVerifier.auth.signInWithPassword({
      email: sessionUser.email,
      password: senhaAtual,
    });

  if (verificationError || verifiedUser?.id !== sessionUser.id) {
    throw new Error('A senha atual não confere.');
  }

  const { data: { user: currentUser }, error: currentSessionError } = await supabase.auth.getUser();
  if (currentSessionError || currentUser?.id !== sessionUser.id) {
    throw new Error('A sessão profissional foi alterada.');
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: novaSenha });
  if (updateError) throw updateError;
};

const FuncionarioTrocarSenhaModal: React.FC<FuncionarioTrocarSenhaModalProps> = ({
  isFuncionario,
  funcionarioId,
  onClose,
  onSuccess
}) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const clearPasswords = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmacao('');
  };

  const handleClose = () => {
    clearPasswords();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (isFuncionario && !funcionarioId) {
      setError('Não foi possível identificar sua conta. Saia e entre novamente.');
      return;
    }

    if (novaSenha !== confirmacao) {
      setError('A nova senha e a confirmação não são iguais.');
      return;
    }

    if (Array.from(novaSenha).length < 12 || new TextEncoder().encode(novaSenha).length > 72) {
      setError('A nova senha deve ter pelo menos 12 caracteres e no máximo 72 bytes.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isFuncionario) {
        const { data, error: requestError } = await supabase.functions.invoke('funcionario-trocar-senha', {
          body: {
            funcionarioId,
            senhaAtual,
            novaSenha,
            confirmacaoNovaSenha: confirmacao
          }
        });

        if (requestError || data?.success !== true) {
          throw new Error('Não foi possível trocar a senha.');
        }
      } else {
        await changeProfessionalPassword(senhaAtual, novaSenha);
      }

      clearPasswords();
      setIsSuccess(true);
      onSuccess();
    } catch (error) {
      if (error instanceof Error && error.message === 'Sessão profissional inválida.') {
        setError('Entre novamente com sua conta profissional do Supabase para trocar a senha.');
      } else if (error instanceof Error && error.message === 'A senha atual não confere.') {
        setError('A senha atual informada não confere.');
      } else {
        setError('Não foi possível trocar a senha. Confira os dados e tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
      >
        <h2 id="change-password-title" className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
          {isSuccess ? 'Senha alterada' : 'Trocar senha'}
        </h2>

        {isSuccess ? (
          <>
            <p className="mb-6 text-sm text-green-700 dark:text-green-300">
              Sua senha foi atualizada com sucesso.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Concluir
            </button>
          </>
        ) : isFuncionario && !funcionarioId ? (
          <>
            <p role="alert" className="mb-6 text-sm text-red-600 dark:text-red-400">
              Não foi possível identificar sua conta. Saia e entre novamente.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Fechar
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Senha atual
              <input
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                value={senhaAtual}
                onChange={(event) => setSenhaAtual(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Nova senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={novaSenha}
                onChange={(event) => setNovaSenha(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirmar nova senha
              <input
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </label>

            {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default FuncionarioTrocarSenhaModal;
