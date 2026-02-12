# PsiCuidar - Sistema de Gestão para Psicopedagogia

O **PsiCuidar** é uma plataforma completa desenvolvida para facilitar a gestão clínica de psicopedagogos, oferecendo ferramentas para agendamento, controle de alunos, relatórios gerenciais e integração inteligente com WhatsApp.

## 🚀 Funcionalidades Principais

- **Dashboard Inteligente**: Visão geral de atendimentos, faturamento e alertas.
- **Gestão de Agenda**: Cadastro, edição e acompanhamento de sessões.
- **Confirmação via WhatsApp**: Sistema automatizado de links para confirmação/cancelamento por parte dos alunos.
- **Relatórios Gerenciais**: Análise de produtividade e financeira.
- **Interface Moderna**: Design responsivo com suporte a Dark Mode.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS.
- **Backend/Database**: Supabase.
- **Comunicação**: Integração com WhatsApp.
- **Tunneling**: Tunnelmole (para acesso externo local).

## 💻 Como Rodar Localmente

### Pré-requisitos
- Node.js instalado.
- Conta no Supabase.

### Passos
1. **Clone o repositório**:
   ```bash
   git clone https://github.com/[SEU-USUARIO]/psicuidar.git
   ```
2. **Instale as dependências**:
   ```bash
   npm install
   ```
3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env.local` na raiz com as chaves do seu Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_chave
   VITE_PUBLIC_URL=seu_link_tunnelmole
   ```
4. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

---
Desenvolvido com foco na eficiência técnica e no cuidado humanizado.
