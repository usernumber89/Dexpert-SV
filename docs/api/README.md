# API — Dexpert

## Base URL

```
https://dexpert.app/api
```

## Wompi (Pagos)

### `POST /api/wompi/webhook`

Webhook de Wompi para recibir notificaciones de transacciones.

- **Headers**: `wompi_hash` (HMAC-SHA256 del body)
- **Body**: `{ ResultadoTransaccion, IdTransaccion, EnlacePago: { IdentificadorEnlaceComercio } }`
- **Identificadores**:
  - `DEXPERT_BOOST_{studentId}_{random}` → activa boost de perfil
  - `DEXPERT_CERT_{certId}_{studentId}_{random}` → marca certificado como pagado
  - `DEXPERT_{plan}_{pymeId}_{random}` → plan PYME (growth, pro, etc.)
- **Respuestas**: `200 { success }`, `200 { duplicate }`, `400 { error }`, `401 { error }`

### `POST /api/wompi/checkout`

Crea un pago de plan PYME en Wompi.

- **Auth**: Requiere sesión de PYME
- **Body**: `{ plan: "growth" | "pro" | "enterprise" | "growthlight" }`
- **Respuesta**: `{ url: "https://checkout.wompi.sv/..." }`

### `POST /api/wompi/boost-checkout`

Crea un pago para boost de perfil de estudiante.

- **Auth**: Requiere sesión de estudiante
- **Respuesta**: `{ url: "https://checkout.wompi.sv/..." }`

### `POST /api/wompi/certificate-checkout`

Crea un pago para certificado.

- **Auth**: Requiere sesión de estudiante
- **Body**: `{ certificateId: string }`
- **Respuesta**: `{ url: "https://checkout.wompi.sv/..." }`

### `POST /api/wompi/portfolio-checkout`

Crea un pago para publicar portafolio.

- **Auth**: Requiere sesión de estudiante
- **Respuesta**: `{ url: "https://checkout.wompi.sv/..." }`

## Proyectos

### `GET /api/project`

Lista proyectos activos y publicados.

### `GET /api/project/[id]`

Detalle de un proyecto.

### `POST /api/project/[id]/apply`

Postular a un proyecto como estudiante.

- **Auth**: Requiere sesión de estudiante

### `GET /api/project/[id]/applications`

Lista postulaciones de un proyecto (PYME owner).

### `PUT /api/project/[id]/application/[appId]`

Actualizar estado de postulación (accept/reject).

## Admin

### `GET /api/admin/heartbeat`

Health check del servidor.

### `POST /api/admin/compute-snapshot`

Calcula snapshot de analytics (admin).

## Simulación

### `POST /api/simulation/start`

Inicia una simulación.

### `POST /api/simulation/chat`

Envía mensaje en simulación.

### `POST /api/simulation/evaluate`

Evalúa una simulación completada.

### `POST /api/simulation/change-request`

Gestiona solicitudes de cambio en simulación.

## AI

### `POST /api/ai/analyze-project`

Analiza un proyecto usando AI.

### `POST /api/ai/generate-project`

Genera un proyecto usando AI.

## Facturas

### `GET /api/invoices`

Lista facturas del PYME autenticado.

### `GET /api/invoices/[id]/pdf`

Genera PDF de factura.
