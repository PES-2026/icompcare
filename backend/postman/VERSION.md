# 📬 SAP IComp API - Postman Collection & Version Tracking

## 📌 Metadados de Sincronização

| Campo | Valor |
| :--- | :--- |
| **Commit Base:** | `9dcc3479bcfe0b86365d781ac2173604719588ab` |
| **Branch:** | `develop` |
| **Data da Última Atualização:** | 19 de Agosto de 2026 |
| **Versão da API:** | `1.3.0` |
| **Total de Grupos:** | 11 pastas temáticas |
| **Total de Endpoints Documentados:** | 38 requisições |
| **Arquivo da Coleção:** | [`sap_icomp.postman_collection.json`](./sap_icomp.postman_collection.json) |

---

## 🚀 Como Importar e Usar no Postman

1. Abra o **Postman**.
2. Clique no botão **Import** (canto superior esquerdo).
3. Selecione o arquivo [`sap_icomp.postman_collection.json`](./sap_icomp.postman_collection.json).
4. A coleção **SAP IComp - Backend API** será carregada com todas as pastas e variáveis configuradas.

---

## 🔑 Credenciais Padrão do Seed & Injeção Automática de Token

Ao executar o seed do banco de dados (`npm run prisma:seed`), os seguintes dados são populados automaticamente:

### 👤 Usuário Pedagogo / Admin (Default no Postman)
- **E-mail:** `pedagogue@icomp.ufam.edu.br`
- **Senha:** `password123`
- **Nome:** Ana Lúcia Machado dos Santos
- **Matrícula:** `12345678`

### 🔄 Fluxo de Autenticação Automática
1. Execute a requisição **`1. Auth -> Login`** (já vem pré-preenchida com as credenciais acima).
2. Ao receber a resposta `200 OK`, o script pós-execução extrai o token JWT e armazena automaticamente na variável de coleção `{{accessToken}}`.
3. Todas as 37 rotas subsequentes passarão a enviar a autenticação automaticamente, sem necessidade de copiar e colar tokens.

---

## 📦 Dados do Seed Disponíveis para Testes

### 🎓 Cursos Criados pelo Seed:
- `Engenharia de Software` (Sigla: `ES`)
- `Ciência da Computação` (Sigla: `CC`)
- `Sistemas de Informação` (Sigla: `SI`)
- `Engenharia da Computação` (Sigla: `EC`)
- `Inteligência Artificial` (Sigla: `IA`)

### 📋 Tipos de Atendimento:
- `Orientação Pedagógica`
- `Acolhimento Pedagógico`
- `Adaptação Curricular`
- `Acompanhamento de Rendimento`

### 🩺 Diagnósticos (CID):
- `Transtorno do Espectro Autista` (Sigla: `TEA` / CID: `F84.0`)
- `Transtorno do Déficit de Atenção com Hiperatividade` (Sigla: `TDAH` / CID: `F90.0`)
- `Transtorno de Ansiedade Generalizada` (Sigla: `TAG` / CID: `F41.1`)
- `Dislexia` (Sigla: `DISLEXIA` / CID: `F81.0`)

---

## 📂 Grupos de Endpoints Incluídos

1. **`1. Auth`**: Login, Me, Logout, Forgot Password, Reset Password.
2. **`2. Account Requests`**: Solicitação de cadastro, listagem de pendentes e aprovação.
3. **`3. Users`**: Listagem, busca por ID, edição, atualização de senha, ativação e remoção lógica.
4. **`4. Students`**: Criação, listagem paginada, busca por ID, atualização e remoção.
5. **`5. Attendances`**: Registro de atendimentos, listagem geral e por estudante, atualização e remoção.
6. **`6. Attendance Types`**: CRUD completo de tipos/modalidades de atendimento.
7. **`7. Courses`**: Listagem pública e gerenciamento de cursos/coordenações.
8. **`8. Diagnoses`**: CRUD completo de diagnósticos e laudos (CID).
9. **`9. Availabilities`**: Prévia e criação de slots, consulta pública por pedagogo e remoções.
10. **`10. Appointments`**: Solicitação pública de agendamento, gestão pelo pedagogo (confirmação, cancelamento, remarcação) e gestão pública pelo discente via token.
11. **`11. Reports`**: Emissão de relatórios pedagógicos, consulta, edição e exclusão.
