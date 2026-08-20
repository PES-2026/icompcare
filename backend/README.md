# SAP IComp - Backend API

Backend do sistema SAP IComp, desenvolvido com **Node.js**, **Express**, **TypeScript** e **Prisma**. O projeto segue os princípios da **Clean Architecture** para garantir escalabilidade, testabilidade e manutenibilidade.

## 🚀 Tecnologias

- **Linguagem:** TypeScript
- **Runtime:** Node.js (v20+)
- **Framework Web:** Express v5
- **ORM:** Prisma (PostgreSQL 17)
- **Segurança:** JWT, Bcrypt, Role-Based Access Control (RBAC)
- **Linter/Formatter:** ESLint & Prettier
- **Testes:** Jest

## 🏛️ Arquitetura e Estrutura de Pastas

O projeto utiliza **Clean Architecture**, dividindo responsabilidades em camadas para garantir que a lógica de negócio seja independente de detalhes técnicos (como banco de dados ou frameworks).

### 📁 Estrutura de Pastas

```text
backend/
├── postman/               # Coleção do Postman e controle de versão de endpoints
│   ├── sap_icomp.postman_collection.json
│   └── VERSION.md
├── prisma/                # Schemas e migrações do PostgreSQL
├── src/
│   ├── domain/            # Camada central (Entities, Value Objects, Repositórios)
│   ├── application/       # Camada de orquestração (Use Cases e DTOs)
│   ├── infrastructure/    # Detalhes técnicos (Prisma, Nodemailer, Bcrypt, JWT)
│   └── presentation/      # Controllers, Middlewares e Rotas Express
│       └── server.ts      # Ponto de entrada e Composition Root
```

### 🧱 Camadas em Detalhes

1. **Domain:** Contém a verdade absoluta do sistema. Nenhuma alteração em bibliotecas externas deve afetar esta camada.
2. **Application:** Onde o fluxo de dados acontece. Ela recebe um DTO, chama o Domínio para processar e retorna uma resposta. Proibido acessar o banco de dados diretamente aqui.
3. **Infrastructure:** Onde o Prisma e serviços externos vivem.
4. **Presentation:** Onde o Express é configurado. É a camada responsável por entender o HTTP e delegar o trabalho para os Casos de Uso.

### Regra de Dependência
As dependências fluem apenas de fora para dentro. O Domínio nunca conhece a Aplicação, que nunca conhece a Infraestrutura. Isso é garantido por regras rigorosas de lint (`no-restricted-imports`).

---

## 📬 Coleção do Postman & Teste de Endpoints

Na pasta [`postman/`](postman/), disponibilizamos a coleção pronta para importação no Postman com **todos os 38 endpoints** da API mapeados e organizados.

### 📌 Arquivos Disponíveis
- [`postman/sap_icomp.postman_collection.json`](postman/sap_icomp.postman_collection.json): Arquivo de importação da coleção (v2.1.0).
- [`postman/VERSION.md`](postman/VERSION.md): Registro da versão de sincronização da API, commit de referência (`9dcc3479bcfe0b86365d781ac2173604719588ab`) e lista de recursos cobertos.

### 🔑 Injeção Automática de Token JWT
A coleção foi configurada com script de teste automático na rota `1. Auth -> Login`. Ao autenticar com sucesso, o script extrai o token e define a variável de coleção `{{accessToken}}`. Todas as requisições autenticadas herdam o token automaticamente sem necessidade de preenchimento manual.

---

## 🛠️ Configuração do Projeto

### Pré-requisitos
- **Node.js:** v20 ou superior.
- **Docker & Docker Compose:** Necessário para rodar o banco de dados PostgreSQL e outros serviços via infraestrutura containerizada.
- **Make (opcional):** Utilizado para simplificar comandos de orquestração.

### Configuração de Ambiente
1. Crie o arquivo `.env` na pasta `backend` baseando-se no `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Ajuste as variáveis de conexão:
   ```env
   DATABASE_URL="postgresql://prisma:prisma@localhost:5432/sapicomp_db?schema=public"
   ```

### Setup Local (via Docker)
1. **Subir o ambiente de desenvolvimento:**
   ```bash
   make compose ENVIRONMENT=develop
   ```
2. **Preparar o banco de dados (dentro da pasta /backend):**
   ```bash
   npm install
   npx prisma migrate dev
   npm run prisma:seed
   ```

### Execução Sem Docker (Manual)
1. Certifique-se de que o PostgreSQL está rodando.
2. Instale as dependências: `npm install`.
3. Rode as migrações: `npx prisma migrate dev`.
4. Inicie o servidor: `npm run dev`.

---

## 📜 Comandos Úteis

### Desenvolvimento
- `npm run dev`: Inicia o servidor em modo de desenvolvimento com hot-reload (`tsx`).
- `npm run build`: Compila o projeto de TypeScript para JavaScript na pasta `dist/`.
- `npm run start`: Inicia o servidor compilado (produção).

### Qualidade de Código (Linting)
- `npm run lint`: Verifica erros de linting, padrões de nomenclatura e regras arquiteturais.
- `npm run lint:fix`: Corrige automaticamente problemas de formatação e imports.

### Banco de Dados (Prisma)
- `npx prisma migrate dev`: Cria e aplica migrações de desenvolvimento.
- `npx prisma studio`: Abre a interface visual para explorar o banco de dados.
- `npm run prisma:seed`: Executa o script de sementes para popular o banco.
- `npm run db:deploy`: Aplica migrações pendentes e gera o cliente Prisma.

### Testes
- `npm run test`: Executa a suíte de testes com Jest.

---

## 📄 Licença
Este projeto está sob a licença ISC.
