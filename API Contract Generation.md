# academo-api-contrato.md

## Visão geral

- **Base URL**: http://localhost:8080
- **Autenticação**: JWT via header HTTP:
  - `Authorization: Bearer <token>`
- **Formato**:
  - Requests/Responses (quase todos): `application/json`
  - Upload: `multipart/form-data`
  - Download: `application/octet-stream` (stream) com `Content-Disposition: inline`
- **Paginação**: endpoints que recebem `Pageable` aceitam query params padrão do Spring:
  - `page` (number, default `0`)
  - `size` (number, default `20` geralmente)
  - `sort` (string repetível, ex.: `sort=createdAt,desc`)
- **Roles/Permissões (método)**:
  - Muitos endpoints usam `@PreAuthorize`
  - Roles observadas:
    - `FREE`
    - `PREMIUM`
- **Endpoints públicos (permitAll no security config)**:
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/activate`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
  - `POST /payment/receive`
  - `GET /files/download/{fileId}`
  - Swagger: `/v3/api-docs/**`, `/swagger-ui/**`

---

## Convenções de tipos (para model Angular)

- `Integer` -> `number`
- `Long` -> `number`
- `BigDecimal` -> `number` (no máximo 2 casas decimais)
- `LocalDate` -> `string` (ISO `YYYY-MM-DD`)
- `LocalDateTime` -> `string` (ISO, ex.: `2026-04-18T23:11:00`)
- `boolean` / `Boolean` -> `boolean`
- `Page<T>` -> objeto de paginação do Spring (detalhado abaixo)

### Estrutura típica de `Page<T>` (Spring Data)
O backend retorna `org.springframework.data.domain.Page<T>`. Na prática, o JSON costuma conter (pode variar por configuração Jackson, mas normalmente é assim):

```json
{
  "content": [ /* T[] */ ],
  "pageable": { /* metadados */ },
  "totalElements": 0,
  "totalPages": 0,
  "last": true,
  "size": 20,
  "number": 0,
  "sort": { /* ... */ },
  "first": true,
  "numberOfElements": 0,
  "empty": true
}
```

No front, normalmente você modela pelo menos:
- `content: T[]`
- `totalElements: number`
- `totalPages: number`
- `number: number`
- `size: number`
- `first: boolean`
- `last: boolean`
- `empty: boolean`

---

## DTOs de erro/validação

### ExceptionDTO
```json
{
  "message": "string"
}
```

### ValidationErrors
```json
{
  "errors": {
    "fieldName": "mensagem de validação"
  }
}
```

---

# Módulo: Auth / Usuários (`/auth`)

## Endpoints

### `POST /auth/login` (Público)
- **Body**: [UserAuthDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/security/UserAuthDTO.java:5:0-11:1)
- **Response 200**: [LoginResponseDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/security/LoginResponseDTO.java:2:0-6:1)

**Request**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response**
```json
{
  "token": "string",
  "userId": 0,
  "username": "string"
}
```

---

### `POST /auth/register` (Público)
- **Body**: [RegisterDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/security/RegisterDTO.java:6:0-15:1)
- **Response 201**: sem body

**Request**
```json
{
  "name": "string",
  "password": "string",
  "email": "string"
}
```

---

### `POST /auth/activate?token=...` (Público)
- **Query param**:
  - `token: string`
- **Response 200**: [UserDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/user/UserDTO.java:6:0-23:1)

**Response**
```json
{
  "name": "string",
  "email": "string",
  "createdAt": "2026-04-18T23:11:00",
  "updatedAt": "2026-04-18T23:11:00",
  "storageUsage": 0
}
```

---

### `POST /auth/forgot-password` (Público)
- **Body**: [ForgotPasswordDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/security/ForgotPasswordDTO.java:5:0-10:1)
- **Response 200**: sem body

**Request**
```json
{
  "email": "string"
}
```

---

### `POST /auth/reset-password?token=...` (Público)
- **Query param**:
  - `token: string`
- **Body**: [ResetPasswordDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/security/ResetPasswordDTO.java:6:0-16:1)
- **Response 200**: sem body

**Request**
```json
{
  "newPassword": "string",
  "confirmNewPassword": "string"
}
```

## DTOs (Auth)

### UserAuthDTO
```json
{
  "email": "string",
  "password": "string"
}
```

### LoginResponseDTO
```json
{
  "token": "string",
  "userId": 0,
  "username": "string"
}
```

### RegisterDTO
```json
{
  "name": "string",
  "password": "string",
  "email": "string"
}
```

### ForgotPasswordDTO
```json
{
  "email": "string"
}
```

### ResetPasswordDTO
```json
{
  "newPassword": "string",
  "confirmNewPassword": "string"
}
```

### UserDTO
```json
{
  "name": "string",
  "email": "string",
  "createdAt": "2026-04-18T23:11:00",
  "updatedAt": "2026-04-18T23:11:00",
  "storageUsage": 0
}
```

---

# Módulo: Profile (`/profile`)

## Endpoints

### `GET /profile` (Auth: FREE|PREMIUM)
- **Response 200**: [ProfileDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/profile/ProfileDTO.java:4:0-8:1)

**Response**
```json
{
  "profile": { /* Profile entity - ver abaixo */ },
  "userUseStorage": 0
}
```

---

### `PUT /profile` (Auth: FREE|PREMIUM)
- **Body**: [UpdateProfileDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/profile/UpdateProfileDTO.java:8:0-14:1)
- **Response 200**: [ProfileDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/profile/ProfileDTO.java:4:0-8:1)

**Request**
```json
{
  "fullName": "string",
  "birthDate": "YYYY-MM-DD",
  "gender": "string"
}
```

## DTOs (Profile)

### UpdateProfileDTO
```json
{
  "fullName": "string",
  "birthDate": "YYYY-MM-DD",
  "gender": "string"
}
```

### ProfileDTO
> Observação: `ProfileDTO.profile` é a **entidade JPA [Profile](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/model/Profile.java:10:0-96:1)** (não um record DTO). O JSON final depende da serialização Jackson da entidade.

Campos da entidade [Profile](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/model/Profile.java:10:0-96:1) (com base em [com.academo.model.Profile](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/model/Profile.java:10:0-96:1)):
- `id: number`
- `fullName: string | null`
- `birthDate: string (YYYY-MM-DD) | null`
- `gender: string (1 char) | null`
- `createdAt: string (date-time)`
- `updatedAt: string (date-time)`
- `user` está marcado com `@JsonIgnore` → **não deve vir no JSON**

Estrutura esperada:
```json
{
  "profile": {
    "id": 0,
    "fullName": "string",
    "birthDate": "YYYY-MM-DD",
    "gender": "M",
    "createdAt": "2026-04-18T23:11:00",
    "updatedAt": "2026-04-18T23:11:00"
  },
  "userUseStorage": 0
}
```

---

# Módulo: Subjects / Matérias (`/subjects`)

## Endpoints

### `POST /subjects` (Auth: FREE|PREMIUM)
- **Body**: [CreateSubjectDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/subject/CreateSubjectDTO.java:4:0-9:1)
- **Response 201**: [SubjectDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/subject/SubjectDTO.java:8:0-47:1)

```json
{
  "name": "string",
  "description": "string"
}
```

---

### `GET /subjects` (Auth: FREE|PREMIUM) — paginado
- **Response 200**: `Page<SubjectDTO>`

---

### `GET /subjects/{subjectId}` (Auth: FREE|PREMIUM)
- **Path params**:
  - `subjectId: number`
- **Response 200**: [SubjectDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/subject/SubjectDTO.java:8:0-47:1)

---

### `PUT /subjects/{subjectId}` (Auth: FREE|PREMIUM)
- **Body**: [UpdateSubjectDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/subject/UpdateSubjectDTO.java:6:0-18:1)
- **Response 200**: [SubjectDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/subject/SubjectDTO.java:8:0-47:1)

---

### `DELETE /subjects/{subjectId}` (Auth: FREE|PREMIUM)
- **Response 204**: sem body

---

### `GET /subjects/in-group/{groupId}` (Auth: FREE|PREMIUM) — paginado
- **Path params**:
  - `groupId: number`
- **Response 200**: `Page<SubjectDTO>`
- **Observação importante**: o controller obtém `userId`, mas chama `service.findByGroup(groupId, pageable)` sem passar `userId`.

## DTOs (Subjects)

### CreateSubjectDTO
```json
{
  "name": "string",
  "description": "string"
}
```

### UpdateSubjectDTO
```json
{
  "name": "string",
  "description": "string",
  "passingGrade": 0,
  "calculationType": "MEDIA_ARITMETICA | MEDIA_PONDERADA",
  "isActive": true
}
```

### SubjectDTO
```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "isActive": true,
  "calculationType": "MEDIA_ARITMETICA | MEDIA_PONDERADA",
  "passingGrade": 0,
  "finalGrade": 0,
  "createdAt": "2026-04-18T23:11:00",
  "updatedAt": "2026-04-18T23:11:00"
}
```

---

# Módulo: Periods / Períodos (`/periods`)

## Endpoints

### `GET /periods/all/{subjectId}` (Auth: FREE|PREMIUM) — paginado
- **Response 200**: `Page<PeriodDTO>`

---

### `GET /periods/{subjectId}/{periodId}` (Auth: FREE|PREMIUM)
- **Path params**:
  - `subjectId: number` *(não é usado no service, mas faz parte da rota)*
  - `periodId: number`
- **Response 200**: [PeriodDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/period/PeriodDTO.java:9:0-28:1)

---

### `POST /periods` (Auth: FREE|PREMIUM)
- **Body**: [SavePeriodDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/period/SavePeriodDTO.java:6:0-18:1)
- **Response 201**: [PeriodDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/period/PeriodDTO.java:9:0-28:1)

---

### `PUT /periods/{periodId}` (Auth: FREE|PREMIUM)
- **Body**: [UpdatePeriodDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/period/UpdatePeriodDTO.java:6:0-18:1)
- **Response 200**: [PeriodDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/period/PeriodDTO.java:9:0-28:1)

---

### `DELETE /periods/{subjectId}/{periodId}` (Auth: FREE|PREMIUM)
- **Response 204**: sem body

## DTOs (Periods)

### SavePeriodDTO
```json
{
  "subjectId": 0,
  "name": "string",
  "grade": 0,
  "weight": 0
}
```

### UpdatePeriodDTO
```json
{
  "subjectId": 0,
  "name": "string",
  "grade": 0,
  "weight": 0
}
```

### PeriodDTO
```json
{
  "id": 0,
  "subjectId": 0,
  "name": "string",
  "grade": 0,
  "weight": 0,
  "activityTypeList": [ /* ActivityTypeDTO[] */ ]
}
```

---

# Módulo: Activity Types / Tipos de Atividade (`/activity-types`)

## Endpoints

### `GET /activity-types/all/{periodId}` (Auth: FREE|PREMIUM) — paginado
- **Response 200**: `Page<ActivityTypeDTO>`

---

### `GET /activity-types/{id}` (Auth: FREE|PREMIUM)
- **Response 200**: `ActivityTypeDTO`

---

### `POST /activity-types` (Auth: FREE|PREMIUM)
- **Body**: `SaveActivityTypeDTO`
- **Response 201**: `ActivityTypeDTO`

---

### `PUT /activity-types/{id}` (Auth: FREE|PREMIUM)
- **Body**: `UpdateActivityTypeDTO`
- **Response 200**: `ActivityTypeDTO`

---

### `DELETE /activity-types/{activityTypeId}` (Auth: FREE|PREMIUM)
- **Response 204**: sem body

## DTOs (Activity Types)

### SaveActivityTypeDTO
```json
{
  "name": "string",
  "description": "string",
  "periodId": 0
}
```

### UpdateActivityTypeDTO
```json
{
  "name": "string",
  "description": "string",
  "weight": 0,
  "periodId": 0
}
```

### ActivityTypeDTO
```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "weight": 0,
  "activities": [ /* ActivityDTO[] */ ],
  "periodId": 0,
  "createdAt": "2026-04-18T23:11:00",
  "updatedAt": "2026-04-18T23:11:00"
}
```

---

# Módulo: Activities / Atividades (`/activities`)

## Endpoints

### `GET /activities` (Auth: FREE|PREMIUM) — paginado
- **Response 200**: `Page<ActivityDTO>`

---

### `GET /activities/{activityId}` (Auth: FREE|PREMIUM)
- **Response 200**: `ActivityDTO`

---

### `GET /activities/by-subject/{subjectId}` (Auth: FREE|PREMIUM) — paginado
- **Response 200**: `Page<ActivityDTO>`

---

### `POST /activities` (Auth: FREE|PREMIUM)
- **Body**: `SaveActivityDTO`
- **Response 201**: `ActivityDTO`

---

### `PUT /activities/{activityId}` (Auth: FREE|PREMIUM)
- **Body**: `SaveActivityDTO`
- **Response 200**: `ActivityDTO`

---

### `DELETE /activities/{activityId}` (Auth: FREE|PREMIUM)
- **Response 204**: sem body

## DTOs (Activities)

### SaveActivityDTO
```json
{
  "activityDate": "YYYY-MM-DD",
  "name": "string",
  "description": "string",
  "grade": 0,
  "subjectId": 0,
  "activityTypeId": 0
}
```

### ActivityDTO
```json
{
  "id": 0,
  "activityDate": "YYYY-MM-DD",
  "name": "string",
  "grade": 0,
  "description": "string",
  "subjectName": "string",
  "activityTypeName": "string",
  "createdAt": "2026-04-18T23:11:00",
  "updateAt": "2026-04-18T23:11:00"
}
```

---

# Módulo: Groups / Grupos (`/groups`)

## Endpoints

### `GET /groups` (Auth: FREE|PREMIUM) — paginado
- **Response 200**: `Page<GroupDTO>`

---

### `GET /groups/{groupId}` (Auth: FREE|PREMIUM)
- **Response 200**: `GroupDTO`

---

### `POST /groups` (Auth: FREE|PREMIUM)
- **Body**: `CreateGroupDTO`
- **Response 201**: `GroupDTO`

---

### `PUT /groups/{groupId}` (Auth: FREE|PREMIUM)
- **Body**: `UpdateGroupDTO`
- **Response 200**: `GroupDTO`

---

### `DELETE /groups/{groupId}` (Auth: FREE|PREMIUM)
- **Response 204**: sem body

---

### `POST /groups/add-subject/{groupId}/{subjectId}` (Auth: FREE|PREMIUM)
- **Response 200**: `GroupDTO`

---

### `DELETE /groups/delete-subject/{groupId}/{subjectId}` (Auth: FREE|PREMIUM)
- **Response 200**: `GroupDTO`

---

### `PUT /groups/associate-subjects/{groupId}` (Auth: FREE|PREMIUM)
- **Body**: [AssociateSubjectsDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/group/AssociateSubjectsDTO.java:7:0-11:1)
- **Response 200**: `GroupDTO`

**Request**
```json
{
  "subjectsIds": [0]
}
```

## DTOs (Groups)

### CreateGroupDTO
```json
{
  "name": "string",
  "description": "string"
}
```

### UpdateGroupDTO
```json
{
  "name": "string",
  "description": "string",
  "isActive": true
}
```

### AssociateSubjectsDTO
```json
{
  "subjectsIds": [0]
}
```

### GroupDTO
```json
{
  "id": 0,
  "name": "string",
  "description": "string",
  "isActive": true,
  "createdAt": "2026-04-18T23:11:00",
  "updatedAt": "2026-04-18T23:11:00",
  "subjects": [ /* SubjectDTO[] */ ]
}
```

---

# Módulo: Flashcards (`/flashcards`)

> **Acesso**: todos os endpoints exigem `@PreAuthorize("hasRole('PREMIUM')")`

## Endpoints

### `GET /flashcards` — paginado
- **Response 200**: `Page<FlashcardDTO>`

---

### `GET /flashcards/all/{subjectId}`
- **Response 200**: `FlashcardDTO[]`

---

### `GET /flashcards/all/{subjectId}/{level}`
- **Response 200**: `FlashcardDTO[]`
- **Path param** `level` esperado como `string` representando o enum (ver `CardLevel` abaixo)

---

### `GET /flashcards/in-group/{groupId}?level=...`
- **Query param**:
  - `level` (opcional): `string`
- **Response 200**: `FlashcardDTO[]`

---

### `GET /flashcards/{flashcardId}`
- **Response 200**: `FlashcardDTO`

---

### `POST /flashcards`
- **Body**: `CreateFlashcardDTO`
- **Response 201**: `FlashcardDTO`

---

### `PUT /flashcards/{flashcardId}`
- **Body**: `UpdateFlashcardDTO`
- **Response 200**: `FlashcardDTO`

---

### `PATCH /flashcards/{flashcardId}`
- **Body**: `UpdateLevelDTO`
- **Response 200**: `FlashcardDTO`

---

### `DELETE /flashcards/{flashcardId}`
- **Response 204**: sem body

## DTOs (Flashcards)

### CreateFlashcardDTO
```json
{
  "subjectId": 0,
  "frontPart": "string",
  "backPart": "string"
}
```

### UpdateFlashcardDTO
```json
{
  "level": "FACIL | MEDIO | DIFICIL | MUITO_DIFICIL | SEM_NIVEL",
  "frontPart": "string",
  "backPart": "string"
}
```

### UpdateLevelDTO
```json
{
  "level": "FACIL | MEDIO | DIFICIL | MUITO_DIFICIL | SEM_NIVEL"
}
```

### FlashcardDTO
```json
{
  "id": 0,
  "subjectId": 0,
  "level": "FACIL | MEDIO | DIFICIL | MUITO_DIFICIL | SEM_NIVEL",
  "frontPart": "string",
  "backPart": "string",
  "createdAt": "2026-04-18T23:11:00",
  "updatedAt": "2026-04-18T23:11:00"
}
```

---

# Módulo: Files / Arquivos (`/files`)

## Endpoints

### `POST /files/upload-file/{subjectId}` (Auth: PREMIUM)
- **Content-Type**: `multipart/form-data`
- **Form field**:
  - `file: MultipartFile` (obrigatório)
- **Path param**:
  - `subjectId: number`
- **Response 201**: `FileDTO`

---

### `GET /files/download/{fileUUID}` (Auth: PREMIUM)
- **Path param**:
  - `fileUUID: string` (UUID)
- **Response 200**: *stream* (`InputStreamResource`)
  - Headers relevantes:
    - `Content-Type: <mimeType>`
    - `Content-Disposition: inline; filename="<fileName>"`

---

### `DELETE /files/delete/{uuid}` (Auth: PREMIUM)
- **Response 204**: sem body

---

### `GET /files/{subjectId}` (Auth: FREE|PREMIUM) — paginado
- **Response 200**: `Page<FileDTO>`

## DTOs (Files)

### FileDTO
```json
{
  "uuid": "string",
  "fileName": "string",
  "path": "string",
  "fileType": "string",
  "size": 0,
  "subjectId": 0,
  "createdAt": "2026-04-18T23:11:00"
}
```

---

# Módulo: Payment (`/payment`)

## Endpoints

### `POST /payment` (Auth: FREE|PREMIUM)
- **Body**: [PaymentOptionsDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/payment/PaymentOptionsDTO.java:7:0-13:1)
- **Response 200**: [PaymentLinkDTO](file:///home/fabio-britto/Programacao/Academo/src/main/java/com/academo/controller/dtos/payment/PaymentLinkDTO.java:9:0-28:1)

**Request**
```json
{
  "billingType": "BOLETO | CREDIT_CARD | PIX",
  "chargeType": "DETACHED | RECURRENT | INSTALLMENT",
  "subscriptionCycle": "MONTHLY | YEARLY"
}
```

**Response**
```json
{
  "id": "string",
  "name": "string",
  "value": 0,
  "active": true,
  "chargeType": "DETACHED | RECURRENT | INSTALLMENT",
  "url": "string",
  "billingType": "BOLETO | CREDIT_CARD | PIX",
  "subscriptionCycle": "MONTHLY | YEARLY",
  "description": "string",
  "date": "YYYY-MM-DD",
  "deleted": false,
  "viewCount": 0,
  "maxInstallmentCount": 0,
  "dueDateLimitDays": 0,
  "notificationEnabled": false,
  "isAddressRequired": false,
  "externalReference": "string"
}
```

---

### `POST /payment/receive` (Público)
- **Consumes**: `application/json`
- **Body**: `Map<String, Object>` (payload livre / webhook gateway)
- **Response 200**: sem body

> Para o front Angular, geralmente você **não consome** esse endpoint (é callback do gateway).

---

### `GET /payment` (Auth: FREE|PREMIUM) — paginado
- **Response 200**: `Page<PaymentHistoryDTO>`

---

### `POST /payment/cancel` (Auth: PREMIUM)
- **Response 200**: sem body

## DTOs (Payment)

### PaymentOptionsDTO
```json
{
  "billingType": "BOLETO | CREDIT_CARD | PIX",
  "chargeType": "DETACHED | RECURRENT | INSTALLMENT",
  "subscriptionCycle": "MONTHLY | YEARLY"
}
```

### PaymentLinkDTO
```json
{
  "id": "string",
  "name": "string",
  "value": 0,
  "active": true,
  "chargeType": "DETACHED | RECURRENT | INSTALLMENT",
  "url": "string",
  "billingType": "BOLETO | CREDIT_CARD | PIX",
  "subscriptionCycle": "MONTHLY | YEARLY",
  "description": "string",
  "date": "YYYY-MM-DD",
  "deleted": false,
  "viewCount": 0,
  "maxInstallmentCount": 0,
  "dueDateLimitDays": 0,
  "notificationEnabled": false,
  "isAddressRequired": false,
  "externalReference": "string"
}
```

### PaymentHistoryDTO
```json
{
  "paymentHistoryId": 0,
  "paymentId": "string",
  "paymentStatus": "PAID | WAITING_PAYMENT | EXPIRED | CANCELED",
  "value": 0,
  "planDueDate": "YYYY-MM-DD",
  "createdAt": "2026-04-18T23:11:00",
  "updatedAt": "2026-04-18T23:11:00"
}
```

---

## Enums consolidados (para o front)

### CalculationType (Subjects)
- `MEDIA_ARITMETICA`
- `MEDIA_PONDERADA`

### CardLevel (Flashcards)
- `FACIL`
- `MEDIO`
- `DIFICIL`
- `MUITO_DIFICIL`
- `SEM_NIVEL`

### BillingType (Payment)
- `CREDIT_CARD`

### ChargeType (Payment)
- `RECURRENT`

### SubscriptionCycle (Payment)
- `MONTHLY`
- `YEARLY`

### PaymentStatus (PaymentHistory)
- `PAID`
- `WAITING_PAYMENT`
- `EXPIRED`
- `CANCELED`

### PlanType (interno / paymentHistory creation, não exposto diretamente em controllers atuais)
- `FREE`
- `MONTHLY_RECURRENT`
- `YEARLY_RECURRENT`

---

## Observações importantes para geração de services Angular

- **Authorization**:
  - Todos os endpoints (exceto os públicos listados) exigem `Authorization: Bearer`.
- **Paginação**:
  - Sempre que retornar `Page<T>`, implemente no service suporte a `page`, `size`, `sort`.
- **Upload**:
  - `POST /files/upload-file/{subjectId}` envia `FormData` com `file`.
- **Download**:
  - `GET /files/download/{fileUUID}` retorna stream; no Angular use `responseType: 'blob'`.

---
