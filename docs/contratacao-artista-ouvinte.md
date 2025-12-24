# Especificação de API: Fluxo de Contratação entre Ouvinte e Artista

## Visão Geral
Este documento detalha o fluxo de contratação entre ouvinte e artista, os estados possíveis, os campos envolvidos e as rotas de API necessárias para implementar toda a lógica no backend. O objetivo é garantir que o backend aceite e envie todos os dados necessários para o frontend conduzir a negociação conforme o fluxo definido.

---

## 1. Estrutura do Objeto de Contratação (`Booking`)

```json
{
  "id": "string",
  "artistId": "string",
  "artistName": "string",
  "artistAvatar": "string",
  "listenerId": "string",
  "eventType": "string",
  "eventDate": "YYYY-MM-DD",
  "eventTime": "HH:mm",
  "duration": "number (horas)",
  "location": "string",
  "notes": "string",
  "status": "waiting_confirmation | waiting_payment | waiting_final_confirmation | completed | cancelled | incomplete",
  "totalPrice": "number",
  "createdAt": "ISODate",
  "listenerConfirmed": "boolean",
  "artistConfirmed": "boolean",
  "paymentDone": "boolean",
  "cancelledBy": "artist | listener | null"
}
```

### Estados possíveis (`status`):
- `waiting_confirmation`: Aguardando confirmação de ambos (ouvinte e artista)
- `waiting_payment`: Ambos confirmaram, aguardando pagamento do ouvinte
- `waiting_final_confirmation`: Pagamento feito, aguardando confirmações finais
- `completed`: Negociação fechada
- `cancelled`: Cancelada por qualquer um
- `incomplete`: Incompleta (alguém não confirmou)

---

## 2. Rotas de API Sugeridas

### 2.1. Criar Contratação
- **POST** `/api/bookings`
- **Body:**
```json
{
  "artistId": "string",
  "eventType": "string",
  "eventDate": "YYYY-MM-DD",
  "eventTime": "HH:mm",
  "duration": "number",
  "location": "string",
  "notes": "string"
}
```
- **Resposta:** Objeto `Booking` criado

### 2.2. Buscar Contratações
- **GET** `/api/bookings?artistId=...&listenerId=...&status=...`
- **Query Params:**
  - `artistId` (opcional)
  - `listenerId` (opcional)
  - `status` (opcional)
- **Resposta:** Lista de objetos `Booking`

### 2.3. Confirmar Contratação (Ouvinte ou Artista)
- **PATCH** `/api/bookings/:id/confirm`
- **Body:**
```json
{
  "role": "artist" | "listener"
}
```
- **Resposta:** Objeto `Booking` atualizado

### 2.4. Realizar Pagamento
- **PATCH** `/api/bookings/:id/pay`
- **Body:**
```json
{
  "paymentInfo": { /* dados do pagamento, se necessário */ }
}
```
- **Resposta:** Objeto `Booking` atualizado (`paymentDone: true`, status para `waiting_final_confirmation`)

### 2.5. Confirmar Finalização (Ouvinte ou Artista)
- **PATCH** `/api/bookings/:id/final-confirm`
- **Body:**
```json
{
  "role": "artist" | "listener"
}
```
- **Resposta:** Objeto `Booking` atualizado (se ambos confirmam, status vai para `completed`)

### 2.6. Cancelar Contratação
- **PATCH** `/api/bookings/:id/cancel`
- **Body:**
```json
{
  "role": "artist" | "listener",
  "reason": "string (opcional)"
}
```
- **Resposta:** Objeto `Booking` atualizado (`status: cancelled`, `cancelledBy`)

### 2.7. Marcar como Incompleto
- **PATCH** `/api/bookings/:id/incomplete`
- **Body:**
```json
{
  "reason": "string (opcional)"
}
```
- **Resposta:** Objeto `Booking` atualizado (`status: incomplete`)

---

## 3. Observações Importantes
- O backend deve garantir a transição correta dos estados, validando se as confirmações/pagamentos estão de acordo com o fluxo.
- O campo `listenerId` deve ser preenchido automaticamente pelo backend com base no usuário autenticado ao criar a contratação.
- O backend pode enviar notificações (websocket, email, etc) a cada transição de status.
- Todos os campos relevantes devem ser retornados nas respostas para manter o frontend sincronizado.

---

## 4. Exemplo de Ciclo Completo
1. Ouvinte cria contratação (`POST /api/bookings`)
2. Ambos confirmam (`PATCH /api/bookings/:id/confirm`)
3. Ouvinte paga (`PATCH /api/bookings/:id/pay`)
4. Ambos confirmam finalização (`PATCH /api/bookings/:id/final-confirm`)
5. Contratação é concluída (`status: completed`)
6. Em qualquer etapa, pode ser cancelada ou marcada como incompleta.

---

## 5. Possíveis Erros/Validações
- Não permitir confirmação/pagamento fora do estado correto
- Não permitir ações de usuário não participante
- Retornar mensagens claras de erro para o frontend

---

## 6. Futuras Extensões
- Histórico de mensagens/chat
- Avaliação pós-evento
- Integração com gateway de pagamento

---

> Dúvidas ou ajustes, alinhar com o time de frontend para garantir aderência ao fluxo real da aplicação.
