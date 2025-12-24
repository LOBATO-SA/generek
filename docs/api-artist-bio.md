# API - Bio do Artista

Documentação da rota para salvar/atualizar as informações da Bio do artista.

---

## ✅ Status

**Criei e configurei tudo conforme as especificações.**

### Endpoints Implementados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `PUT` | `/api/artists/bio` | Atualizar Bio - Campos: genres, location, minPrice, about, eventTypes. **Regra: Apenas artistas podem usar.** |
| `GET` | `/api/artists/bio` | Ver Bio - Retorna a bio do usuário logado (artista ou ouvinte). |

---

## Endpoint

```
PUT /api/artists/bio
```

## Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

## Body (JSON)

```json
{
  "genres": ["Pop", "Rock", "MPB"],
  "location": "São Paulo, SP",
  "minPrice": 500,
  "about": "Texto sobre a carreira, experiência, estilo musical...",
  "eventTypes": ["Casamento", "Aniversário", "Festa Corporativa"]
}
```

---

## Campos Detalhados

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `genres` | `string[]` | Array de gêneros musicais | Não |
| `location` | `string` | Localização do artista (cidade, estado) | Não |
| `minPrice` | `number` | Preço mínimo para apresentação (em KZ) | Não |
| `about` | `string` | Texto descritivo sobre o artista | Não |
| `eventTypes` | `string[]` | Tipos de eventos que o artista aceita | Não |

---

## Valores Possíveis

### Gêneros Musicais (`genres`)

- Pop
- Rock
- MPB
- Sertanejo
- Funk
- Pagode
- Samba
- Forró
- Eletrônica
- Jazz
- Blues
- Gospel
- Reggae
- Hip Hop
- Clássica
- Outro

### Tipos de Evento (`eventTypes`)

- Casamento
- Aniversário
- Festa Corporativa
- Show Privado
- Festival
- Bar/Restaurante
- Evento Religioso
- Formatura
- Outro

---

## Regras

- **Autenticação**: Requer token Bearer válido
- **Permissão**: Apenas o próprio artista pode atualizar sua bio
- **Validação**: O `minPrice` deve ser >= 0

---

## Respostas

### Sucesso (200)

```json
{
  "message": "Bio atualizada com sucesso",
  "bio": {
    "genres": ["Pop", "Rock", "MPB"],
    "location": "São Paulo, SP",
    "minPrice": 500,
    "about": "Texto sobre a carreira...",
    "eventTypes": ["Casamento", "Aniversário"]
  }
}
```

### Erro - Não Autenticado (401)

```json
{
  "message": "Token inválido ou expirado"
}
```

### Erro - Não Autorizado (403)

```json
{
  "message": "Apenas artistas podem atualizar a bio"
}
```

### Erro - Validação (400)

```json
{
  "message": "Preço mínimo deve ser maior ou igual a zero"
}
```

---

## Endpoint para Buscar Bio

```
GET /api/artists/bio
```

### Headers

```
Authorization: Bearer <token>
```

### Resposta (200)

```json
{
  "bio": {
    "genres": ["Pop", "Rock"],
    "location": "São Paulo, SP",
    "minPrice": 500,
    "about": "Texto sobre o artista...",
    "eventTypes": ["Casamento"]
  }
}
```

### Resposta - Bio não encontrada (200)

```json
{
  "bio": null
}
```
