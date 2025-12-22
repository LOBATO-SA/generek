# Especificação da API para o Backend do Generek

Este documento detalha os dados que o frontend envia e espera receber para as funcionalidades de autenticação. Use isso como guia para criar sua API.

## 1. Autenticação

### 1.1. Cadastro (Sign Up)

**Objetivo:** Criar um novo usuário e seu perfil associado.

*   **Método Sugerido:** `POST`
*   **Rota Sugerida:** `/api/auth/signup`

**Dados enviados pelo Frontend (JSON Body):**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha_segura_123",
  "fullName": "Nome Completo do Usuário",
  "userType": "listener" // ou "artist"
}
```

**Campos:**
*   `email` (string, obrigatório): Email do usuário.
*   `password` (string, obrigatório): Senha do usuário.
*   `fullName` (string, obrigatório): Nome completo para o perfil.
*   `userType` (string, obrigatório): Tipo de conta. Valores aceitos: `"artist"` ou `"listener"`.

**Resposta Esperada (Sucesso - 200/201):**

```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "usuario@exemplo.com",
    "user_metadata": {
      "full_name": "Nome Completo do Usuário",
      "user_type": "listener"
    }
  },
  "session": {
    "access_token": "jwt-token-aqui",
    "user": { ... } // Objeto user acima
  },
  "profile": {
    "id": "uuid-do-usuario",
    "email": "usuario@exemplo.com",
    "full_name": "Nome Completo do Usuário",
    "user_type": "listener",
    "created_at": "2023-10-27T10:00:00Z"
  }
}
```

---

### 1.2. Login (Sign In)

**Objetivo:** Autenticar um usuário existente.

*   **Método Sugerido:** `POST`
*   **Rota Sugerida:** `/api/auth/login`

**Dados enviados pelo Frontend (JSON Body):**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha_segura_123"
}
```

**Campos:**
*   `email` (string, obrigatório): Email do usuário.
*   `password` (string, obrigatório): Senha do usuário.

**Resposta Esperada (Sucesso - 200):**

```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "usuario@exemplo.com"
  },
  "session": {
    "access_token": "jwt-token-aqui",
    "user": { ... }
  },
  "profile": {
    "id": "uuid-do-usuario",
    "email": "usuario@exemplo.com",
    "full_name": "Nome Completo do Usuário",
    "user_type": "listener",
    "avatar_url": "url-opcional",
    "created_at": "..."
  }
}
```

---

### 1.3. Verificar Sessão (Get Session / Me)

**Objetivo:** Verificar se o token atual é válido e retornar os dados do usuário ao recarregar a página.

*   **Método Sugerido:** `GET`
*   **Rota Sugerida:** `/api/auth/me`
*   **Header:** `Authorization: Bearer <token>`

**Resposta Esperada (Sucesso - 200):**

Mesma estrutura do Login (User, Session, Profile).

---

## 2. Perfil

### 2.1. Atualizar Perfil

**Objetivo:** Atualizar dados do perfil do usuário.

*   **Método Sugerido:** `PUT` ou `PATCH`
*   **Rota Sugerida:** `/api/profile`
*   **Header:** `Authorization: Bearer <token>`

**Dados enviados pelo Frontend (JSON Body - Exemplo):**

```json
{
  "full_name": "Novo Nome",
  "avatar_url": "https://nova-imagem.com/foto.jpg"
}
```

**Nota:** O frontend envia um objeto `Partial<UserProfile>`, ou seja, apenas os campos que foram alterados.

---

## Tipos de Dados (Frontend Reference)

Para referência, estes são os tipos TypeScript que o frontend está usando atualmente (`src/types/index.ts`):

```typescript
export type UserType = 'artist' | 'listener'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: UserType
  avatar_url?: string
  created_at?: string
}
```
