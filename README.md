# 🧾 Cipherpath Fiscal Engine - Frontend

## 📖 Descrição do Projeto

O **Cipherpath Fiscal Engine** é a interface de utilizador (Frontend) de uma plataforma corporativa para a gestão e comunicação de documentos fiscais com a Administração Geral Tributária (AGT). O sistema permite consultar faturas, enviar documentos, validar informações e gerir o perfil e configurações das séries fiscais de forma centralizada e intuitiva.

## 🚀 Tecnologias Utilizadas

A aplicação foi desenvolvida seguindo as melhores práticas modernas de desenvolvimento web:

- **React 18 & TypeScript:** Para a criação de interfaces reativas e código seguro, tipado estaticamente.
- **Vite:** Ferramenta de build rápida e eficiente.
- **Tailwind CSS & Shadcn UI:** Para estilização e componentes de UI modernos, consistentes e com suporte nativo a responsividade e Dark Mode.
- **Zustand:** Gerenciamento de estado global leve e extremamente rápido (utilizado para store de requisições e autenticação).
- **React Query (TanStack Query):** Para o gerenciamento do estado do lado do servidor, cache, sincronização e _polling_ de requisições assíncronas.
- **Axios:** Para requisições HTTP seguras à API.
- **React Router DOM:** Para o roteamento das páginas no modelo Single Page Application (SPA).
- **Lucide React:** Biblioteca de ícones elegantes.

## 📂 Organização de Pastas

A estrutura do projeto foi pensada para garantir escalabilidade e fácil manutenção:

```text
src/
├── app/          # View Components e páginas do sistema (ex: Dashboard, Faturas, Perfil, Autenticação)
├── components/   # Componentes reutilizáveis (UI global, Layouts, ThemeToggle)
├── constants/    # Constantes da aplicação (ex: itens de navegação)
├── hooks/        # Custom Hooks (ex: useAgtPolling, useAuth)
├── lib/          # Utilitários globais e configurações de bibliotecas externas (ex: api.ts, utils.ts)
├── schemas/      # Definição e validação de estruturas de dados (Zod, tipos TS)
├── service/      # Camada de comunicação com a API (funções de fetch)
└── stores/       # Lógica de estado global do Zustand
```

## 🏗️ Arquitetura Usada e Vantagens

A arquitetura do projeto baseia-se numa forte **Separação de Preocupações (Separation of Concerns)** e **Componentização**:

- **Serviços Isolados:** A comunicação com o Backend está toda concentrada na pasta `service`, separando as chamadas HTTP dos componentes visuais.
- **Gestão de Estado Desacoplada:** O uso do Zustand para estados globais (como a fila de pedidos à AGT) e do React Query para cache de dados assíncronos tira a complexidade do ciclo de vida dos componentes.
- **Componentes de UI Modulares:** Através do padrão introduzido pelo _Shadcn UI_, os componentes de baixo nível são totalmente independentes e altamente personalizáveis.

**Vantagens:**

- **Escalabilidade:** Novas páginas e funcionalidades podem ser adicionadas sem impacto em módulos existentes.
- **Manutenção Simplificada:** A localização de bugs torna-se previsível.
- **Experiência de Utilizador (UX):** Graças à arquitetura reativa com React Query e Zustand, a plataforma fornece _feedback_ em tempo real (como o _polling_ de resposta da AGT) sem bloquear a interface.

## ⚙️ Como Executar o Projeto

Siga os passos abaixo para configurar e rodar o projeto na sua máquina local:

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd cipherpah-frontend
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto e defina a URL da API do Backend:

```env
VITE_API_URL=http://localhost:3000/api
```

_(Altere o valor para a URL correspondente ao seu ambiente de desenvolvimento backend)._

### 4. Rodar o Projeto

```bash
npm run dev
```

O projeto estará disponível no endereço indicado no terminal (por norma, `http://localhost:5173`).

## ✍️ Autor

**Desenvolvido por:**
Romeu Cajamba  
📧 Email: [romeucajamba@gmail.com](mailto:romeucajamba@gmail.com)
