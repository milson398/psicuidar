import os
import subprocess
import time

def run_cmd(cmd):
    print(f"Executando: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        print(result.stdout)
        if result.stderr:
            print(f"Erro: {result.stderr}")
        return result
    except Exception as e:
        print(f"Falha ao executar: {e}")
        return None

# Caminho do projeto
project_path = r'c:\Users\edmil\OneDrive\Documentos\PsiCuidar'
os.chdir(project_path)

# 1. Limpar travas do Git
lock_path = os.path.join(project_path, '.git', 'index.lock')
if os.path.exists(lock_path):
    print("Removendo index.lock...")
    os.remove(lock_path)

# 2. Restaurar chaves no .env.local
env_content = """VITE_SUPABASE_URL="https://cqqhdboaxuroebbkbycs.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcWhkYm9heHVyb2ViYmtieWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODgwOTcsImV4cCI6MjA4NTk2NDA5N30.f5UMrrCn4mzi9pDgdey-1MfTtWOhX_knNuq8rIKb5No"
VITE_PUBLIC_URL="https://psicuidar.vercel.app"
"""
with open('.env.local', 'w') as f:
    f.write(env_content)
print(".env.local restaurado.")

# 3. Tentar limpar o Git
run_cmd("git add .")
run_cmd("git checkout .") # Forçar a volta para o HEAD se possível
run_cmd("git merge --abort")

# 4. Deploy forçado Vercel
print("Iniciando Deploy Vercel...")
run_cmd("npx -y vercel --prod --force --yes")
