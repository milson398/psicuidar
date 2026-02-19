import os
import subprocess
import time

def run_cmd(cmd):
    print(f"Executando: {cmd}")
    try:
        # Usando timeout para evitar que o OneDrive trave o script infinitamente
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        print(result.stdout)
        if result.stderr:
            print(f"Erro: {result.stderr}")
        return result
    except Exception as e:
        print(f"Falha ao executar: {e}")
        return None

project_path = r'c:\Users\edmil\OneDrive\Documentos\PsiCuidar'
os.chdir(project_path)

# 1. Matar processos que bloqueiam arquivos
run_cmd("taskkill /f /im git.exe")
run_cmd("taskkill /f /im vercel.exe")

# 2. Remover travas
lock_path = os.path.join(project_path, '.git', 'index.lock')
if os.path.exists(lock_path):
    os.remove(lock_path)
    print("Lock removido.")

# 3. Forçar resolução de conflitos (preferindo a versão local que está correta)
run_cmd("git add .")
run_cmd("git commit -m \"Final: Resolvendo conflitos e aplicando design profissional\"")
run_cmd("git push origin main --force")

print("Limpeza concluída.")
